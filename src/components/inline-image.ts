import Inline from "./inline";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate/index";

export default class InlineImage extends Inline {
  type = ComponentType.inlineImage;
  content: string = "$$$INLINEIMAGE$$$";
  src: string;

  constructor(src: string, style?: storeData, data?: storeData) {
    super(style, data);
    this.src = src;
  }

  setSrc(src: string) {
    this.src = src;
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
