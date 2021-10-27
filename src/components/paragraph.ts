import Editor from "../editor";
import { JSONType } from "./component";
import Block from "./block";
import PlainText from "./plain-text";
import ContentCollection from "./content-collection";
import AbstractView from "../view/base-view";
import ComponentType from "../const/component-type";
import ComponentFactory from "../factory";

class Paragraph extends ContentCollection {
  type = ComponentType.paragraph;

  static create(componentFactory: ComponentFactory, json: JSONType): Paragraph {
    let children = super.createChildren(componentFactory, json);

    let paragraph = componentFactory.buildParagraph();
    paragraph.modifyDecorate(json.style, json.data);
    paragraph.add(0, ...children);
    return paragraph;
  }

  static exchange(componentFactory: ComponentFactory, block: Block): Paragraph[] {
    if (block instanceof Paragraph) {
      return [block];
    }

    let newParagraphList: Paragraph[] = [];
    if (block instanceof ContentCollection) {
      let newParagraph = componentFactory.buildParagraph();
      newParagraph.modifyDecorate(block.decorate.copyStyle(), block.decorate.copyData());
      newParagraph.add(0, ...block.children);
      newParagraphList.push(newParagraph);
    } else if (block instanceof PlainText) {
      let stringList = block.content.join("").split("\n");
      if (!stringList[stringList.length - 1]) {
        stringList.pop();
      }
      stringList.forEach((each) => {
        newParagraphList.push(componentFactory.buildParagraph(each));
      });
    }

    block.replaceSelf(...newParagraphList);
    return newParagraphList;
  }

  constructor(text: string = "", editor?: Editor) {
    super(text, editor);
  }

  createEmpty() {
    const paragraph = this.getComponentFactory().buildParagraph();
    paragraph.modifyDecorate(this.decorate.copyStyle(), this.decorate.copyData());
    return paragraph;
  }

  render(contentView: AbstractView) {
    return contentView.buildParagraph(
      this.id,
      () => this.getChildren(contentView),
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
  }
}

export default Paragraph;
