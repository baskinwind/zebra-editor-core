import getId from "../util/getId";

export default class Entity {
  id: string = getId();
  style: {
    [name: string]: string;
  } = {};
  data: {
    [name: string]: string;
  } = {};

  constructor(style = {}, data = {}) {
    this.style = style;
    this.data = data;
  }

  getStyle() {
    return this.style;
  }
  setStyle(name: string, value: string) {
    this.style[name] = value;
  }
  removeStyle(name: string) {
    if (this.style[name]) {
      delete this.style[name];
    }
  }
  clearStyle() {
    this.style = {};
  }
  getData() {
    return this.data;
  }
  setData(name: string, value: string) {
    this.data[name] = value;
  }
  removeData(name: string) {
    if (this.data[name]) {
      delete this.data[name];
    }
  }
  clearData() {
    this.data = {};
  }
}
