import ComponentFactory from ".";
import BaseBuilder from "../builder/base-builder";
import { IRawType } from "./component";
import PlainText from "./plain-text";
import ContentCollection from "./content-collection";
import ComponentType from "../const/component-type";
import { StoreData } from "../decorate";
import Block from "./block";

class CodeBlock extends PlainText {
  type = ComponentType.codeBlock;
  language: string;

  static create(componentFactory: ComponentFactory, raw: IRawType): CodeBlock {
    return componentFactory.buildCode(raw.content, raw.language, raw.style, raw.data);
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
    this.componentWillChange();
    this.language = language;
    this.updateComponent([this]);
  }

  createEmpty() {
    return this.getComponentFactory().buildCode(
      "\n",
      this.language,
      this.decorate.copyStyle(),
      this.decorate.copyData(),
    );
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.language = this.language;
    return raw;
  }

  render(contentBuilder: BaseBuilder) {
    return contentBuilder.buildCodeBlock(
      this.id,
      this.content.join(""),
      this.language,
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
  }
}

export default CodeBlock;
