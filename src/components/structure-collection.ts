import Collection from "./collection";
import Component, { operatorType } from "./component";
import updateComponent from "../selection-operator/update-component";
import { createError } from "./util";
import Paragraph from "./paragraph";

abstract class StructureCollection<T extends Component> extends Collection<T> {
  addChildren(
    component: T | T[],
    index?: number,
    customerUpdate: boolean = false
  ) {
    if (!Array.isArray(component)) {
      component = [component];
    }
    component.forEach((item) => {
      item.parent = this;
      item.actived = true;
    });
    return super.addChildren(component, index, customerUpdate);
  }

  replaceChild(
    component: T,
    oldComponent: T,
    customerUpdate: boolean = false
  ): operatorType {
    let index = this.findChildrenIndex(oldComponent);
    if (index === -1) {
      throw Error("需要替换的组件不是此组件的子组件！");
    }
    component.actived = true;
    component.parent = this;
    oldComponent.actived = false;
    oldComponent.parent = undefined;
    this.children = this.children.splice(index, 1, component);
    updateComponent([oldComponent, component], customerUpdate);
    return [component, 0, 0];
  }

  split(
    index: number,
    component?: T | T[],
    customerUpdate: boolean = false
  ): operatorType {
    if (!this.parent) return;
    let componentIndex = this.parent.findChildrenIndex(this);
    let splitComponent = this.splitChild(index, customerUpdate);
    if (!splitComponent) return;
    this.parent.addChildren(
      splitComponent[1],
      componentIndex + 1,
      customerUpdate
    );
    if (component) {
      this.parent.addChildren(component, componentIndex + 1, customerUpdate);
      if (Array.isArray(component)) {
        return [component[1], 0, 0];
      }
      return [component, 0, 0];
    }
    return;
  }

  findChildrenIndex(idOrComponent: string | T): number {
    let id =
      typeof idOrComponent === "string" ? idOrComponent : idOrComponent.id;
    let index = this.children.findIndex((item) => item.id === id);
    if (index < 0) throw createError('该组件不在子组件列表中');
    return index;
  }

  getPrev(idOrComponent: string | T) {
    let index = this.findChildrenIndex(idOrComponent);
    return this.children.get(index - 1);
  }

  getNext(idOrComponent: string | T) {
    let index = this.findChildrenIndex(idOrComponent);
    return this.children.get(index + 1);
  }

  getIdList(startId?: string, endId?: string): [boolean, boolean, string[]] {
    if (this.children.size === 0) return [false, false, []];
    if (!startId) {
      startId = this.children.get(0)?.id as string;
    }
    if (!endId) {
      endId = startId;
    }
    let res: string[] = [];
    let startFlag = false;
    let endFlag = false;

    this.children.forEach((component) => {
      if (endFlag) return;
      if (component instanceof StructureCollection) {
        let temp = component.getIdList(startFlag ? "" : startId, endId);
        startFlag = startFlag || temp[0];
        endFlag = endFlag || temp[1];
        res.push(...temp[2]);
        return;
      }
      if (component.id === startId) {
        res.push(component.id);
        startFlag = true;
        if (component.id === endId) {
          endFlag = true;
        }
        return;
      }
      if (component.id === endId) {
        res.push(component.id);
        endFlag = true;
        return;
      }
      if (startFlag && !endFlag) {
        res.push(component.id);
      }
    });
    // [是否已找到 startId, 是否已找到 endId, 在范围内的 Id]
    return [startFlag, endFlag, res];
  }
}

export default StructureCollection;