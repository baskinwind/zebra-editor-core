import Component, { operatorType, classType } from "./component";
import ContentCollection from "./content-collection";
import StructureCollection from "./structure-collection";
import Paragraph from "./paragraph";
import StructureType from "../const/structure-type";
import DirectionType from "../const/direction-type";
import updateComponent from "../util/update-component";
import { createError } from "./util";
import { storeData } from "../decorate";

abstract class PlainText extends Component {
  parent?: StructureCollection<Component>;
  structureType: StructureType = StructureType.plainText;
  content: string;

  static exchangeOnly(component: Component, args: any[] = []): PlainText[] {
    throw createError("组件未实现 exchangeOnly 静态方法", this);
  }

  static exchange(
    component: Component,
    args: any[],
    customerUpdate: boolean = false
  ): PlainText[] {
    let parent = component.parent;
    if (!parent) throw createError("该节点已失效", component);
    let prev = parent.getPrev(component);
    if (prev instanceof PlainText) {
      prev.receive(component, customerUpdate);
      return [prev];
    } else {
      let newItem = this.exchangeOnly(component, args);
      let index = parent.findChildrenIndex(component);
      component.removeSelf();
      parent.add(newItem, index, customerUpdate);
      return newItem;
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

  exchangeTo(builder: classType, args: any[]): Component[] {
    return builder.exchange(this, args);
  }

  split(
    index: number,
    component?: Component | Component[],
    customerUpdate: boolean = false
  ): operatorType {
    if (component) {
      throw createError("纯文本组件只能输入文字");
    }
    return this.add("\n", index, customerUpdate);
  }

  add(
    string: string,
    index?: number,
    customerUpdate: boolean = false
  ): operatorType {
    if (typeof string !== "string") {
      throw createError("纯文本组件只能输入文字");
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
    } else if (component instanceof PlainText) {
      this.add(component.content);
    }
    return [this, size, size];
  }

  // 在纯文本中 Enter 被用作换行，导致不能创建新行，光标会被困在 Code 区域内
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
}

export default PlainText;
