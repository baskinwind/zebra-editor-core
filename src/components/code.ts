import { getComponentFactory } from ".";
import Component, { IRawType } from "./component";
import PlainText from "./plain-text";
import ContentCollection from "./content-collection";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../content";
import { initRecordState } from "../record/decorators";
import { storeData } from "../decorate";
import updateComponent from "../util/update-component";

@initRecordState
class Code extends PlainText {
  type = ComponentType.code;
  style: storeData = {
    overflow: "auto",
    fontSize: "14px",
    padding: "10px",
    borderRadius: "4px",
    backgroundColor: "#f8f8f8"
  };
  data: storeData = {
    bgColor: { color: "#f8f8f8" }
  };
  language: string;

  static create(raw: IRawType): Code {
    return getComponentFactory().buildCode(
      raw.content,
      raw.language,
      raw.style,
      raw.data
    );
  }

  static exchangeOnly(component: Component, args: any[] = []): Code[] {
    let code = getComponentFactory().buildCode();
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
    language: string = "",
    style: storeData = {},
    data: storeData = {}
  ) {
    super(content, style, data);
    this.content = content;
    this.language = language;
  }

  setLanguage(language: string) {
    this.language = language;
    updateComponent(this);
  }

  createEmpty() {
    return getComponentFactory().buildCode(
      "\n",
      this.language,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }

  getStatistic() {
    let res = super.getStatistic();
    res.code += 1;
    return res;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.language = this.language;
    return raw;
  }

  render() {
    return getContentBuilder().buildCode(
      this.id,
      this.content,
      this.language,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

export default Code;
