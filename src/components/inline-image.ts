import Inline from "./inline";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate/index";
import updateComponent from "../selection-operator/update-component";

class InlineImage extends Inline {
  type = ComponentType.inlineImage;
  structureType = StructureType.none;
  content: string = "$$$INLINEIMAGE$$$";
  src: string;

  constructor(src: string, style?: storeData, data?: storeData) {
    super(style, data);
    this.src = src;
  }

  setSrc(src: string) {
    this.src = src;
    updateComponent(this);
  }

  render() {
    return getContentBuilder().buildInlineImage(
      this.id,
      this.src,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

export default InlineImage;
