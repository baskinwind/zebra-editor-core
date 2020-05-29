import { List } from "immutable";
import Component, { operatorType } from "./component";
import StructureType from "../const/structure-type";
import updateComponent from "../selection-operator/update-component";

export default abstract class Collection<
  T extends Component
> extends Component {
  children: List<T> = List();

  addChildren(
    component: T | T[],
    index?: number,
    customerUpdate: boolean = false
  ): operatorType {
    let components: T[];
    if (!Array.isArray(component)) {
      components = [component];
    } else {
      components = component;
    }
    components.forEach((component) => {
      component.parent = this;
      component.actived = true;
    });
    let addIndex = index !== undefined ? index : this.children.size;
    this.children = this.children.splice(addIndex, 0, ...components);

    if (this.structureType === StructureType.collection) {
      updateComponent(components, customerUpdate);
      return [components[0], 0, 0];
    }

    if (this.structureType === StructureType.content) {
      updateComponent(this, customerUpdate);
      return [this, addIndex + components.length, addIndex + components.length];
    }
  }

  removeChildren(
    indexOrComponent: T | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false
  ): operatorType {
    let removeIndex: number;
    if (removeNumber === 0) return;
    if (typeof indexOrComponent === "number") {
      removeIndex = indexOrComponent;
    } else {
      let temp = this.children.findIndex(
        (component) => component.id === indexOrComponent.id
      );
      if (temp === -1) {
        console.error(Error("移除失败：该组件不在父组件列表内。"));
        return;
      }
      removeIndex = temp;
    }
    if (removeNumber < 0) {
      removeNumber = this.children.size - removeIndex;
    }

    let removedComponent = this.children.slice(
      removeIndex,
      removeIndex + removeNumber
    );
    removedComponent.forEach((component) => {
      component.actived = false;
      component.parent = undefined;
    });

    this.children = this.children.splice(removeIndex, removeNumber);
    if (this.structureType === StructureType.collection) {
      updateComponent(removedComponent.toArray(), customerUpdate);
      return;
    }
    if (this.structureType === StructureType.content) {
      updateComponent(this, customerUpdate);
      return [this, removeIndex, removeIndex];
    }
  }

  replaceChild(
    component: T,
    oldComponent: T,
    customerUpdate: boolean = false
  ): operatorType {
    let index = oldComponent ? this.findChildrenIndex(oldComponent) : -1;
    component.actived = true;
    component.parent = this;
    oldComponent.actived = false;
    oldComponent.parent = undefined;
    if (index !== -1) {
      this.children = this.children.splice(index, 1, component);
    } else {
      this.children = this.children.push(component);
    }
    updateComponent([oldComponent, component], customerUpdate);
    return [component, 0, 0];
  }

  findChildrenIndex(idOrComponent: string | T): number {
    let id =
      typeof idOrComponent === "string" ? idOrComponent : idOrComponent.id;
    return this.children.findIndex((item) => item.id === id);
  }

  getPrev(idOrComponent: string | T) {
    let index = this.findChildrenIndex(idOrComponent);
    if (index <= 0) return;
    return this.children.get(index - 1);
  }

  getNext(idOrComponent: string | T) {
    let index = this.findChildrenIndex(idOrComponent);
    if (index === -1 || index === this.children.size - 1) return;
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
      if (
        component instanceof Collection &&
        component.structureType === StructureType.collection
      ) {
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
