import ComponentFactory from ".";
import BaseBuilder from "../content/base-builder";
import { OperatorType, IRawType } from "./component";
import Block from "./block";
import StructureCollection from "./structure-collection";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import Editor from "../editor/editor";

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
    // TODO: update true
    article.add(children, 0);
    return article;
  }

  isEmpty() {
    return this.getSize() === 1 && this.getChild(0)?.getSize() === 0;
  }

  childHeadDelete(block: Block): OperatorType {
    let prev = this.getPrev(block);
    // 若在 Article 的第一个
    if (!prev) {
      if (!block.decorate.isEmpty() || block.type !== ComponentType.paragraph) {
        block.decorate.clear();
        let exchanged = block.exchangeTo(
          this.getComponentFactory().typeMap.PARAGRAPH,
          [],
        );
        this.$emit("componentUpdated", [block]);
        return [exchanged];
      }

      return [[block]];
    }
    return block.sendTo(prev);
  }

  remove(start: number, end?: number): OperatorType {
    let focus = super.remove(start, end);
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
