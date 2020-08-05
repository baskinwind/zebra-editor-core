import { getComponentFactory } from ".";
import Component, { IRawType, operatorType } from "./component";
import PlainText from "./plain-text";
import ContentCollection from "./content-collection";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../content";
import { initRecordState, recordMethod } from "../record/decorators";
import { storeData } from "../decorate";
import updateComponent from "../util/update-component";

@initRecordState
class Code extends PlainText {
  type = ComponentType.code;
  style: storeData = {
    overflow: "auto",
    fontSize: "14px",
    borderRadius: "4px",
    backgroundColor: "rgba(248, 248, 248, 1)"
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
      code.add(component.children.map((item) => item.content).join(""), 0);
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
    this.language = language;
  }

  setLanguage(language: string) {
    this.language = language;
    updateComponent(this);
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

  createEmpty() {
    return getComponentFactory().buildCode(
      "\n",
      this.language,
      this.decorate.copyStyle(),
      this.decorate.copyData()
    );
  }

  render(onlyDecorate: boolean = false) {
    return getContentBuilder().buildCode(
      this.id,
      this.content.join(""),
      this.language,
      this.decorate.getStyle(onlyDecorate),
      this.decorate.getData(onlyDecorate)
    );
  }
}

export default Code;
