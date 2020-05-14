import { Map } from "immutable";
import getId from "../util/get-id";

export interface storeData {
  [key: string]: any;
}

export default class BaseDecorate {
  id: string = getId();
  style: Map<string, string>;

  constructor(style: storeData = {}) {
    this.style = Map(style);
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
}
