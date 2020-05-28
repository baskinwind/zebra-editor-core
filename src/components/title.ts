import Paragraph from "./paragraph";
import { storeData } from "../decorate";
import updateComponent from "../selection-operator/update-component";

type titleType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

class Title extends Paragraph {
  titleType: titleType;

  static exchang(component: Paragraph, args: any[], customerUpdate: boolean = false) {
    component.decorate.setData("tag", args[0] || 'h1');
    Reflect.setPrototypeOf(component, Title.prototype);
    updateComponent(component, customerUpdate);
    return component;
  }

  constructor(
    type: titleType,
    text?: string,
    style?: storeData,
    data?: storeData
  ) {
    super(text, style, data);
    this.titleType = type;
    this.decorate.setData("tag", this.titleType);
  }
}

export default Title;
