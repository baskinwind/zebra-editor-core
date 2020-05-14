import ComponentType from "../const/component-type";

import Inline from "./inline";
import { getBuilder } from "../builder/index";

export default class Character extends Inline {
  type = ComponentType.character;
  content: string;

  constructor(content: string) {
    super();
    this.content = content;
  }

  setContent(char: string) {
    this.content = char;
  }

  getContent() {
    return getBuilder().buildChar(this.id, this.content);
  }
}
