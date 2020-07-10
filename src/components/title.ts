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

export type titleType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export interface ITitleSnapshoot extends ICollectionSnapshoot<Inline> {
  titleType: titleType;
}

const styleMap = {
  h1: {
    fontSize: "32px",
    fontWeight: "bold"
  },
  h2: {
    fontSize: "24px",
    fontWeight: "bold"
  },
  h3: {
    fontSize: "20px",
    fontWeight: "bold"
  },
  h4: {
    fontSize: "16px",
    fontWeight: "bold"
  },
  h5: {
    fontSize: "14px",
    fontWeight: "bold"
  },
  h6: {
    fontSize: "12px",
    fontWeight: "bold"
  }
};

@initRecordState
class Title extends ContentCollection {
  type = ComponentType.title;
  titleType: titleType;
  data = {
    bold: true
  };

  static create(raw: IRawType): Title {
    let title = getComponentFactory().buildTitle(
      raw.titleType || "h1",
      "",
      raw.style,
      raw.data
    );
    let children = super.getChildren(raw);
    title.addChildren(children, 0, true);
    return title;
  }

  static exchangeOnly(block: Block, args: any[] = []): Title[] {
    let list = [];
    let titleType = args[0] || "h1";
    if (block instanceof Title && block.titleType === titleType) {
      list.push(block);
    } else if (block instanceof ContentCollection) {
      let newTitle = getComponentFactory().buildTitle(titleType);
      newTitle.addChildren(block.children.toArray(), 0);
      list.push(newTitle);
    } else if (block instanceof PlainText) {
      let stringList = block.content.split("\n");
      if (stringList[stringList.length - 1].length === 0) {
        stringList.pop();
      }
      stringList.forEach((item) => {
        list.push(getComponentFactory().buildTitle(titleType, item));
      });
    }
    return list;
  }

  constructor(
    type: titleType,
    text?: string,
    style?: storeData,
    data?: storeData
  ) {
    super(text, style, data);
    this.titleType = type;
    this.style = styleMap[type];
  }

  setTitle(type: titleType = "h1") {
    if (this.titleType === type) return;
    this.titleType = type;
    this.style = styleMap[type];
    updateComponent(this);
  }

  getType(): string {
    return `${this.type}>${this.titleType}`;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.titleType = this.titleType;
    return raw;
  }

  createEmpty() {
    return getComponentFactory().buildTitle(
      this.titleType,
      "",
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }

  @recordMethod
  exchangeTo(builder: classType, args: any[]): Block[] {
    // @ts-ignore
    if (builder === this.constructor && args[0]) {
      if (args[0] !== this.titleType) {
        this.setTitle(args[0]);
        return [this];
      }
      return [this];
    }
    return builder.exchange(this, args);
  }

  snapshoot(): ITitleSnapshoot {
    let snap = super.snapshoot() as ITitleSnapshoot;
    snap.titleType = this.titleType;
    return snap;
  }

  restore(state: ITitleSnapshoot) {
    this.titleType = state.titleType;
    this.style = styleMap[state.titleType];
    super.restore(state);
  }

  render() {
    return getContentBuilder().buildParagraph(
      this.id,
      () => this.getContent(),
      this.decorate.getStyle(),
      { ...this.decorate.getData(), tag: this.titleType }
    );
  }
}

export default Title;
