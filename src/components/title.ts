import Paragraph from "./paragraph";
import { getContentBuilder } from "../builder";
import updateComponent from "../selection-operator/update-component";
import { storeData } from "../decorate";

type titleType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

class Title extends Paragraph {
  titleType: titleType;

  static exchange(
    component: Paragraph,
    args: any[],
    customerUpdate: boolean = false
  ) {
    let newComponet = super.exchange(component, args, true) as Title;
    newComponet.titleType = args[0] as titleType | "h1";
    updateComponent(newComponet);
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

  createEmpty() {
    return new Title(
      this.titleType,
      "",
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }

  render() {
    const builder = getContentBuilder();
    return builder.buildParagraph(
      this.id,
      this.getContent(),
      this.decorate.getStyle(),
      { ...this.decorate.getData(), tag: this.titleType }
    );
  }
}

export default Title;
