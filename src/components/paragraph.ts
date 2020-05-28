import Collection from "./collection";
import Inline from "./inline";
import Character from "./character";
import Decorate from "../decorate";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate/index";
import updateComponent from "../selection-operator/update-component";
import { operatorType } from "./component";

export default class Paragraph extends Collection<Inline> {
  type = ComponentType.paragraph;
  structureType = StructureType.content;

  static exchang(component: Paragraph, args: any[], customerUpdate: boolean = false) {
    component.decorate.removeData("tag");
    Reflect.setPrototypeOf(component, Paragraph.prototype);
    updateComponent(component, customerUpdate);
    return component;
  }

  constructor(text?: string, style?: storeData, data?: storeData) {
    super(style, data);
    if (text) {
      this.addText(text);
    }
  }

  addText(text: string, index?: number, customerUpdate: boolean = false) {
    let componentList: Character[] = [];
    for (let char of text) {
      componentList.push(new Character(char));
    }
    return this.addChildren(componentList, index, customerUpdate);
  }

  exchangeToOther(builder: { exchang: Function }, args: any[]): operatorType {
    builder.exchang(this, args);
    return;
  }

  changeCharDecorate(start: number, end: number, style?: storeData, data?: storeData, customerUpdate: boolean = false) {
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
      let grandParent = parent?.parent;
      if (!grandParent) return;
      let parentIndex = grandParent.findChildrenIndex(parent);
      this.removeSelf();
      this.addIntoParent(grandParent, parentIndex);
      return [this, 0, 0];
    }
    return super.removeChildren(indexOrComponent, removeNumber, customerUpdate);
  }

  add(
    component: Inline | string,
    index: number,
    customerUpdate: boolean = false
  ) {
    if (typeof component === "string") {
      let decorate = this.children.get(index === 0 ? 0 : index - 1)?.decorate;
      component = new Character(
        component,
        decorate?.getStyle(),
        decorate?.getData()
      );
    }
    return this.addChildren(component, index, customerUpdate);
  }

  addIntoTail(
    component: Paragraph,
    customerUpdate: boolean = false
  ): operatorType {
    return this?.mergaParagraph(component, customerUpdate);
  }

  split(index: number, customerUpdate: boolean = false): operatorType {
    let tail = this.children.slice(index).toArray();
    if (!this.parent) return;
    let componentIndex = this.parent.findChildrenIndex(this);
    let newParagraph = new Paragraph(
      "",
      this.decorate.getStyle(),
      this.decorate.getData()
    );
    newParagraph.addChildren(tail, 0);
    this.removeChildren(index, this.children.size);
    return newParagraph.addIntoParent(this.parent, componentIndex + 1);
  }

  remove(
    start: number,
    end: number,
    customerUpdate: boolean = false
  ): operatorType {
    end = end < 0 ? this.children.size + end : end;
    if (start > end) {
      console.error(Error(`start：${start}、end：${end}不合法。`));
      return;
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
      console.error(Error(`start：${start}、end：${end}不合法。`));
      return;
    }
    return this.changeCharDecorate(
      start,
      end,
      style,
      data,
      customerUpdate
    );
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
