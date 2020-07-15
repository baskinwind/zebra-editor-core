import { getComponentFactory } from ".";
import { operatorType, IRawType } from "./component";
import Block from "./block";
import StructureCollection from "./structure-collection";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import ComponentMap from "../const/component-create";
import { getContentBuilder } from "../content/index";
import { storeData } from "../decorate";
import { saveBlock } from "./util";
import { initRecordState } from "../record/decorators";

@initRecordState
class Article extends StructureCollection<Block> {
  type = ComponentType.article;
  structureType = StructureType.structure;

  static create(raw: IRawType): Article {
    let article = getComponentFactory().buildArticle(raw.style, raw.data);
    let children = raw.children
      ? raw.children.map((item) => ComponentMap[item.type](item))
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
    if (!prev) return;
    return block.sendTo(prev, customerUpdate);
  }

  render() {
    return getContentBuilder().buildArticle(
      this.id,
      () => this.children.map((item) => item.render()).toArray(),
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

export default Article;
