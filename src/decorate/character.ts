import BaseDecorate from "./base";

export interface storeData {
  [key: string]: any;
}

export default class CharacterDecorate extends BaseDecorate {
  link: string = "";

  setLink(href: string) {
    this.link = href;
  }

  isSame(decorate?: CharacterDecorate): boolean {
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
    return true;
  }

  clone() {
    let newDecorate = new CharacterDecorate(this.getStyle());
    newDecorate.setLink(this.link);
    return newDecorate;
  }
}
