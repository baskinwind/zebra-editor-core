import { Map } from "immutable";
import Component from "../components/component";

export interface storeData {
  [key: string]: any;
}

class Decorate {
  component: Component;
  style: Map<string, any>;
  data: Map<string, any>;

  constructor(
    component: Component,
    style: storeData = {},
    data: storeData = {},
  ) {
    this.component = component;
    this.style = Map(style);
    this.data = Map(data);
  }

  copyStyle() {
    return this.style.toObject();
  }
  mergeStyle(style?: storeData) {
    if (!style) return;
    for (let key in style) {
      this.setStyle(key, style[key]);
    }
  }
  getStyle(onlyDecorate: boolean = false) {
    if (onlyDecorate) return this.style.toObject();
    return { ...this.component.style, ...this.style.toObject() };
  }
  setStyle(name: string, value: any) {
    if (name === "remove") {
      if (value === "all") {
        this.clearStyle();
        return;
      }
      this.removeStyle(value as string);
      return;
    }

    this.style = this.style.set(name, value);
  }

  removeStyle(name: string) {
    let list = name.split(",");
    list.forEach((key) => {
      this.style = this.style.delete(key);
    });
  }
  clearStyle() {
    this.style = this.style.clear();
  }
  styleIsEmpty(): boolean {
    return this.style.size === 0;
  }

  copyData() {
    return this.data.toObject();
  }
  mergeData(data?: storeData) {
    if (!data) return;
    for (let key in data) {
      this.setData(key, data[key]);
    }
  }
  getData(onlyDecorate: boolean = false) {
    if (onlyDecorate) return this.data.toObject();
    return { ...this.component.data, ...this.data.toObject() };
  }
  setData(name: string, value: any) {
    if (name === "remove") {
      if (value === "all") {
        this.clearData();
        return;
      }
      this.removeData(value as string);
      return;
    }
    if (name === "toggle") {
      this.removeStyle(value as string);
    }
    this.data = this.data.set(name, value);
  }

  toggleData(name: string) {
    let list = name.split(",");
    list.forEach((key) => {
      const prev = this.data.get(key);
      this.setData(key, !prev);
    });
  }
  removeData(name: string) {
    let list = name.split(",");
    list.forEach((key) => {
      this.data = this.data.delete(key);
    });
  }
  clearData() {
    this.data = this.data.clear();
  }
  dataIsEmpty(): boolean {
    return this.data.size === 0;
  }

  isSame(decorate?: Decorate): boolean {
    if (decorate === undefined) return false;
    if (decorate.style.size !== this.style.size) {
      return false;
    }
    let style = this.getStyle();
    for (const key in style) {
      if (decorate.style.get(key) !== style[key]) {
        return false;
      }
    }
    if (decorate.data.size !== this.data.size) {
      return false;
    }
    let data = this.getData();
    for (const key in data) {
      if (decorate.data.get(key) !== data[key]) {
        return false;
      }
    }
    return true;
  }

  isEmpty(): boolean {
    return this.styleIsEmpty() && this.dataIsEmpty();
  }

  clear() {
    this.clearData();
    this.clearStyle();
  }
}

export default Decorate;
