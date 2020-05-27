import Component, { operatorType } from "./component";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate/index";
import Paragraph from "./paragraph";

export default class Media extends Component {
  src: string;
  type: ComponentType.image | ComponentType.audio | ComponentType.video;
  structureType = StructureType.content;

  constructor(
    type: ComponentType.image | ComponentType.audio | ComponentType.video,
    src: string,
    style?: storeData,
    data?: storeData
  ) {
    super(style, data);
    this.type = type;
    this.src = src;
  }

  setSrc(src: string) {
    this.src = src;
  }

  removeSelf(customerUpdate: boolean = false): operatorType {
    let newParagraph = new Paragraph();
    this.replaceSelf(newParagraph, customerUpdate);
    return [newParagraph, 0, 0];
  }

  addIntoTail(
    component: Paragraph,
    customerUpdate: boolean = false
  ): operatorType {
    return this.removeSelf(customerUpdate);
  }

  split(index: number, customerUpdate: boolean = false): operatorType {
    if (!this.parent) return;
    let newParagraph = new Paragraph();
    let componentIndex = this.parent.findChildrenIndex(this);
    if (index === 0) {
      this.parent.addChildren(newParagraph, componentIndex);
    }
    if (index === 1) {
      this.parent.addChildren(newParagraph, componentIndex + 1);
    }
    return [newParagraph, 0, 0];
  }

  remove(
    start?: number,
    end?: number,
    customerUpdate: boolean = false
  ): operatorType {
    return this.replaceSelf(new Paragraph(), customerUpdate);
  }

  render() {
    let builder = getContentBuilder();
    let map = {
      [ComponentType.image]: builder.buildeImage,
      [ComponentType.audio]: builder.buildeImage,
      [ComponentType.video]: builder.buildeImage,
    };
    return map[this.type](
      this.id,
      this.src,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}
