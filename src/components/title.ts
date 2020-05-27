import Paragraph from "./paragraph";
import { storeData } from "../decorate";

type titleType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

class Title extends Paragraph {
  titleType: titleType;
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
