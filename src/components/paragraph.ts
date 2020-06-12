import { rawType } from "./component";
import Block from "./block";
import PlainText from "./plain-text";
import ContentCollection from "./content-collection";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../builder";
import { initRecordState } from "../record/decorators";

@initRecordState
class Paragraph extends ContentCollection {
  type = ComponentType.paragraph;

  static create(raw: rawType): Paragraph {
    let paragraph = new Paragraph("", raw.style, raw.data);
    let children = super.getChildren(raw);
    paragraph.addChildren(children, 0, true);
    return paragraph;
  }

  static exchangeOnly(block: Block, args: any[] = []): Paragraph[] {
    let list: Paragraph[] = [];
    if (block instanceof ContentCollection) {
      let newParagraph = new Paragraph();
      newParagraph.addChildren(block.children.toArray(), 0);
      list.push(newParagraph);
    } else if (block instanceof PlainText) {
      let stringList = block.content.split("\n");
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
