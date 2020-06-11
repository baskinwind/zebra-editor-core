import Component, { rawType } from "./component";
import PlainText from "./plain-text";
import ContentCollection from "./content-collection";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../builder";

class Code extends PlainText {
  type = ComponentType.code;

  static create(raw: rawType): Code {
    return new Code(raw.content, raw.style, raw.data);
  }

  static exchangeOnly(component: Component, args: any[] = []): Code[] {
    let code = new Code();
    if (component instanceof ContentCollection) {
      code.add(component.children.map((item) => item.content).join(""), 0);
    }
    return [code];
  }

  createEmpty() {
    return new Code("\n", this.decorate.getStyle(), this.decorate.getData());
  }

  render() {
    const builder = getContentBuilder();
    return builder.buildCode(
      this.id,
      this.content,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

export default Code;
