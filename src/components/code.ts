import Component, { rawType, operatorType, classType } from "./component";
import ContentCollection from "./content-collection";
import StructureCollection from "./structure-collection";
import Paragraph from "./paragraph";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import DirectionType from "../const/direction-type";
import updateComponent from "../util/update-component";
import { getContentBuilder } from "../builder";
import { createError } from "./util";
import { storeData } from "../decorate";

class Code extends Component {
  parent?: StructureCollection<Component>;
  type = ComponentType.code;
  structureType: StructureType = StructureType.plainText;
  content: string;

  static create(raw: rawType): Code {
    return new Code(raw.content, raw.style, raw.data);
  }

  static exchangeOnly(component: Component | string, args: any[] = []): Code {
    if (component instanceof Code) return component;
    let code = new Code();
    if (component instanceof ContentCollection) {
      code.add(component.children.map((item) => item.content).join(""), 0);
    }
    return code;
  }

  static exchange(
    component: Component,
    args: any[],
    customerUpdate: boolean = false
  ): operatorType {
    let parent = component.parent;
    if (!parent) throw createError("该节点已失效", component);
    let prev = parent.getPrev(component);
    if (prev instanceof Code) {
      return prev.receive(component, customerUpdate);
    } else {
      let newItem = this.exchangeOnly(component, args);
      let index = parent.findChildrenIndex(component);
      component.removeSelf();
      newItem.addInto(parent, index, customerUpdate);
      return [newItem, -1, -1];
    }
  }

  constructor(
    content: string = "",
    style: storeData = {},
    data: storeData = {}
  ) {
    super(style, data);
    if (content[content.length - 1] !== "\n") {
      content += "\n";
    }
    this.decorate.setStyle("overflow", "auto");
    this.content = content;
  }

  createEmpty() {
    return new Code("", this.decorate.getStyle(), this.decorate.getData());
  }

  exchangeToOther(builder: classType, args: any[]): operatorType {
    if (builder === Code) return [this, -1, -1];
    let parent = this.parent;
    if (!parent) throw createError("该节点已失效", this);
    let list = this.content.split("\n");
    let index = parent.findChildrenIndex(this);
    let paragraphList = list.map((string) => builder.exchangeOnly(string));
    parent.addChildren(paragraphList, index);
    this.removeSelf();
    return [paragraphList[0], 0, 0];
  }

  split(
    index: number,
    component?: Component | Component[],
    customerUpdate: boolean = false
  ): operatorType {
    if (component) {
      throw createError("代码块内仅能输入文字");
    }
    return this.add("\n", index, customerUpdate);
  }

  add(
    string: string,
    index?: number,
    customerUpdate: boolean = false
  ): operatorType {
    if (typeof string !== "string") {
      throw createError("代码块内仅能输入文字");
    }
    index = index === undefined ? this.content.length : index;
    this.content =
      this.content.slice(0, index) + string + this.content.slice(index);
    updateComponent(this, customerUpdate);
    return [this, index + string.length, index + string.length];
  }

  remove(
    start: number,
    end?: number,
    customerUpdate: boolean = false
  ): operatorType {
    if (end === undefined) end = this.content.length;
    if (start < 0 && end === 0) {
      if (this.content.length <= 1) {
        return this.replaceSelf(new Paragraph());
      }
      return;
    }
    this.content = this.content.slice(0, start) + this.content.slice(end);
    updateComponent(this, customerUpdate);
    return [this, start, start];
  }

  receive(
    component?: Component,
    customerUpdate: boolean = false
  ): operatorType {
    component?.removeSelf();
    let size = this.content.length;
    if (component instanceof ContentCollection) {
      this.add(component.children.map((item) => item.content).join("") + "\n");
    } else if (component instanceof Code) {
      this.add(component.content);
    }
    return [this, size, size];
  }

  // 在 Code 中 Enter 被用作换行，导致不能创建新行，光标会被困在 Code 区域内
  // 当在 Code 的第一行，按下向上时，若该 Code 为 Article 的第一个子元素，则在 Code 上生成新行
  // 向下操作为向上的反向
  handleArrow(index: number, direction: DirectionType): operatorType {
    let contentList = this.content.split("\n");
    if (direction === DirectionType.up && index <= contentList[0].length) {
      let parent = this.parent;
      if (!parent) throw createError("该节点已失效", this);
      let index = parent.findChildrenIndex(this);
      if (index !== 0) {
        return [parent.children.get(index - 1) as Component, 0, 0];
      }
      let paragraph = new Paragraph();
      this.parent?.add(paragraph, 0);
      return [paragraph, 0, 0];
    }
    if (
      direction === DirectionType.down &&
      index > this.content.length - contentList[contentList.length - 2].length
    ) {
      let parent = this.parent;
      if (!parent) throw createError("该节点已失效", this);
      let index = parent.findChildrenIndex(this);
      if (index !== parent.children.size - 1) {
        return [parent.children.get(index + 1) as Component, 0, 0];
      }
      let paragraph = new Paragraph();
      this.parent?.add(paragraph, parent.children.size);
      return [paragraph, 0, 0];
    }
    return;
  }

  getRaw(): rawType {
    let raw: rawType = {
      type: this.type,
      content: this.content
    };
    if (!this.decorate.styleIsEmpty()) {
      raw.style = this.decorate.getStyle();
    }
    if (!this.decorate.dataIsEmpty()) {
      raw.data = this.decorate.getData();
    }
    return raw;
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
