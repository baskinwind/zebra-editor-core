import Paragraph from "./paragraph";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate";

type titleType = ComponentType.h1 | ComponentType.h2 | ComponentType.h3 | ComponentType.h4 | ComponentType.h5 | ComponentType.h6

class Title extends Paragraph {
  type: titleType;

  constructor(type: titleType, text?: string, style?: storeData, data?: storeData) {
    super(text, style, data);
    this.type = type;
  }

  render() {
    const builder = getContentBuilder();
    return builder.buildTitle(
      this.id,
      this.type,
      this.getCharList(),
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

export default Title