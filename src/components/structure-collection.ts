import Collection from "./collection";
import Component, { operatorType, rawType } from "./component";
import updateComponent from "../selection-operator/update-component";
import StructureType from "../const/structure-type";
import { createError } from "./util";

abstract class StructureCollection<T extends Component> extends Collection<T> {
  structureType = StructureType.collection;

  addChildren(component: T[], index?: number, customerUpdate: boolean = false) {
    component.forEach((item) => {
      item.parent = this;
      item.actived = true;
    });
    super.addChildren(component, index);
    updateComponent(component.reverse(), customerUpdate);
  }

  removeChildren(
    indexOrComponent: T | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false
  ) {
    let removed = super.removeChildren(indexOrComponent, removeNumber);
    removed.forEach((component) => {
      component.actived = false;
      component.parent = undefined;
    });
    updateComponent(removed, customerUpdate);
    return removed;
  }

  replaceChild(component: T, oldComponent: T, customerUpdate: boolean = false) {
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
  }

  splitChild(
    index: number,
    customerUpdate: boolean = false
  ): StructureCollection<T> | undefined {
    let parent = this.parent;
    if (!parent) throw createError("该组件无父组件，不能分割", this);
    if (index >= this.children.size) {
      return;
    }
    let tail = this.children.slice(index).toArray();
    let thisIndex = parent.findChildrenIndex(this);
    this.removeChildren(index, this.children.size - index, customerUpdate);
    let newCollection = this.createEmpty();
    newCollection.addChildren(tail, 0, true);
    if (!this.actived) {
      thisIndex -= 1;
    }
    parent.addChildren([newCollection], thisIndex + 1);
    return newCollection;
  }

  split(
    index: number,
    component?: Component | Component[],
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.parent;
    if (!parent) return;
    let componentIndex = parent.findChildrenIndex(this);
    if (index !== 0) {
      this.splitChild(index, customerUpdate);
    } else {
      componentIndex -= 1;
    }
    if (this.isEmpty()) {
      this.removeSelf();
      componentIndex -= 1;
    }
    if (component) {
      if (!Array.isArray(component)) component = [component];
      parent.addChildren(component, componentIndex + 1, customerUpdate);
      return [component[0], 0, 0];
    }
    return;
  }

  findChildrenIndex(idOrComponent: string | T): number {
    let id =
      typeof idOrComponent === "string" ? idOrComponent : idOrComponent.id;
    let index = this.children.findIndex((item) => item.id === id);
    if (index < 0) throw createError("该组件不在子组件列表中");
    return index;
  }

  getPrev(idOrComponent: string | T): T | undefined {
    let index = this.findChildrenIndex(idOrComponent);
    if (index === 0) return;
    return this.children.get(index - 1);
  }

  getNext(idOrComponent: string | T): T | undefined {
    let index = this.findChildrenIndex(idOrComponent);
    if (index === this.children.size) return;
    return this.children.get(index + 1);
  }

  getIdList(startId?: string, endId?: string): [boolean, boolean, string[]] {
    if (this.isEmpty()) return [false, false, []];
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
      if (component.id === startId || startId === "") {
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

  getRaw(): rawType {
    let raw: rawType = {
      type: this.type,
      children: this.children.toArray().map((item) => item.getRaw())
    };
    if (!this.decorate.styleIsEmpty()) {
      raw.style = this.decorate.getStyle();
    }
    if (!this.decorate.dataIsEmpty()) {
      raw.data = this.decorate.getData();
    }
    return raw;
  }
}

export default StructureCollection;
