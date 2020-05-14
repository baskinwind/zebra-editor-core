import Inline from "./Inline";
import Entity from "./Entity";
import { getBuilder } from "../builder";

export default class Character extends Inline {
  type: string = "CHARACTER";
  content: string;

  constructor(
    content: string,
    style?: Entity["style"],
    data?: Entity["style"]
  ) {
    super(style, data);
    this.content = content;
  }

  setContent(char: string) {
    this.content = char;
  }

  getContent() {
    return getBuilder().buildChar(
      this.content,
      this.entity.getStyle,
      this.entity.getData
    );
  }
}
