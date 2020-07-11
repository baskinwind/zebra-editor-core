import { getComponentFactory } from ".";
import Component, { IRawType, operatorType } from "./component";
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
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }

  onTab(start: number, end: number, cancelTab: boolean = false): operatorType {
    let addTabIndex: number[] = [];
    let first = start;
    while (first !== 0 && this.content[first - 1] !== "\n") {
      first -= 1;
    }
    addTabIndex.push(first);
    for (let i = start; i < end; i++) {
      if (this.content[i] === "\n") {
        addTabIndex.push(i + 1);
      }
    }
    addTabIndex.reverse().forEach((item) => {
      this.content.splice(item, 0, " ", " ");
    });
    updateComponent(this);
    return [this, start + 2, end + addTabIndex.length * 2];
  }

  render() {
    return getContentBuilder().buildCode(
      this.id,
      this.content.join(""),
      this.language,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

export default Code;
