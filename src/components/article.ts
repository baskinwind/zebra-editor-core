import { getComponentFactory } from ".";
import { operatorType, IRawType } from "./component";
import Block from "./block";
import StructureCollection from "./structure-collection";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { getContentBuilder } from "../content/index";
import { storeData } from "../decorate";
import { saveBlock } from "./util";
import { initRecordState } from "../record/decorators";
import updateComponent from "../util/update-component";

@initRecordState
class Article extends StructureCollection<Block> {
  type = ComponentType.article;
  structureType = StructureType.structure;

  static create(raw: IRawType): Article {
    let factory = getComponentFactory();
    let article = factory.buildArticle(raw.style, raw.data);
    if (raw.id) {
      article.id = raw.id;
      saveBlock(article, raw.id);
    }
    let children = raw.children
      ? raw.children.map((item) => {
          return factory.typeMap[item.type].create(item);
        })
      : [];
    article.add(children, 0, true);
    return article;
  }

  constructor(style?: storeData, data?: storeData) {
    super(style, data);
    saveBlock(this, "article");
  }

  isEmpty() {
    return this.getSize() === 1 && this.getChild(0)?.getSize() === 0;
  }

  childHeadDelete(
    block: Block,
    index: number,
    customerUpdate: boolean = false
  ): operatorType {
    let prev = this.getPrev(block);
    if (!prev) {
      if (!block.decorate.isEmpty() || block.type !== ComponentType.paragraph) {
        block.decorate.clear();
        let exchanged = block.exchangeTo(
          getComponentFactory().typeMap.PARAGRAPH,
          []
        );
        updateComponent(block);
        return [exchanged[0], 1, 1];
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
    customerUpdate: boolean = false
  ): operatorType {
    let focus = super.remove(start, end, customerUpdate);
    if (this.getSize() === 0) {
      return this.add(getComponentFactory().buildParagraph());
    }
    return focus;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.id = this.id;
    return raw;
  }

  render(onlyDecorate: boolean = false) {
    return getContentBuilder().buildArticle(
      this.id,
      () => this.children.map((item) => item.render(onlyDecorate)).toArray(),
      this.decorate.getStyle(onlyDecorate),
      this.decorate.getData(onlyDecorate)
    );
  }
}

export default Article;
