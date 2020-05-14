import BaseDecorate from "./base";

export interface storeData {
  [key: string]: any;
}

export default class CharacterDecorate extends BaseDecorate {
  blod: boolean = false;
  delete: boolean = false;
  underLine: boolean = false;
  italic: boolean = false;
  link: string = "";

  setType(type: "blod" | "delete" | "underLine" | "italic", value: boolean) {
    this[type] = value;
  }

  setLink(href: string) {
    this.link = href;
  }
}
