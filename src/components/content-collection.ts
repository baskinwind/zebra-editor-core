import Decorate, { storeData } from "../decorate";
import Component, { operatorType, classType, rawType } from "./component";
import Collection from "./collection";
import Inline from "./inline";
import Character from "./character";
import StructureType from "../const/structure-type";
import updateComponent from "../selection-operator/update-component";
import InlineImage from "./inline-image";
import { createError } from "./util";
import { getContentBuilder } from "../builder";
import ComponentType from "../const/component-type";

abstract class ContentCollection extends Collection<Inline> {
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
  }

  static getChildren(raw: rawType): Inline[] {
    if (!raw.children) return [];
    let children: Inline[] = [];
    raw.children.forEach((item: rawType) => {
      if (item.type === ComponentType.characterList) {
        if (!item.content) return;
        for (let char of item.content) {
          children.push(new Character(char, item.style, item.data));
        }
        return;
      }
      if (item.type === ComponentType.inlineImage) {
        children.push(InlineImage.create(item));
        return;
      }
    });
    return children;
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
    component: Inline[],
    index?: number,
    customerUpdate: boolean = false
  ) {
    component.forEach((item) => {
      if (!(item instanceof Inline)) {
        throw createError("该组件仅能添加 Inline 类型的组件", item);
      }
    });
    super.addChildren(component, index);
    updateComponent(this, customerUpdate);
  }

  removeChildren(
    component: Inline | number,
    index?: number,
    customerUpdate: boolean = false
  ) {
    let removed = super.removeChildren(component, index);
    updateComponent(this, customerUpdate);
    return removed;
  }

  splitChild(
    index: number,
    customerUpdate: boolean = false
  ): ContentCollection {
    if (!this.parent) throw createError("该组件无父组件，不能分割", this);
    let isTail = index === this.children.size;
    let tail = isTail ? [] : this.children.slice(index).toArray();
    if (!isTail) {
      this.removeChildren(index, this.children.size - index, customerUpdate);
    }
    let thisIndex = this.parent.findChildrenIndex(this);
    let newCollection = this.createEmpty();
    if (!isTail) {
      newCollection.addChildren(tail, 0, true);
    }
    this.parent.addChildren([newCollection], thisIndex + 1, customerUpdate);
    return newCollection;
  }

  addText(text: string, index?: number, customerUpdate: boolean = false) {
    let componentList: Character[] = [];
    for (let char of text) {
      componentList.push(new Character(char));
    }
    this.addChildren(componentList, index, customerUpdate);
    index = index ? index : this.children.size;
    return [this, index + text.length, index + text.length];
  }

  split(
    index: number,
    component?: Component | Component[],
    customerUpdate: boolean = false
  ): operatorType {
    if (!this.parent) return;
    let componentIndex = this.parent.findChildrenIndex(this);
    let splitComponent = this.splitChild(index, customerUpdate);
    if (component) {
      if (!Array.isArray(component)) component = [component];
      this.parent.addChildren(component, componentIndex + 1, customerUpdate);
    }
    return [splitComponent, 0, 0];
  }

  add(
    component: Inline[] | Inline | string,
    index: number,
    customerUpdate: boolean = false
  ): operatorType {
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
    if (!Array.isArray(component)) {
      component = [component];
    }
    this.addChildren(component, index, customerUpdate);
    return [this, index + component.length, index + component.length];
  }

  remove(
    start: number,
    end: number,
    customerUpdate: boolean = false
  ): operatorType {
    if (!this.parent) return;
    if (start < 0 && end < 0) {
      let index = this.parent.findChildrenIndex(this);
      return this.parent.childHeadDelete(this, index, customerUpdate);
    }
    end = end < 0 ? this.children.size + end : end;
    if (start > end + 1) {
      throw createError(`start：${start}、end：${end}不合法。`, this);
    }
    this.removeChildren(start, end - start + 1, customerUpdate);
    return [this, start, start];
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
      throw createError(`start：${start}、end：${end}不合法。`, this);
    }
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

  send(component: Component, customerUpdate: boolean = false): operatorType {
    return component.receive(this, customerUpdate);
  }

  receive(
    component?: Component,
    customerUpdate: boolean = false
  ): operatorType {
    let size = this.children.size;
    if (!component) return [this, size, size];
    component.removeSelf(customerUpdate);
    if (component instanceof ContentCollection) {
      this.children = this.children.push(...component.children);
      updateComponent(this, customerUpdate);
      return [this, size, size];
    }
    return;
  }

  getRawData() {
    let content: any[] = [];
    let acc: Character[] = [];
    let prevDecorate: Decorate;

    let createCharacterList = () => {
      if (!acc.length) return;
      content.push([
        acc.map((character) => character.render()),
        prevDecorate.styleIsEmpty() ? undefined : prevDecorate.getStyle(),
        prevDecorate.dataIsEmpty() ? undefined : prevDecorate.getData()
      ]);
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
      content.push(value);
    });
    createCharacterList();
    return content;
  }

  getRaw(): rawType {
    let children = this.getRawData().map((item) => {
      if (item.getRaw) {
        return item.getRaw();
      }
      let raw: rawType = {
        type: ComponentType.characterList,
        content: item[0].join("")
      };
      if (item[1]) {
        raw.style = item[1];
      }
      if (item[2]) {
        raw.data = item[2];
      }
      return raw;
    });
    let raw: rawType = {
      type: this.type,
      children: children
    };
    if (!this.decorate.styleIsEmpty()) {
      raw.style = this.decorate.getStyle();
    }
    if (!this.decorate.dataIsEmpty()) {
      raw.data = this.decorate.getData();
    }
    return raw;
  }

  getContent() {
    const builder = getContentBuilder();
    return this.getRawData().map((item, index) => {
      if (item.render) {
        return item.render();
      }
      return builder.buildCharacterList(
        `${this.id}__${index}`,
        item[0],
        item[1] || {},
        item[2] || {}
      );
    });
  }
}

export default ContentCollection;
