import Inline from "./inline";
import ComponentType from "../const/component-type";
import { StoreData } from "../decorate";
import { initRecordState } from "../record/decorators";

@initRecordState
class Character extends Inline {
  type = ComponentType.character;
  content: string;

  constructor(content: string, style?: StoreData, data?: StoreData) {
    super(style, data);
    this.content = content;
  }

  getRaw() {
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
