import Inline from "./Inline";
import Entity from "./Entity";

import { getBuilder } from "../builder";

export default class InlineImage extends Inline {
  type: string = "INLINEIMAGE";
  content: string = "$$$INLINEIMAGE$$$";
  src: string;

  constructor(src: string, style?: Entity["style"], data?: Entity["style"]) {
    super(style, data);
    this.src = src;
  }

  setSrc(src: string) {
    this.src = src;
  }

  getContent() {
    return getBuilder().buildInlineImage(
      this.src,
      this.entity.getStyle,
      this.entity.getData
    );
  }
}
