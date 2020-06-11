import { operatorType, rawType } from "./component";
import Block from "./block";
import StructureCollection from "./structure-collection";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { getContentBuilder } from "../builder/index";
import { storeData } from "../decorate";
import { saveComponent } from "./util";

class Article extends StructureCollection<Block> {
  type = ComponentType.article;
  structureType = StructureType.structure;

  constructor(style: storeData = {}, data: storeData = {}) {
    super(style, data);
    saveComponent(this, "article");
  }

  static create(raw: rawType): Article {
    let article = new Article(raw.style, raw.data);
    return article;
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

  add(
    block: Block | Block[],
    index?: number,
    customerUpdate: boolean = false
  ): operatorType {
    if (!Array.isArray(block)) {
      block = [block];
    }
    this.addChildren(block, index, customerUpdate);
    return [block[0], 0, 0];
  }

  render() {
    console.log("article create");
    let children = this.children.map((item) => item.render()).toArray();
    return getContentBuilder().buildArticle(
      this.id,
      children,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

export default Article;
