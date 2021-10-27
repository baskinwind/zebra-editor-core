import Editor from "../editor";
import { OperatorType, JSONType } from "./component";
import Block, { BlockSnapshoot } from "./block";
import ContentCollection from "./content-collection";
import StructureType from "../const/structure-type";
import { createError } from "../util";
import Character from "./character";
import ComponentType from "../const/component-type";
import { getUtf8TextLengthFromJsOffset } from "../util/text-util";

export interface PlainTextSnapshoot extends BlockSnapshoot {
  content: string;
}

abstract class PlainText extends Block {
  content: string[];
  structureType = StructureType.plainText;

  constructor(content: string = "", editor?: Editor) {
    super(editor);
    // fix emoji length
    this.content = [...content];
    if (this.content[this.content.length - 1] !== "\n") {
      this.content.push("\n");
    }
  }

  add(index: number, string: string): OperatorType {
    if (typeof string !== "string") {
      throw createError("only text can be added", this);
    }

    index = index === undefined ? this.content.length : index;
    this.componentWillChange();
    this.content.splice(index, 0, ...string);
    this.updateComponent([this]);

    return [{ id: this.id, offset: index + getUtf8TextLengthFromJsOffset(string) }];
  }

  remove(start: number, end: number = start + 1): OperatorType {
    this.componentWillChange();

    if (start < 0 && end === 0) {
      let block = this.exchangeTo(this.getComponentFactory().typeMap[ComponentType.paragraph]);
      return [{ id: block[0].id, offset: 0 }];
    }

    this.content.splice(start, end - start);
    this.updateComponent([this]);
    return [{ id: this.id, offset: start }];
  }

  split(index: number, ...blockList: Block[]): OperatorType {
    if (blockList.length) {
      throw createError("only text can be split", this);
    }

    return this.add(index, "\n");
  }

  receive(block: Block): OperatorType {
    block.removeSelf();
    let size = this.content.length;

    if (block instanceof ContentCollection) {
      this.add(
        -1,
        block.children
          .filter((each) => each instanceof Character)
          .map((each) => each.content)
          .join("") + "\n",
      );
    } else if (block instanceof PlainText) {
      this.content.push(...block.content);
    }

    return [{ id: this.id, offset: size }];
  }

  snapshoot(): PlainTextSnapshoot {
    let snap = super.snapshoot() as PlainTextSnapshoot;
    snap.content = this.content.join("");
    return snap;
  }

  restore(state: PlainTextSnapshoot) {
    this.content = [...state.content];
    super.restore(state);
  }

  getSize() {
    return this.content.length - 1;
  }

  getJSON(): JSONType {
    let json = super.getJSON();
    json.content = this.content.join("");
    return json;
  }
}

export default PlainText;
