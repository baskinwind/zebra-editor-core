import Editor from "../editor";
import { JSONType } from "./component";
import Inline from "./inline";
import Block, { BlockType } from "./block";
import PlainText from "./plain-text";
import ContentCollection from "./content-collection";
import AbstractView from "../view/base-view";
import ComponentType from "../const/component-type";
import { CollectionSnapshoot } from "./collection";
import ComponentFactory from "../factory";

export enum HeadingEnum {
  h1 = "h1",
  h2 = "h2",
  h3 = "h3",
  h4 = "h4",
  h5 = "h5",
  h6 = "h6",
}

export interface HeadingSnapshoot extends CollectionSnapshoot<Inline> {
  headingType: HeadingEnum;
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
  headingType: HeadingEnum;
  data = {
    bold: true,
  };

  static create(componentFactory: ComponentFactory, json: JSONType): Heading {
    let children = super.createChildren(componentFactory, json);

    let heading = componentFactory.buildHeading(json.headingType || HeadingEnum.h1, "");
    heading.add(0, ...children);
    heading.modifyDecorate(json.style, json.data);
    return heading;
  }

  static exchange(componentFactory: ComponentFactory, block: Block, args: any[] = []): Heading[] {
    let headingType = args[0] || "h1";
    if (block instanceof Heading && block.headingType === headingType) {
      return [block];
    }

    let newHeadingList = [];
    if (block instanceof ContentCollection) {
      let newHeading = componentFactory.buildHeading(headingType, "");
      newHeading.modifyDecorate(block.decorate.copyStyle(), block.decorate.copyData());
      newHeading.style = styleMap[newHeading.headingType];
      newHeading.add(0, ...block.children);
      newHeadingList.push(newHeading);
    } else if (block instanceof PlainText) {
      let stringList = block.content.join("").split("\n");
      if (!stringList[stringList.length - 1]) {
        stringList.pop();
      }
      stringList.forEach((each) => {
        newHeadingList.push(componentFactory.buildHeading(headingType, each));
      });
    }

    block.replaceSelf(...newHeadingList);
    return newHeadingList;
  }

  constructor(type: HeadingEnum, text?: string, editor?: Editor) {
    super(text, editor);
    this.headingType = type;
    this.style = styleMap[type];
  }

  setHeading(type: HeadingEnum = HeadingEnum.h1) {
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

  snapshoot(): HeadingSnapshoot {
    let snap = super.snapshoot() as HeadingSnapshoot;
    snap.headingType = this.headingType;
    return snap;
  }

  restore(state: HeadingSnapshoot) {
    this.headingType = state.headingType;
    this.style = styleMap[state.headingType];
    super.restore(state);
  }

  createEmpty() {
    const heading = this.getComponentFactory().buildHeading(this.headingType, "");
    heading.modifyDecorate(this.decorate.copyStyle(), this.decorate.copyData());
    return heading;
  }

  getType(): string {
    return `${this.type}>${this.headingType}`;
  }

  getJSON(): JSONType {
    let raw = super.getJSON();
    raw.headingType = this.headingType;
    return raw;
  }

  render(contentView: AbstractView) {
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
