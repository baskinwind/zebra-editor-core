import ComponentType from "../const/component-type";
import { getContentBuilder } from "../builder";
import ContentCollection from "./content-collection";

class Paragraph extends ContentCollection {
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
