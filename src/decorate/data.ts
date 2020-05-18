import { Map } from "immutable";
import BaseDecorate, { storeData } from "./base";

export default class DataDecorate extends BaseDecorate {
  data: Map<string, string>;

  constructor(style: storeData = {}, data: storeData = {}) {
    super(style);
    this.data = Map(data);
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
