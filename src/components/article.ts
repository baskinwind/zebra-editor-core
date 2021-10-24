import BaseView from "../view/base-view";
import { OperatorType, JSONType } from "./component";
import Block from "./block";
import StructureCollection from "./structure-collection";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import ComponentFactory from "../factory";

class Article extends StructureCollection<Block> {
  type = ComponentType.article;
  structureType = StructureType.structure;

  static create(componentFactory: ComponentFactory, raw: JSONType): Article {
    let children = (raw.children || []).map((each) => {
      return componentFactory.typeMap[each.type].create(componentFactory, each);
    });

    let article = componentFactory.buildArticle(raw.style, raw.data);
    if (raw.id) {
      article.id = raw.id;
    }
    article.add(0, ...children);
    return article;
  }

  isEmpty() {
    return this.getSize() === 1 && this.getChild(0)?.getSize() === 0;
  }

  childHeadDelete(block: Block): OperatorType {
    let prev = this.getPrev(block);
    if (prev) {
      return block.sendTo(prev);
    }

    // 若在 Article 的第一个
    if (block.type !== ComponentType.paragraph) {
      let exchanged = block.exchangeTo(this.getComponentFactory().typeMap.PARAGRAPH, []);
      return [{ id: exchanged[0].id, offset: 0 }];
    }

    // 首位删除，若修饰器有内容，则清空
    if (!block.decorate.isEmpty()) {
      block.modifyDecorate({ remove: "all" }, { remove: "all" });
    }

    return [{ id: block.id, offset: 0 }];
  }

  remove(start: number, end?: number): OperatorType {
    let operator = super.remove(start, end);
    // 确保文章至少有一个空白行
    if (this.getSize() === 0) {
      return this.add(0, this.getComponentFactory().buildParagraph());
    }
    return operator;
  }

  getJSON(): JSONType {
    let raw = super.getJSON();
    raw.id = this.id;
    return raw;
  }

  render(contentView: BaseView) {
    return contentView.buildArticle(
      this.id,
      () => this.children.toArray().map((each) => each.render(contentView)),
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
  }
}

export default Article;
