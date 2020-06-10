import Component, { rawType } from "./component";
import ContentCollection from "./content-collection";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../builder";

class Paragraph extends ContentCollection {
  type = ComponentType.paragraph;

  static create(raw: rawType): Paragraph {
    let paragraph = new Paragraph("", raw.style, raw.data);
    let children = super.getChildren(raw);
    paragraph.addChildren(children, 0, true);
    return paragraph;
  }

  static exchangeOnly(
    component: Component | string,
    args: any[] = []
  ): Paragraph {
    if (component instanceof Paragraph) return component;
    let newParagraph = new Paragraph();
    if (typeof component === "string") {
      newParagraph.addText(component, 0);
    } else if (component instanceof ContentCollection) {
      newParagraph.addChildren(component.children.toArray(), 0);
    }
    return newParagraph;
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
