import ComponentType from "../const/component-type";
import { storeData } from "../decorate/base";

import Inline from "./inline";
import DataDecorate from "../decorate/data";
import { getBuilder } from "../builder";

export default class InlineImage extends Inline {
  type = ComponentType.inlineImage;
  content: string = "$$$INLINEIMAGE$$$";
  src: string;
  decorate: DataDecorate;

  constructor(src: string, style?: storeData, data?: storeData) {
    super();
    this.decorate = new DataDecorate(style, data);
    this.src = src;
  }

  setSrc(src: string) {
    this.src = src;
  }

  getContent() {
    return getBuilder().buildInlineImage(
      this.id,
      this.src,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}
