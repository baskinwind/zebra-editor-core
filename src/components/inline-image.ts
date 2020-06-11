import Inline from "./inline";
import ComponentType from "../const/component-type";
import updateComponent from "../util/update-component";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate/index";
import { rawType } from "./component";

class InlineImage extends Inline {
  type = ComponentType.inlineImage;
  content = "$$$INLINEIMAGE$$$";
  src: string;

  static create(raw: rawType): InlineImage {
    return new InlineImage(raw.src || "", raw.style, raw.data);
  }

  constructor(src: string, style?: storeData, data?: storeData) {
    super(style, data);
    this.src = src;
  }

  getRaw() {
    let raw = super.getRaw();
    raw.src = this.src;
    return raw;
  }

  render() {
    return getContentBuilder().buildInlineImage(
      this.id,
      this.src,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

export default InlineImage;
