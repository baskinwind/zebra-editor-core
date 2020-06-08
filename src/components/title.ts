import ContentCollection from "./content-collection";
import updateComponent from "../util/update-component";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate";
import Component, { rawType } from "./component";

type titleType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

class Title extends ContentCollection {
  type = ComponentType.title;
  titleType: titleType;

  static create(raw: rawType): Title {
    let title = new Title(raw.titleType || "h1", "", raw.style, raw.data);
    let children = super.getChildren(raw);
    title.addChildren(children, 0, true);
    return title;
  }

  static exchangeOnly(component: Component | string, args: any[] = []): Title {
    if (component instanceof Title && component.titleType === args[0])
      return component;
    let newTitle = new Title(args[0] || "h1");
    if (typeof component === "string") {
      newTitle.addText(component, 0);
    } else if (component instanceof ContentCollection) {
      newTitle.addChildren(component.children.toArray(), 0);
    }
    return newTitle;
  }

  constructor(
    type: titleType,
    text?: string,
    style?: storeData,
    data?: storeData
  ) {
    super(text, style, data);
    this.titleType = type;
  }

  setListType(type: titleType = "h1") {
    this.titleType = type;
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

  getRaw(): rawType {
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
