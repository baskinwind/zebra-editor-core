import Collection from "./collection";
import ComponentType from "../const/component-type";
import Media from "./media";
import Paragraph from "./paragraph";
import { getContentBuilder } from "../builder/index";
import StructureType from "../const/structure-type";
import { startUpdate } from "../selection-operator/update-component";

export default class Article extends Collection<Paragraph | Media> {
  type = ComponentType.article;
  structureType = StructureType.collection;
  actived = true;
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
