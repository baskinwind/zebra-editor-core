import Inline from "./inline";
import BaseView from "../view/base-view";
import ComponentType from "../const/component-type";
import { AnyObject } from "../decorate/index";
import { JSONType } from "./component";
import ComponentFactory from "../factory";

class InlineImage extends Inline {
  type = ComponentType.inlineImage;
  content = "";
  src: string;

  static create(componentFactory: ComponentFactory, json: JSONType): InlineImage {
    return componentFactory.buildInlineImage(json.src || "", json.style, json.data);
  }

  constructor(src: string = "", style?: AnyObject, data?: AnyObject) {
    super(style, data);
    this.src = src;
  }

  getJSON() {
    let json = super.getJSON();
    json.src = this.src;
    return json;
  }

  render(contentView: BaseView) {
    return contentView.buildInlineImage(
      this.id,
      this.src,
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
  }
}

export default InlineImage;
