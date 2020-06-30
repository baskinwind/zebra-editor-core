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
    fontSize: 32
  },
  h2: {
    fontSize: 24
  },
  h3: {
    fontSize: 20
  },
  h4: {
    fontSize: 16
  },
  h5: {
    fontSize: 14
  },
  h6: {
    fontSize: 12
  }
};

@initRecordState
class Title extends ContentCollection {
  type = ComponentType.title;
  titleType: titleType;

  static create(raw: IRawType): Title {
    let title = new Title(raw.titleType || "h1", "", raw.style, raw.data);
    let children = super.getChildren(raw);
    title.addChildren(children, 0, true);
    return title;
  }

  static exchangeOnly(block: Block, args: any[] = []): Title[] {
    let list = [];
    if (block instanceof ContentCollection) {
      let newTitle = new Title(args[0] || "h1");
      newTitle.addChildren(block.children.toArray(), 0);
      list.push(newTitle);
    } else if (block instanceof PlainText) {
      let stringList = block.content.split("\n");
      if (stringList[stringList.length - 1].length === 0) {
        stringList.pop();
      }
      stringList.forEach((item) => {
        list.push(new Title(args[0] || "h1", item));
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
    this.decorate.mergeData({
      bold: true
    });
    this.decorate.mergeStyle({
      fontWeight: "bold",
      fontSize: styleMap[type].fontSize + "px"
    });
  }

  @recordMethod
  exchangeTo(builder: classType, args: any[]): Block[] {
    if (builder === Title && args[0]) {
      if (args[0] !== this.titleType) {
        this.setTitle(args[0]);
        return [this];
      }
      return [this];
    }
    return builder.exchange(this, args);
  }

  setTitle(type: titleType = "h1") {
    if (this.titleType === type) return;
    this.titleType = type;
    this.decorate.mergeStyle(styleMap[type]);
    updateComponent(this);
  }

  createEmpty() {
    return new Title(
      this.titleType,
      "",
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }

  snapshoot(): ITitleSnapshoot {
    let snap = super.snapshoot() as ITitleSnapshoot;
    snap.titleType = this.titleType;
    return snap;
  }

  restore(state: ITitleSnapshoot) {
    this.titleType = state.titleType;
    super.restore(state);
  }

  getType(): string {
    return `${this.type}>${this.titleType}`;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.titleType = this.titleType;
    return raw;
  }

  render() {
    return getContentBuilder().buildParagraph(
      this.id,
      this.getContent(),
      this.decorate.getStyle(),
      { ...this.decorate.getData(), tag: this.titleType }
    );
  }
}

export default Title;
