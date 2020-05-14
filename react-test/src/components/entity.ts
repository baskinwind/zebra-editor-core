import { Map } from "immutable";
import getId from "../util/get-id";

export interface storeData {
  [key: string]: any;
}

export default class Entity {
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
    this.style = this.style.set(name, value);
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
  removeData(name: string) {
    this.data = this.data.delete(name);
  }
  clearData() {
    this.data = this.data.clear();
  }
}
