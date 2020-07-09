import { getComponentFactory } from ".";
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
  style = {
    fontSize: "16px"
  };

  static create(raw: IRawType): Paragraph {
    let paragraph = getComponentFactory().buildParagraph(
      "",
      raw.style,
      raw.data
    );
    let children = super.getChildren(raw);
    paragraph.addChildren(children, 0, true);
    return paragraph;
  }

  static exchangeOnly(block: Block, args: any[] = []): Paragraph[] {
    let list: Paragraph[] = [];
    if (block instanceof Paragraph) {
      list.push(block);
    } else if (block instanceof ContentCollection) {
      let newParagraph = getComponentFactory().buildParagraph();
      newParagraph.addChildren(block.children.toArray(), 0);
      list.push(newParagraph);
    } else if (block instanceof PlainText) {
      let stringList = block.content.split("\n");
      if (stringList[stringList.length - 1].length === 0) {
        stringList.pop();
      }
      stringList.forEach((item) => {
        list.push(getComponentFactory().buildParagraph(item));
      });
    }
    return list;
  }

  createEmpty() {
    return getComponentFactory().buildParagraph(
      "",
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }

  render() {
    return getContentBuilder().buildParagraph(
      this.id,
      () => this.getContent(),
      this.decorate.getStyle(),
      { ...this.decorate.getData(), tag: "p" }
    );
  }
}

export default Paragraph;
