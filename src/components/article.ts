import ComponentFactory from ".";
import BaseBuilder from "../content/base-builder";
import { operatorType, IRawType } from "./component";
import Block from "./block";
import StructureCollection from "./structure-collection";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import updateComponent from "../util/update-component";

class Article extends StructureCollection<Block> {
  type = ComponentType.article;
  structureType = StructureType.structure;

  static create(componentFactory: ComponentFactory, raw: IRawType): Article {
    let article = componentFactory.buildArticle(raw.style, raw.data);
    if (raw.id) {
      article.id = raw.id;
    }
    let children = raw.children
      ? raw.children.map((item) => {
          return componentFactory.typeMap[item.type].create(
            componentFactory,
            item,
          );
        })
      : [];
    article.add(children, 0, true);
    return article;
  }

  setId(id: string) {
    this.id = id;
  }

  isEmpty() {
    return this.getSize() === 1 && this.getChild(0)?.getSize() === 0;
  }

  childHeadDelete(
    block: Block,
    index: number,
    customerUpdate: boolean = false,
  ): operatorType {
    let prev = this.getPrev(block);
    if (!prev) {
      if (!block.decorate.isEmpty() || block.type !== ComponentType.paragraph) {
        block.decorate.clear();
        let exchanged = block.exchangeTo(
          this.getComponentFactory().typeMap.PARAGRAPH,
          [],
        );
        updateComponent(this.editor, block);
        return [exchanged[0], 0, 0];
      }
      // 若不是仅有一行，则删除该行
      if (this.getSize() !== 1) {
        block.removeSelf();
        return;
      }
      return;
    }
    return block.sendTo(prev, customerUpdate);
  }

  remove(
    start: number,
    end?: number,
    customerUpdate: boolean = false,
  ): operatorType {
    let focus = super.remove(start, end, customerUpdate);
    if (this.getSize() === 0) {
      return this.add(this.getComponentFactory().buildParagraph());
    }
    return focus;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.id = this.id;
    return raw;
  }

  render(contentBuilder: BaseBuilder, onlyDecorate: boolean = false) {
    return contentBuilder.buildArticle(
      this.id,
      () =>
        this.children
          .map((item) => item.render(contentBuilder, onlyDecorate))
          .toArray(),
      this.decorate.getStyle(onlyDecorate),
      this.decorate.getData(onlyDecorate),
    );
  }
}

export default Article;
