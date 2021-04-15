import ComponentFactory from ".";
import { IRawType } from "./component";
import Inline from "./inline";
import Block, { BlockType } from "./block";
import PlainText from "./plain-text";
import ContentCollection from "./content-collection";
import BaseView from "../view/base-view";
import ComponentType from "../const/component-type";
import { StoreData } from "../decorate";
import { ICollectionSnapshoot } from "./collection";

export type HeadingType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export interface IHeadingSnapshoot extends ICollectionSnapshoot<Inline> {
  headingType: HeadingType;
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

class Heading extends ContentCollection {
  type = ComponentType.heading;
  headingType: HeadingType;
  data = {
    bold: true,
  };

  static create(componentFactory: ComponentFactory, raw: IRawType): Heading {
    let children = super.createChildren(componentFactory, raw);

    let heading = componentFactory.buildHeading(raw.headingType || "h1", "", raw.style, raw.data);
    heading.add(0, ...children);
    return heading;
  }

  static exchange(componentFactory: ComponentFactory, block: Block, args: any[] = []): Heading[] {
    let headingType = args[0] || "h1";
    if (block instanceof Heading && block.headingType === headingType) {
      return [block];
    }

    let newHeadingList = [];
    if (block instanceof ContentCollection) {
      let newHeading = componentFactory.buildHeading(
        headingType,
        "",
        block.decorate.copyStyle(),
        block.decorate.copyData(),
      );
      newHeading.style = styleMap[newHeading.headingType];
      newHeading.add(0, ...block.children);
      newHeadingList.push(newHeading);
    } else if (block instanceof PlainText) {
      let stringList = block.content.join("").split("\n");
      stringList.pop();
      stringList.forEach((each) => {
        newHeadingList.push(componentFactory.buildHeading(headingType, each));
      });
    }

    block.replaceSelf(...newHeadingList);
    return newHeadingList;
  }

  constructor(type: HeadingType, text?: string, style?: StoreData, data?: StoreData) {
    super(text, style, data);
    this.headingType = type;
    this.style = styleMap[type];
  }

  setHeading(type: HeadingType = "h1") {
    if (this.headingType === type) return;
    this.componentWillChange();
    this.headingType = type;
    this.style = styleMap[type];
    this.updateComponent([this]);
  }

  exchangeTo(builder: BlockType, args: any[]): Block[] {
    if (builder === (this.constructor as BlockType)) {
      this.setHeading(args[0]);
      return [this];
    }

    return builder.exchange(this.getComponentFactory(), this, args);
  }

  snapshoot(): IHeadingSnapshoot {
    let snap = super.snapshoot() as IHeadingSnapshoot;
    snap.headingType = this.headingType;
    return snap;
  }

  restore(state: IHeadingSnapshoot) {
    this.headingType = state.headingType;
    this.style = styleMap[state.headingType];
    super.restore(state);
  }

  createEmpty() {
    return this.getComponentFactory().buildHeading(
      this.headingType,
      "",
      this.decorate.copyStyle(),
      this.decorate.copyData(),
    );
  }

  getType(): string {
    return `${this.type}>${this.headingType}`;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.headingType = this.headingType;
    return raw;
  }

  render(contentView: BaseView) {
    return contentView.buildHeading(
      this.id,
      this.headingType,
      () => this.getChildren(contentView),
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
  }
}

export default Heading;
