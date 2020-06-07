import Component, { rawType, operatorType, classType } from "./component";
import ContentCollection from "./content-collection";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import updateComponent from "../selection-operator/update-component";
import { getContentBuilder } from "../builder";
import { createError } from "./util";
import { storeData } from "../decorate";
import directionType from "../const/direction-type";
import Paragraph from "./paragraph";

class Code extends Component {
  type = ComponentType.code;
  structureType: StructureType = StructureType.content;
  content: string;

  static create(raw: rawType): Code {
    return new Code(raw.content, raw.style, raw.data);
  }

  static exchange(
    component: ContentCollection,
    args?: any[],
    customerUpdate: boolean = false
  ) {
    // TODO: 将别的内容转换为代码块
    return;
  }

  constructor(content: string = "", style: storeData = {}, data: storeData = {}) {
    super(style, data);
    if (content[content.length - 1] !== '\n') {
      content += '\n';
    }
    this.content = content;
  }

  createEmpty() {
    return new Code("", this.decorate.getStyle(), this.decorate.getData());
  }

  exchangeToOther(builder: classType, args: any[]): operatorType {
    // TODO: 将代码块转化为别的内容
    return;
  }

  split(
    index: number,
    component?: any,
    customerUpdate: boolean = false
  ): operatorType {
    if (component) {
      throw createError('代码块内仅能输入文字');
    }
    return this.add('\n', index, customerUpdate);
  }

  add(
    string: string,
    index: number,
    customerUpdate: boolean = false
  ): operatorType {
    if (typeof string !== 'string') {
      throw createError('代码块内仅能输入文字');
    }
    this.content = this.content.slice(0, index) + string + this.content.slice(index);
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
      return;
    }
    this.content = this.content.slice(0, start) + this.content.slice(end);
    updateComponent(this, customerUpdate);
    return [this, start, start];
  }

  // 在 Code 中 Enter 被用作换行，导致不能创建新行，光标会被困在 Code 区域内
  // 当在 Code 的第一行，按下向上时，若该 Code 为 Article 的第一个子元素，则在 Code 上生成新行
  // 向下操作为向上的反向
  handleArrow(index: number, direction: directionType): operatorType {
    let contentList = this.content.split('\n');
    if (direction === directionType.up && index <= contentList[0].length) {
      let parent = this.parent;
      if (!parent) return;
      let index = parent.findChildrenIndex(this);
      if (index !== 0) {
        return [parent.children.get(index - 1) as Component, 0, 0];
      }
      let paragraph = new Paragraph();
      this.parent?.add(paragraph, 0);
    }
    if (direction === directionType.down && index > this.content.length - contentList[contentList.length - 2].length) {
      let parent = this.parent;
      if (!parent) return;
      let index = parent.findChildrenIndex(this);
      if (index !== parent.children.size - 1) {
        return [parent.children.get(index + 1) as Component, 0, 0];
      }
      let paragraph = new Paragraph();
      this.parent?.add(paragraph, parent.children.size);
    }
    return;
  }

  getRaw(): rawType {
    let raw: rawType = {
      type: this.type,
      content: this.content,
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
