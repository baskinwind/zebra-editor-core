import ComponentFactory from ".";
import { IRawType } from "./component";
import Block from "./block";
import PlainText from "./plain-text";
import ContentCollection from "./content-collection";
import BaseView from "../view/base-view";
import ComponentType from "../const/component-type";
import { StoreData } from "../decorate";

class Paragraph extends ContentCollection {
  type = ComponentType.paragraph;

  static create(componentFactory: ComponentFactory, raw: IRawType): Paragraph {
    let children = super.createChildren(componentFactory, raw);

    let paragraph = componentFactory.buildParagraph("", raw.style, raw.data);
    paragraph.add(0, ...children);
    return paragraph;
  }

  static exchange(componentFactory: ComponentFactory, block: Block): Paragraph[] {
    if (block instanceof Paragraph) {
      return [block];
    }

    let newParagraphList: Paragraph[] = [];
    if (block instanceof ContentCollection) {
      let newParagraph = componentFactory.buildParagraph(
        "",
        block.decorate.copyStyle(),
        block.decorate.copyData(),
      );
      newParagraph.add(0, ...block.children);
      newParagraphList.push(newParagraph);
    } else if (block instanceof PlainText) {
      let stringList = block.content.join("").split("\n");
      // PlainText 末尾可定会有一个空行
      stringList.pop();
      stringList.forEach((each) => {
        newParagraphList.push(componentFactory.buildParagraph(each));
      });
    }

    block.replaceSelf(...newParagraphList);
    return newParagraphList;
  }

  constructor(text: string = "", style?: StoreData, data: StoreData = { tag: "p" }) {
    super(text, style, data);
  }

  createEmpty() {
    return this.getComponentFactory().buildParagraph(
      "",
      this.decorate.copyStyle(),
      this.decorate.copyData(),
    );
  }

  render(contentView: BaseView) {
    return contentView.buildParagraph(
      this.id,
      () => this.getChildren(contentView),
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
  }
}

export default Paragraph;
