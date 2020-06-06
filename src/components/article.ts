import StructureCollection from "./structure-collection";
import ContentCollection from "./content-collection";
import List from "./list";
import Media from "./media";
import Table from "./table";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { getContentBuilder } from "../builder/index";
import { startUpdate } from "../selection-operator/update-component";
import { operatorType, rawType } from "./component";

type articleChildType = List | ContentCollection | Media | Table;

class Article extends StructureCollection<articleChildType> {
  type = ComponentType.article;
  structureType = StructureType.structure;

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
    startUpdate();
    let children = this.children
      .map((component) => component.render())
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
