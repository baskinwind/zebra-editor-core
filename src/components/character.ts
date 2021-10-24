import Inline from "./inline";
import ComponentType from "../const/component-type";

class Character extends Inline {
  type = ComponentType.character;
  content: string;

  constructor(content: string) {
    super();
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
