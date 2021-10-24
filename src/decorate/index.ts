import { Map } from "immutable";
import Component from "../components/component";

export interface AnyObject {
  [key: string]: any;
}

class Decorate {
  component: Component;
  style: Map<string, any> = Map();
  data: Map<string, any> = Map();

  constructor(component: Component) {
    this.component = component;
  }

  copyStyle() {
    return this.style.toObject();
  }
  getStyle() {
    return { ...this.component.style, ...this.style.toObject() };
  }
  mergeStyle(style?: AnyObject) {
    if (!style) return;

    // 移除逻辑
    if (style.remove) {
      if (style.remove === "all") {
        this.style = this.style.clear();
      } else {
        this.style = this.style.removeAll(style.remove.split(","));
      }
      return;
    }

    this.style = this.style.merge(style);
  }
  styleIsEmpty(): boolean {
    return this.style.size === 0;
  }

  copyData() {
    return this.data.toObject();
  }
  getData() {
    return { ...this.component.data, ...this.data.toObject() };
  }
  mergeData(data?: AnyObject) {
    if (!data) return;

    // 移除逻辑
    if (data.remove) {
      if (data.remove === "all") {
        this.data = this.data.clear();
      } else {
        this.data = this.data.removeAll(data.remove.split(","));
      }
      return;
    }

    // 切换逻辑
    if (data.toggle) {
      let keyList = (data.toggle as string).split(",");
      let toggleMap: AnyObject = {};
      keyList.forEach((each) => {
        toggleMap[each] = !this.data.get(each);
      });
      this.data = this.data.merge(toggleMap);
      return;
    }

    this.data = this.data.merge(data);
  }
  dataIsEmpty(): boolean {
    return this.data.size === 0;
  }

  isSame(decorate?: Decorate): boolean {
    if (
      decorate === undefined ||
      decorate.style.size !== this.style.size ||
      decorate.data.size !== this.data.size
    ) {
      return false;
    }

    for (const key in this.style) {
      if (decorate.style.get(key) !== this.style.get(key)) {
        return false;
      }
    }

    for (const key in this.data) {
      if (decorate.data.get(key) !== this.data.get(key)) {
        return false;
      }
    }

    return true;
  }

  isEmpty(): boolean {
    return this.style.size === 0 && this.data.size === 0;
  }

  clear() {
    this.style = this.style.clear();
    this.data = this.data.clear();
  }
}

export default Decorate;
