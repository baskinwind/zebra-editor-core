import Component, { IRawType } from "./component";
import PlainText from "./plain-text";
import ContentCollection from "./content-collection";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../content";
import { initRecordState } from "../record/decorators";
import { storeData } from "../decorate";

@initRecordState
class Code extends PlainText {
  type = ComponentType.code;

  static create(raw: IRawType): Code {
    return new Code(raw.content, raw.style, raw.data);
  }

  static exchangeOnly(component: Component, args: any[] = []): Code[] {
    let code = new Code();
    if (component instanceof ContentCollection) {
      code.add(
        component.children.map((item) => item.content).join("") + "\n",
        0
      );
    }
    return [code];
  }

  constructor(
    content: string = "",
    style: storeData = {},
    data: storeData = {}
  ) {
    super(content, style, data);
    this.content = content;
    this.decorate.mergeStyle({
      padding: "10px",
      border: "1px solid #eee",
      borderRadius: "4px",
      background: "#f8f8f8",
      lineHeight: "1.3em"
    });
  }

  createEmpty() {
    return new Code("\n", this.decorate.getStyle(), this.decorate.getData());
  }

  render() {
    return getContentBuilder().buildCode(
      this.id,
      this.content,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }

  getStatistic() {
    let res = super.getStatistic();
    res.code += 1;
    return res;
  }
}

export default Code;
