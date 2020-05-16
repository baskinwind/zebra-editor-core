import Component from "./component";
import Collection from "./collection";
import ComponentType from "../const/component-type";
import { getBuilder } from "../builder/index";

export default class Article extends Collection<Component> {
  type = ComponentType.article;
  render() {
    console.log("test getContent couter");
    let children = this.children
      .map((component) => component.render())
      .toArray();
    return getBuilder().buildArticle(
      this.id,
      children,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}
