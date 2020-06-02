import Collection from "./collection";
import List from "./list";
import Media from "./media";
import Paragraph from "./paragraph";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { getContentBuilder } from "../builder/index";
import { startUpdate } from "../selection-operator/update-component";
import { operatorType } from "./component";
import Table from "./table";

type articleChildType = List | Paragraph | Media | Table;

class Article extends Collection<articleChildType> {
  type = ComponentType.article;
  structureType = StructureType.collection;
  actived = true;

  whenChildHeadDelete(
    component: articleChildType,
    index: number
  ): operatorType {
    console.log(index);
    component.removeSelf();
    this.addChildren(component, index);
    return;
  }

  render() {
    console.log("test getContent couter");
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
