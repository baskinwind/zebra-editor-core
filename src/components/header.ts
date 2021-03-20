import ComponentFactory from ".";
import { IRawType } from "./component";
import Inline from "./inline";
import Block, { BlockType } from "./block";
import PlainText from "./plain-text";
import ContentCollection from "./content-collection";
import BaseBuilder from "../builder/base-builder";
import ComponentType from "../const/component-type";
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
    let children = super.createChildren(componentFactory, raw);

    let header = componentFactory.buildHeader(raw.headerType || "h1", "", raw.style, raw.data);
    header.add(0, ...children);
    return header;
  }

  static exchange(componentFactory: ComponentFactory, block: Block, args: any[] = []): Header[] {
    let headerType = args[0] || "h1";
    if (block instanceof Header && block.headerType === headerType) {
      return [block];
    }

    let newHeaderList = [];
    if (block instanceof ContentCollection) {
      let newHeader = componentFactory.buildHeader(
        headerType,
        "",
        block.decorate.copyStyle(),
        block.decorate.copyData(),
      );
      newHeader.style = styleMap[newHeader.headerType];
      newHeader.add(0, ...block.children);
      newHeaderList.push(newHeader);
    } else if (block instanceof PlainText) {
      let stringList = block.content.join("").split("\n");
      stringList.pop();
      stringList.forEach((each) => {
        newHeaderList.push(componentFactory.buildHeader(headerType, each));
      });
    }

    block.replaceSelf(...newHeaderList);
    return newHeaderList;
  }

  constructor(type: headerType, text?: string, style?: StoreData, data?: StoreData) {
    super(text, style, data);
    this.headerType = type;
    this.style = styleMap[type];
  }

  setHeader(type: headerType = "h1") {
    if (this.headerType === type) return;
    this.$emit("componentWillChange", this);
    this.headerType = type;
    this.style = styleMap[type];
    this.$emit("componentChanged", [this]);
  }

  exchangeTo(builder: BlockType, args: any[]): Block[] {
    if (builder === (this.constructor as BlockType)) {
      this.setHeader(args[0]);
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

  createEmpty() {
    return this.getComponentFactory().buildHeader(
      this.headerType,
      "",
      this.decorate.copyStyle(),
      this.decorate.copyData(),
    );
  }

  getType(): string {
    return `${this.type}>${this.headerType}`;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.headerType = this.headerType;
    return raw;
  }

  render(contentBuilder: BaseBuilder) {
    return contentBuilder.buildHeader(
      this.id,
      this.headerType,
      () => this.getChildren(contentBuilder),
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
  }
}

export default Header;
