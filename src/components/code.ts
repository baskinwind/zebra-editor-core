import ComponentFactory from ".";
import BaseBuilder from "../content/base-builder";
import Component, { IRawType } from "./component";
import PlainText from "./plain-text";
import ContentCollection from "./content-collection";
import ComponentType from "../const/component-type";
import { StoreData } from "../decorate";
import Block from "./block";

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

  static exchange(
    componentFactory: ComponentFactory,
    block: Block,
    args: any[] = [],
  ): Code[] {
    let parent = block.getParent();
    let prev = parent.getPrev(block);

    if (prev instanceof Code) {
      prev.receive(block);
      return [prev];
    } else {
      let code = componentFactory.buildCode();
      if (block instanceof ContentCollection) {
        code.add(block.children.map((item) => item.content).join(""), 0);
      }
      block.replaceSelf(code);
      return [code];
    }
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
    this.$emit("componentUpdated", [this]);
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
