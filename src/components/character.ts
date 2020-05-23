import Inline from "./inline";
import ComponentType from "../const/component-type";

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

  render() {
    return this.content;
  }
}
