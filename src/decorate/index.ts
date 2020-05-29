import { Map } from "immutable";
import { getId } from "./util";

export interface storeData {
  [key: string]: any;
}

class Decorate {
  id: string = getId();
  style: Map<string, string>;
  data: Map<string, string>;

  constructor(style: storeData = {}, data: storeData = {}) {
    this.style = Map(style);
    this.data = Map(data);
  }

  getStyle() {
    return this.style.toObject();
  }
  setStyle(name: string, value: string) {
    if (name === "clear" && value === "style") {
      this.clearStyle();
      return;
    }
    if (this.style.get(name) === value) {
      this.style = this.style.delete(name);
    } else {
      this.style = this.style.set(name, value);
    }
  }
  mergeStyle(style?: storeData) {
    if (!style) return;
    for (let key in style) {
      this.setStyle(key, style[key]);
    }
  }
  removeStyle(name: string) {
    this.style = this.style.delete(name);
  }
  clearStyle() {
    this.style = this.style.clear();
  }

  getData() {
    return this.data.toObject();
  }
  setData(name: string, value: string) {
    this.data = this.data.set(name, value);
  }
  mergeData(data?: storeData) {
    if (!data) return;
    for (let key in data) {
      this.setData(key, data[key]);
    }
  }
  removeData(name: string) {
    this.data = this.data.delete(name);
  }
  clearData() {
    this.data = this.data.clear();
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
    return this.style.size === 0 && this.data.size === 0;
  }

  clear() {
    this.clearData();
    this.clearStyle();
  }
}

export default Decorate;
