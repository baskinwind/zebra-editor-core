import Component, { rawType, operatorType } from "./component";
import ContentCollection from "./content-collection";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../builder";
import PlainText from "./plain-text";

class Paragraph extends ContentCollection {
  type = ComponentType.paragraph;

  static create(raw: rawType): Paragraph {
    let paragraph = new Paragraph("", raw.style, raw.data);
    let children = super.getChildren(raw);
    paragraph.addChildren(children, 0, true);
    return paragraph;
  }

  static exchangeOnly(component: Component, args: any[] = []): Paragraph[] {
    let list: Paragraph[] = [];
    if (component instanceof ContentCollection) {
      let newParagraph = new Paragraph();
      newParagraph.addChildren(component.children.toArray(), 0);
      list.push(newParagraph);
    } else if (component instanceof PlainText) {
      let stringList = component.content.split("\n");
      if (stringList[stringList.length - 1].length === 0) {
        stringList.pop();
      }
      stringList.forEach((item) => {
        list.push(new Paragraph(item));
      });
    }
    return list;
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
