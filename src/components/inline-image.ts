import Inline from "./inline";
import AbstractView from "../view/base-view";
import ComponentType from "../const/component-type";
import { AnyObject } from "../decorate/index";
import { JSONType } from "./component";
import ComponentFactory from "../factory";

class InlineImage extends Inline {
  type = ComponentType.inlineImage;
  content = "";
  src: string;

  static create(componentFactory: ComponentFactory, json: JSONType): InlineImage {
    const inlineImage = componentFactory.buildInlineImage(json.src || "");
    inlineImage.modifyDecorate(json.style, json.data);
    return inlineImage;
  }

  constructor(src: string = "") {
    super();
    this.src = src;
  }

  getJSON() {
    let json = super.getJSON();
    json.src = this.src;
    return json;
  }

  render(contentView: AbstractView) {
    return contentView.buildInlineImage(
      this.id,
      this.src,
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
  }
}

export default InlineImage;
