import ComponentType from "../const/component-type";

import Collection from "./collection";
import Component from "./component";
import { getBuilder } from "../builder/index";

export default class Article extends Collection<Component> {
  type = ComponentType.article;
  getContent() {
    console.log("test getContent couter");
    let children = this.children
      .map((component) => component.getContent())
      .toArray();
    return getBuilder().buildArticle(
      this.id,
      children,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}
