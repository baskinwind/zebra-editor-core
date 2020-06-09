import StructureCollection from "./structure-collection";
import ContentCollection from "./content-collection";
import List from "./list";
import Media from "./media";
import Table from "./table";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { getContentBuilder } from "../builder/index";
import { operatorType, rawType } from "./component";
import { storeData } from "../decorate";
import { saveComponent } from "./util";

type articleChildType = List | ContentCollection | Media | Table;

class Article extends StructureCollection<articleChildType> {
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
    component: articleChildType,
    index: number,
    customerUpdate: boolean = false
  ): operatorType {
    let prev = this.getPrev(component);
    if (!prev) return;
    return component.send(prev, customerUpdate);
  }

  add(
    component: articleChildType | articleChildType[],
    index?: number,
    customerUpdate: boolean = false
  ): operatorType {
    if (!Array.isArray(component)) {
      component = [component];
    }
    this.addChildren(component, index, customerUpdate);
    return [component[0], 0, 0];
  }

  render() {
    console.log("article create");
    let children = this.children
      .map((component) => {
        return component.render();
      })
      .toArray();
    return getContentBuilder().buildArticle(
      this.id,
      children,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

export default Article;
