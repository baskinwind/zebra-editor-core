import ComponentFactory from ".";
import { IRawType } from "./component";
import Block from "./block";
import PlainText from "./plain-text";
import ContentCollection from "./content-collection";
import BaseBuilder from "../content/base-builder";
import ComponentType from "../const/component-type";
import { StoreData } from "../decorate";

class Paragraph extends ContentCollection {
  type = ComponentType.paragraph;

  static create(componentFactory: ComponentFactory, raw: IRawType): Paragraph {
    let paragraph = componentFactory.buildParagraph("", raw.style, raw.data);
    let children = super.getChildren(componentFactory, raw);
    paragraph.addChildren(children, 0);
    return paragraph;
  }

  static exchange(
    componentFactory: ComponentFactory,
    block: Block,
    args: any[] = [],
  ): Paragraph[] {
    let list: Paragraph[] = [];
    if (block instanceof Paragraph) {
      list.push(block);
    } else if (block instanceof ContentCollection) {
      let newParagraph = componentFactory.buildParagraph(
        "",
        block.decorate.copyStyle(),
        block.decorate.copyData(),
      );
      newParagraph.addChildren(block.children.toArray(), 0);
      list.push(newParagraph);
    } else if (block instanceof PlainText) {
      let stringList = block.content.join("").split("\n");
      stringList.pop();
      [...stringList].forEach((item) => {
        list.push(componentFactory.buildParagraph(item));
      });
    }

    block.replaceSelf(list);
    return list;
  }

  constructor(
    text: string = "",
    style?: StoreData,
    data: StoreData = { tag: "p" },
  ) {
    super(text, style, data);
  }

  createEmpty() {
    return this.getComponentFactory().buildParagraph(
      "",
      this.decorate.copyStyle(),
      this.decorate.copyData(),
    );
  }

  render(contentBuilder: BaseBuilder, onlyDecorate: boolean = false) {
    return contentBuilder.buildParagraph(
      this.id,
      () => this.getContent(contentBuilder),
      this.decorate.getStyle(onlyDecorate),
      this.decorate.getData(onlyDecorate),
    );
  }
}

export default Paragraph;
