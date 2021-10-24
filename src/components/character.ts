import Inline from "./inline";
import ComponentType from "../const/component-type";
import { AnyObject } from "../decorate";

class Character extends Inline {
  type = ComponentType.character;
  content: string;

  constructor(content: string, style?: AnyObject, data?: AnyObject) {
    super(style, data);
    this.content = content;
  }

  getJSON() {
    return {
      type: this.type,
      content: this.content,
    };
  }

  render() {
    return this.content;
  }
}

export default Character;
