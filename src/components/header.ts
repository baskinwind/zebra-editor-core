import { getComponentFactory } from ".";
import { IRawType, classType } from "./component";
import Inline from "./inline";
import Block from "./block";
import PlainText from "./plain-text";
import ContentCollection from "./content-collection";
import ComponentType from "../const/component-type";
import updateComponent from "../util/update-component";
import { getContentBuilder } from "../content";
import { storeData } from "../decorate";
import { initRecordState, recordMethod } from "../record/decorators";
import { ICollectionSnapshoot } from "./collection";

export type headerType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export interface IHeaderSnapshoot extends ICollectionSnapshoot<Inline> {
  headerType: headerType;
}

const styleMap = {
  h1: {
    fontSize: "32px"
  },
  h2: {
    fontSize: "24px"
  },
  h3: {
    fontSize: "20px"
  },
  h4: {
    fontSize: "16px"
  },
  h5: {
    fontSize: "14px"
  },
  h6: {
    fontSize: "12px"
  }
};

@initRecordState
class Header extends ContentCollection {
  type = ComponentType.header;
  headerType: headerType;
  data = {
    bold: true
  };

  static create(raw: IRawType): Header {
    let header = getComponentFactory().buildHeader(
      raw.headerType || "h1",
      "",
      raw.style,
      raw.data
    );
    let children = super.getChildren(raw);
    header.addChildren(children, 0, true);
    return header;
  }

  static exchangeOnly(block: Block, args: any[] = []): Header[] {
    let list = [];
    let headerType = args[0] || "h1";
    if (block instanceof Header && block.headerType === headerType) {
      list.push(block);
    } else if (block instanceof ContentCollection) {
      let newHeader = getComponentFactory().buildHeader(
        headerType,
        "",
        block.decorate.copyStyle(),
        block.decorate.copyData()
      );
      newHeader.style = styleMap[newHeader.headerType];
      newHeader.addChildren(block.children.toArray(), 0);
      list.push(newHeader);
    } else if (block instanceof PlainText) {
      let stringList = block.content.join("").split("\n");
      stringList.pop();
      [...stringList].forEach((item) => {
        list.push(getComponentFactory().buildHeader(headerType, item));
      });
    }
    return list;
  }

  constructor(
    type: headerType,
    text?: string,
    style?: storeData,
    data?: storeData
  ) {
    super(text, style, data);
    this.headerType = type;
    this.style = styleMap[type];
  }

  setHeader(type: headerType = "h1") {
    if (this.headerType === type) return;
    this.headerType = type;
    this.style = styleMap[type];
    updateComponent(this);
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
    return getComponentFactory().buildHeader(
      this.headerType,
      "",
      this.decorate.copyStyle(),
      this.decorate.copyData()
    );
  }

  @recordMethod
  exchangeTo(builder: classType, args: any[]): Block[] {
    // @ts-ignore
    if (builder === this.constructor && args[0]) {
      if (args[0] !== this.headerType) {
        this.setHeader(args[0]);
        return [this];
      }
      return [this];
    }
    return builder.exchange(this, args);
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

  render(onlyDecorate: boolean = false) {
    return getContentBuilder().buildParagraph(
      this.id,
      () => this.getContent(),
      this.decorate.getStyle(onlyDecorate),
      { ...this.decorate.getData(onlyDecorate), tag: this.headerType }
    );
  }
}

export default Header;
