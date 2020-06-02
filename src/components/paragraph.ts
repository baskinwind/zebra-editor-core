import Collection from "./collection";
import Inline from "./inline";
import Character from "./character";
import Decorate from "../decorate";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import updateComponent from "../selection-operator/update-component";
import { operatorType, classType } from "./component";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate/index";

class Paragraph extends Collection<Inline> {
  type = ComponentType.paragraph;
  structureType = StructureType.content;

  static exchangeOnly(component: Paragraph, args?: any[]) {
    Reflect.setPrototypeOf(component, this.prototype);
    return component;
  }

  static exchange(
    component: Paragraph,
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

  createEmpty() {
    return new Paragraph("", this.decorate.getStyle(), this.decorate.getData());
  }

  exchangeToOther(builder: classType, args: any[]): operatorType {
    if (builder === this.constructor) return;
    builder.exchange(this, args);
    return;
  }

  addText(text: string, index?: number, customerUpdate: boolean = false) {
    let componentList: Character[] = [];
    for (let char of text) {
      componentList.push(new Character(char));
    }
    return this.addChildren(componentList, index, customerUpdate);
  }

  removeChildren(
    indexOrComponent: Inline | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false
  ): operatorType {
    if (indexOrComponent < 0 && removeNumber === 1) {
      let parent = this.parent;
      if (!parent) return;
      let prev = parent.getPrev(this);
      if (prev) {
        return prev.addIntoTail(this);
      }
      return [this, 0, 0];
    }
    return super.removeChildren(indexOrComponent, removeNumber, customerUpdate);
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

  mergaParagraph(
    paragraph: Paragraph,
    customerUpdate: boolean = false
  ): operatorType {
    paragraph.removeSelf();
    let size = this.children.size;
    this.children = this.children.push(...paragraph.children);
    updateComponent(this, customerUpdate);
    return [this, size, size];
  }

  add(
    component: Inline[] | Inline | string,
    index: number,
    customerUpdate: boolean = false
  ) {
    debugger;
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
    component: Paragraph,
    customerUpdate: boolean = false
  ): operatorType {
    return this?.mergaParagraph(component, customerUpdate);
  }

  remove(
    start: number,
    end: number,
    customerUpdate: boolean = false
  ): operatorType {
    end = end < 0 && start >= 0 ? this.children.size + end : end;
    if (start > end) {
      console.error(Error(`start：${start}、end：${end}不合法。`));
      return;
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

  render() {
    const builder = getContentBuilder();
    return builder.buildParagraph(
      this.id,
      this.getContent(),
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

export default Paragraph;
