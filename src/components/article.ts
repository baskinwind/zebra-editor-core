import ComponentFactory from ".";
import BaseBuilder from "../builder/base-builder";
import { OperatorType, IRawType } from "./component";
import Block from "./block";
import StructureCollection from "./structure-collection";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";

class Article extends StructureCollection<Block> {
  type = ComponentType.article;
  structureType = StructureType.structure;

  static create(componentFactory: ComponentFactory, raw: IRawType): Article {
    let children = (raw.children || []).map((item) => {
      return componentFactory.typeMap[item.type].create(componentFactory, item);
    });

    let article = componentFactory.buildArticle(raw.style, raw.data);
    if (raw.id) {
      article.id = raw.id;
    }
    article.add(children);
    return article;
  }

  isEmpty() {
    return this.getSize() === 1 && this.getChild(0)?.getSize() === 0;
  }

  childHeadDelete(block: Block): OperatorType {
    let prev = this.getPrev(block);
    console.log(block);
    // 若在 Article 的第一个
    if (!prev) {
      console.log(block);

      if (block.type !== ComponentType.paragraph) {
        let exchanged = block.exchangeTo(
          this.getComponentFactory().typeMap.PARAGRAPH,
          [],
        );
        return [exchanged, { id: exchanged[0].id, offset: 0 }];
      }

      // 首位删除，若修饰器有内容，则清空
      if (!block.decorate.isEmpty()) {
        block.decorate.clear();
        this.$emit("componentUpdated", [block]);
      }

      return [[block], { id: block.id, offset: 0 }];
    }
    return block.sendTo(prev);
  }

  remove(start: number, end?: number): OperatorType {
    let operator = super.remove(start, end);
    if (this.getSize() === 0) {
      return this.add(this.getComponentFactory().buildParagraph());
    }
    return operator;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.id = this.id;
    return raw;
  }

  render(contentBuilder: BaseBuilder) {
    return contentBuilder.buildArticle(
      this.id,
      () => this.children.toArray().map((item) => item.render(contentBuilder)),
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
  }
}

export default Article;
