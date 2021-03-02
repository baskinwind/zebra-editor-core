import ComponentFactory from ".";
import Inline from "./inline";
import BaseBuilder from "../content/base-builder";
import ComponentType from "../const/component-type";
import { StoreData } from "../decorate/index";
import { IRawType } from "./component";

class InlineImage extends Inline {
  type = ComponentType.inlineImage;
  content = "";
  src: string;

  static create(
    componentFactory: ComponentFactory,
    raw: IRawType,
  ): InlineImage {
    return componentFactory.buildInlineImage(
      raw.src || "",
      raw.style,
      raw.data,
    );
  }

  constructor(src: string = "", style?: StoreData, data?: StoreData) {
    super(style, data);
    this.src = src;
  }

  getRaw() {
    let raw = super.getRaw();
    raw.src = this.src;
    return raw;
  }

  render(contentBuilder: BaseBuilder, onlyDecorate: boolean = false) {
    return contentBuilder.buildInlineImage(
      this.id,
      this.src,
      this.decorate.getStyle(onlyDecorate),
      this.decorate.getData(onlyDecorate),
    );
  }
}

export default InlineImage;
