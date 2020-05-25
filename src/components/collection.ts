import { List } from "immutable";
import Component from "./component";
import StructureType from "../const/structure-type";

export default abstract class Collection<
  T extends Component
> extends Component {
  children: List<T> = List();

  addChildren(component: T | T[], index?: number) {
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
    if (typeof index === "number") {
      this.children = this.children.splice(index, 0, ...components);
    } else {
      this.children = this.children.push(...components);
    }
  }

  removeChildren(indexOrComponent: T | number, removeNumber: number = 1) {
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
    });
    this.children = this.children.splice(removeIndex, removeNumber);
  }

  replaceChild(component: T, oldComponent: T) {
    let index = oldComponent ? this.findChildrenIndex(oldComponent) : -1;
    component.actived = true;
    component.parent = this;
    oldComponent.actived = false;
    if (index !== -1) {
      this.children = this.children.splice(index, 1, component);
    } else {
      this.children = this.children.push(component);
    }
  }

  findChildrenIndex(idOrComponent: string | T): number {
    let id =
      typeof idOrComponent === "string" ? idOrComponent : idOrComponent.id;
    return this.children.findIndex((item) => item.id === id);
  }

  getNext(idOrComponent: string | T) {
    let index = this.findChildrenIndex(idOrComponent);
    return this.children.get(index + 1);
  }

  getPrev(idOrComponent: string | T) {
    let index = this.findChildrenIndex(idOrComponent);
    return this.children.get(index - 1);
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
        component.structureType === StructureType.structure
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
