import ComponentFactory from ".";
import BaseBuilder from "../content/base-builder";
import Component, { IRawType } from "./component";
import PlainText from "./plain-text";
import ContentCollection from "./content-collection";
import ComponentType from "../const/component-type";
import updateComponent from "../util/update-component";
import { StoreData } from "../decorate";

class Code extends PlainText {
  type = ComponentType.code;
  style: StoreData = {
    fontSize: "14px",
    borderRadius: "4px",
    backgroundColor: "rgba(248, 248, 248, 1)",
  };
  language: string;

  static create(componentFactory: ComponentFactory, raw: IRawType): Code {
    return componentFactory.buildCode(
      raw.content,
      raw.language,
      raw.style,
      raw.data,
    );
  }

  static exchangeOnly(
    componentFactory: ComponentFactory,
    component: Component,
    args: any[] = [],
  ): Code[] {
    let code = componentFactory.buildCode();
    if (component instanceof ContentCollection) {
      code.add(component.children.map((item) => item.content).join(""), 0);
    }
    return [code];
  }

  constructor(
    content: string = "",
    language: string = "",
    style: StoreData = {},
    data: StoreData = {},
  ) {
    super(content, style, data);
    this.language = language;
  }

  setLanguage(language: string) {
    this.language = language;
    updateComponent(this.editor, this);
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
    return this.getComponentFactory().buildCode(
      "\n",
      this.language,
      this.decorate.copyStyle(),
      this.decorate.copyData(),
    );
  }

  render(contentBuilder: BaseBuilder, onlyDecorate: boolean = false) {
    return contentBuilder.buildCode(
      this.id,
      this.content.join(""),
      this.language,
      this.decorate.getStyle(onlyDecorate),
      this.decorate.getData(onlyDecorate),
    );
  }
}

export default Code;
