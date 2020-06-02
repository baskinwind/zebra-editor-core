import Collection from "./collection";
import Inline from "./inline";
import { createError } from "./util";
import Component, { operatorType, classType } from "./component";
import updateComponent from "../selection-operator/update-component";
import Character from "./character";
import Decorate, { storeData } from "../decorate";
import { getContentBuilder } from "../builder";
import StructureType from "../const/structure-type";
import ComponentType from "../const/component-type";

abstract class ContentCollection extends Collection<Inline> {
  type = ComponentType.paragraph;
  structureType = StructureType.content;

  static exchangeOnly(component: ContentCollection, args?: any[]) {
    if (!(component instanceof ContentCollection)) {
      throw createError("不支持不同类型的组件相互装换", component);
    }
    Reflect.setPrototypeOf(component, this.prototype);
    return component;
  }

  static exchange(
    component: ContentCollection,
    args?: any[],
    customerUpdate: boolean = false
  ) {
    this.exchangeOnly(component, args);
    updateComponent(component, customerUpdate);
    return component;
  }

  constructor(text?: string, style?: storeData, data?: storeData) {
    super(style, data);
    if (text) {
      this.addText(text, 0, true);
    }
  }

  exchangeToOther(builder: classType, args: any[]): operatorType {
    if (builder === this.constructor) return;
    builder.exchange(this, args);
    return;
  }

  addChildren(
    component: Inline | Inline[],
    index?: number,
    customerUpdate: boolean = false
  ) {
    if (!Array.isArray(component)) {
      component = [component];
    }
    component.forEach((item) => {
      if (!(item instanceof Inline)) {
        throw createError("该组件仅能添加 Inline 类型的组件", item);
      }
    });
    return super.addChildren(component, index, customerUpdate);
  }

  addText(text: string, index?: number, customerUpdate: boolean = false) {
    let componentList: Character[] = [];
    for (let char of text) {
      componentList.push(new Character(char));
    }
    return this.addChildren(componentList, index, customerUpdate);
  }

  changeCharDecorate(
    start: number,
    end: number,
    style?: storeData,
    data?: storeData,
    customerUpdate: boolean = false
  ) {
    if (!style && !data) return;
    for (let i = start; i <= end; i++) {
      let decorate = this.children.get(i)?.decorate;
      if (decorate === undefined) break;
      decorate.mergeData(data);
      decorate.mergeStyle(style);
    }
    updateComponent(this, customerUpdate);
    return [this, start, end];
  }

  split(
    index: number,
    component?: Component | Component[],
    customerUpdate: boolean = false
  ): operatorType {
    if (!this.parent) return;
    let tail = this.children.slice(index).toArray();
    this.removeChildren(index, this.children.size - index, customerUpdate);
    let componentIndex = this.parent.findChildrenIndex(this);
    let newCollection = this.createEmpty();
    if (!component || tail.length !== 0) {
      newCollection.addChildren(tail, 0, true);
      this.parent.addChildren(
        newCollection,
        componentIndex + 1,
        customerUpdate
      );
    }
    if (component) {
      this.parent.addChildren(component, componentIndex + 1, customerUpdate);
    }
    return [newCollection, 0, 0];
  }

  add(
    component: Inline[] | Inline | string,
    index: number,
    customerUpdate: boolean = false
  ) {
    if (typeof component === "string") {
      let decorate = this.children.get(index === 0 ? 0 : index - 1)?.decorate;
      let list = [];
      for (let char of component) {
        list.push(
          new Character(char, decorate?.getStyle(), decorate?.getData())
        );
      }
      component = list;
    }
    return this.addChildren(component, index, customerUpdate);
  }

  addIntoTail(
    component: ContentCollection,
    customerUpdate: boolean = false
  ): operatorType {
    component.removeSelf();
    let size = this.children.size;
    this.children = this.children.push(...component.children);
    updateComponent(this, customerUpdate);
    return [this, size, size];
  }

  remove(
    start: number,
    end: number,
    customerUpdate: boolean = false
  ): operatorType {
    if (!this.parent) return;
    if (start === -1 && end === -1) {
      let index = this.parent.findChildrenIndex(this);
      return this.parent.whenChildHeadDelete(this, index);
    }
    end = end < 0 && start >= 0 ? this.children.size + end : end;
    if (start > end) {
      throw createError(`start：${start}、end：${end}不合法。`, this);
    }
    return this.removeChildren(start, end - start + 1, customerUpdate);
  }

  modifyContentDecorate(
    start: number = 0,
    end: number = -1,
    style?: storeData,
    data?: storeData,
    customerUpdate: boolean = false
  ) {
    end = end < 0 ? this.children.size + end : end;
    if (start > end) {
      console.error(Error(`start：${start}、end：${end}不合法。`));
      return;
    }
    return this.changeCharDecorate(start, end, style, data, customerUpdate);
  }

  getContent() {
    const builder = getContentBuilder();
    let content: any[] = [];
    let acc: Character[] = [];
    let prevDecorate: Decorate;
    let createCharacterList = () => {
      if (!acc.length) return;
      content.push(
        builder.buildCharacterList(
          `${this.id}__${content.length}`,
          acc.map((character) => character.render()),
          prevDecorate.getStyle()
        )
      );
      acc = [];
    };

    this.children.forEach((value) => {
      if (value instanceof Character) {
        let decorate = value.decorate;
        if (!decorate) return;
        if (!decorate.isSame(prevDecorate)) {
          createCharacterList();
          prevDecorate = decorate;
        }
        acc.push(value);
        return;
      }
      createCharacterList();
      content.push(value.render());
    });
    createCharacterList();
    return content;
  }
}

export default ContentCollection;
