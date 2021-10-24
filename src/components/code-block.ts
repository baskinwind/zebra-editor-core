import BaseView from "../view/base-view";
import { JSONType } from "./component";
import PlainText from "./plain-text";
import ContentCollection from "./content-collection";
import ComponentType from "../const/component-type";
import Block from "./block";
import ComponentFactory from "../factory";

class CodeBlock extends PlainText {
  type = ComponentType.codeBlock;
  language: string;

  static create(componentFactory: ComponentFactory, json: JSONType): CodeBlock {
    const code = componentFactory.buildCode(json.content, json.language);
    code.modifyDecorate(json.style, json.data);
    return code;
  }

  static exchange(componentFactory: ComponentFactory, block: Block, args: any[] = []): CodeBlock[] {
    let parent = block.getParent();
    let prev = parent.getPrev(block);

    if (prev instanceof CodeBlock) {
      prev.receive(block);
      return [prev];
    } else {
      let code = componentFactory.buildCode();
      if (block instanceof ContentCollection) {
        code.add(0, block.children.map((each) => each.content).join(""));
      }
      block.replaceSelf(code);
      return [code];
    }
  }

  constructor(content: string = "", language: string = "") {
    super(content);
    this.language = language;
  }

  setLanguage(language: string) {
    this.componentWillChange();
    this.language = language;
    this.updateComponent([this]);
  }

  createEmpty() {
    const code = this.getComponentFactory().buildCode("\n", this.language);
    code.modifyDecorate(this.decorate.copyStyle(), this.decorate.copyData());
    return code;
  }

  getJSON(): JSONType {
    let json = super.getJSON();
    json.language = this.language;
    return json;
  }

  render(contentView: BaseView) {
    return contentView.buildCodeBlock(
      this.id,
      this.content.join(""),
      this.language,
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
  }
}

export default CodeBlock;
