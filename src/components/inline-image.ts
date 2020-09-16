import { getComponentFactory } from ".";
import Inline from "./inline";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../content";
import { storeData } from "../decorate/index";
import { IRawType } from "./component";
import { initRecordState } from "../record/decorators";

@initRecordState
class InlineImage extends Inline {
  type = ComponentType.inlineImage;
  content = "$$$INLINEIMAGE$$$";
  src: string;

  static create(raw: IRawType): InlineImage {
    return getComponentFactory().buildInlineImage(
      raw.src || "",
      raw.style,
      raw.data,
    );
  }

  constructor(src: string = "", style?: storeData, data?: storeData) {
    super(style, data);
    this.src = src;
  }

  getRaw() {
    let raw = super.getRaw();
    raw.src = this.src;
    return raw;
  }

  render(onlyDecorate: boolean = false) {
    return getContentBuilder().buildInlineImage(
      this.id,
      this.src,
      this.decorate.getStyle(onlyDecorate),
      this.decorate.getData(onlyDecorate),
    );
  }
}

export default InlineImage;
