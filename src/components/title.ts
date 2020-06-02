import Paragraph from "./paragraph";
import updateComponent from "../selection-operator/update-component";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate";
import ContentCollection from "./content-collection";
import { classType, operatorType } from "./component";

type titleType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

class Title extends ContentCollection {
  titleType: titleType;

  static exchange(
    component: Paragraph,
    args: any[],
    customerUpdate: boolean = false
  ) {
    let newComponet = super.exchange(component, args, true) as Title;
    newComponet.titleType = args[0] as titleType | "h1";
    updateComponent(newComponet, customerUpdate);
    return newComponet;
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
