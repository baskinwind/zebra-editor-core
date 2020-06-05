import ComponentType from "../const/component-type";
import ContentCollection from "./content-collection";
import { getContentBuilder } from "../builder";
import { rawType } from "./component";

class Code extends ContentCollection {
  type = ComponentType.code;

  static create(raw: rawType): Code {
    return new Code(raw.content, raw.style, raw.data);
  }

  createEmpty() {
    return new Code("", this.decorate.getStyle(), this.decorate.getData());
  }

  getRaw(): rawType {
    let raw: rawType = {
      type: this.type,
      content: this.children.join(''),
    };
    if (!this.decorate.styleIsEmpty()) {
      raw.style = this.decorate.getStyle();
    }
    if (!this.decorate.dataIsEmpty()) {
      raw.data = this.decorate.getData();
    }
    return raw;
  }

  render() {
    const builder = getContentBuilder();
    return builder.buildCode(
      this.id,
      this.children.map(item => item.content).join(''),
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

export default Code;
