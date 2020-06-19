import { IRawType, classType } from "./component";
import Block from "./block";
import PlainText from "./plain-text";
import ContentCollection from "./content-collection";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../content";
import { initRecordState, recordMethod } from "../record/decorators";
import { storeData } from "../decorate";

@initRecordState
class Paragraph extends ContentCollection {
  type = ComponentType.paragraph;

  static create(raw: IRawType): Paragraph {
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

  constructor(text: string = "", style?: storeData, data?: storeData) {
    super(text, style, data);
    this.decorate.mergeStyle({
      fontSize: "16px"
    });
  }

  @recordMethod
  exchangeTo(builder: classType, args: any[]): Block[] {
    if (builder === Paragraph) return [this];
    return builder.exchange(this, args);
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
