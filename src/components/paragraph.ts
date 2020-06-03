import ComponentType from "../const/component-type";
import ContentCollection from "./content-collection";
import { getContentBuilder } from "../builder";

class Paragraph extends ContentCollection {
  type = ComponentType.paragraph;

  static create(raw: any): Paragraph {
    let paragraph = new Paragraph('', raw.style, raw.data);
    let children = super.createChildren(raw);
    paragraph.addChildren(children, 0, true);
    return paragraph;
  }

  createEmpty() {
    return new Paragraph("", this.decorate.getStyle(), this.decorate.getData());
  }

  render() {
    const builder = getContentBuilder();
    return builder.buildParagraph(
      this.id,
      this.getContent(),
      this.decorate.getStyle(),
      { ...this.decorate.getData(), tag: "p" }
    );
  }
}

export default Paragraph;
