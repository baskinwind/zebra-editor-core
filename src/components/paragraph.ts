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
      let newParagraph = getComponentFactory().buildParagraph(
        "",
        block.decorate.copyStyle(),
        block.decorate.copyData()
      );
      newParagraph.addChildren(block.children.toArray(), 0);
      list.push(newParagraph);
    } else if (block instanceof PlainText) {
      let stringList = block.content.join("").split("\n");
      stringList.pop();
      [...stringList].forEach((item) => {
        list.push(getComponentFactory().buildParagraph(item));
      });
    }
    return list;
  }

  createEmpty() {
    return getComponentFactory().buildParagraph(
      "",
      this.decorate.copyStyle(),
      this.decorate.copyData()
    );
  }

  render(onlyDecorate: boolean = false) {
    return getContentBuilder().buildParagraph(
      this.id,
      () => this.getContent(),
      this.decorate.getStyle(onlyDecorate),
      { ...this.decorate.getData(onlyDecorate), tag: "p" }
    );
  }
}

export default Paragraph;
