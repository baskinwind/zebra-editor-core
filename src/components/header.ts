import ComponentFactory from ".";
import { IRawType } from "./component";
import Inline from "./inline";
import Block, { BlockType } from "./block";
import PlainText from "./plain-text";
import ContentCollection from "./content-collection";
import BaseBuilder from "../content/base-builder";
import ComponentType from "../const/component-type";
import updateComponent from "../util/update-component";
import { StoreData } from "../decorate";
import { ICollectionSnapshoot } from "./collection";

export type headerType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export interface IHeaderSnapshoot extends ICollectionSnapshoot<Inline> {
  headerType: headerType;
}

const styleMap = {
  h1: {
    fontSize: "32px",
  },
  h2: {
    fontSize: "24px",
  },
  h3: {
    fontSize: "20px",
  },
  h4: {
    fontSize: "16px",
  },
  h5: {
    fontSize: "14px",
  },
  h6: {
    fontSize: "12px",
  },
};

class Header extends ContentCollection {
  type = ComponentType.header;
  headerType: headerType;
  data = {
    bold: true,
  };

  static create(componentFactory: ComponentFactory, raw: IRawType): Header {
    let header = componentFactory.buildHeader(
      raw.headerType || "h1",
      "",
      raw.style,
      raw.data,
    );
    let children = super.getChildren(componentFactory, raw);
    header.addChildren(children, 0);
    return header;
  }

  static exchangeOnly(
    componentFactory: ComponentFactory,
    block: Block,
    args: any[] = [],
  ): Header[] {
    let list = [];
    let headerType = args[0] || "h1";
    if (block instanceof Header && block.headerType === headerType) {
      list.push(block);
    } else if (block instanceof ContentCollection) {
      let newHeader = componentFactory.buildHeader(
        headerType,
        "",
        block.decorate.copyStyle(),
        block.decorate.copyData(),
      );
      newHeader.style = styleMap[newHeader.headerType];
      newHeader.addChildren(block.children.toArray(), 0);
      list.push(newHeader);
    } else if (block instanceof PlainText) {
      let stringList = block.content.join("").split("\n");
      stringList.pop();
      [...stringList].forEach((item) => {
        list.push(componentFactory.buildHeader(headerType, item));
      });
    }
    return list;
  }

  constructor(
    type: headerType,
    text?: string,
    style?: StoreData,
    data?: StoreData,
  ) {
    super(text, style, data);
    this.headerType = type;
    this.style = styleMap[type];
  }

  setHeader(type: headerType = "h1") {
    if (this.headerType === type) return;
    this.headerType = type;
    this.style = styleMap[type];
    updateComponent(this.editor, this);
  }

  getType(): string {
    return `${this.type}>${this.headerType}`;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.headerType = this.headerType;
    return raw;
  }

  createEmpty() {
    return this.getComponentFactory().buildHeader(
      this.headerType,
      "",
      this.decorate.copyStyle(),
      this.decorate.copyData(),
    );
  }

  exchangeTo(builder: BlockType, args: any[]): Block[] {
    // 不知道为什么 if 内的 this 识别不了
    let self = this;
    if (builder === this.constructor && args[0]) {
      if (args[0] !== self.headerType) {
        self.setHeader(args[0]);
        return [this];
      }
      return [this];
    }

    return builder.exchange(this.getComponentFactory(), this, args);
  }

  snapshoot(): IHeaderSnapshoot {
    let snap = super.snapshoot() as IHeaderSnapshoot;
    snap.headerType = this.headerType;
    return snap;
  }

  restore(state: IHeaderSnapshoot) {
    this.headerType = state.headerType;
    this.style = styleMap[state.headerType];
    super.restore(state);
  }

  render(contentBuilder: BaseBuilder, onlyDecorate: boolean = false) {
    return contentBuilder.buildParagraph(
      this.id,
      () => this.getContent(contentBuilder),
      this.decorate.getStyle(onlyDecorate),
      { ...this.decorate.getData(onlyDecorate), tag: this.headerType },
    );
  }
}

export default Header;
