import { Map } from "immutable";

export interface storeData {
  [key: string]: any;
}

class Decorate {
  style: Map<string, any>;
  data: Map<string, any>;

  constructor(style: storeData = {}, data: storeData = {}) {
    this.style = Map(style);
    this.data = Map(data);
  }

  getStyle() {
    return this.style.toObject();
  }
  mergeStyle(style?: storeData) {
    if (!style) return;
    for (let key in style) {
      this.setStyle(key, style[key]);
    }
  }
  setStyle(name: string, value: any) {
    if (name === "remove") {
      if (value === "all") {
        this.clearStyle();
        return;
      }
      this.removeStyle(value as string);
    }
    if (this.style.get(name) === value) {
      this.style = this.style.delete(name);
    } else {
      this.style = this.style.set(name, value);
    }
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

  getData() {
    return this.data.toObject();
  }
  mergeData(data?: storeData) {
    if (!data) return;
    for (let key in data) {
      this.setData(key, data[key]);
    }
  }
  setData(name: string, value: any) {
    if (name === "remove") {
      if (value === "all") {
        this.clearData();
        return;
      }
      this.removeData(value as string);
    }

    if (typeof value === "boolean" && this.data.get(name) === value) {
      this.data = this.data.delete(name);
    } else {
      this.data = this.data.set(name, value);
    }
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
    return this.style.size === 0 && this.data.size === 0;
  }

  clear() {
    this.clearData();
    this.clearStyle();
  }
}

export default Decorate;
