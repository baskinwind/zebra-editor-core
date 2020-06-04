import ContentCollection from "./content-collection";
import updateComponent from "../selection-operator/update-component";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate";
import { classType, operatorType, rawType } from "./component";

type titleType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

class Title extends ContentCollection {
  type = ComponentType.title;
  titleType: titleType;

  static exchangeOnly(component: ContentCollection, args?: any[]) {
    Reflect.setPrototypeOf(component, this.prototype);
    let title = component as Title;
    title.titleType = args ? args[0] : "h1";
    return component;
  }

  static exchange(
    component: ContentCollection,
    args: any[],
    customerUpdate: boolean = false
  ) {
    let newComponet = this.exchangeOnly(component, args) as Title;
    updateComponent(newComponet, customerUpdate);
  }

  static create(raw: rawType): Title {
    let title = new Title(raw.titleType || "h1", "", raw.style, raw.data);
    let children = super.getChildren(raw);
    title.addChildren(children, 0, true);
    return title;
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

  exchangeToOther(builder: classType, args: any[]): operatorType {
    if (builder === this.constructor && args[0] === this.titleType) return;
    builder.exchange(this, args);
    return;
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
