import Component, { operatorType } from "./component";
import Paragraph from "./paragraph";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate/index";

class Media extends Component {
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
    let paragraph = new Paragraph();
    this.replaceSelf(paragraph);
    return [paragraph, 0, 0];
  }

  addIntoTail(
    component: Component,
    customerUpdate: boolean = false
  ): operatorType {
    let paragraph = new Paragraph();
    this.replaceSelf(paragraph);
    return [paragraph, 0, 0];
  }

  split(
    index: number,
    component?: Component,
    customerUpdate: boolean = false
  ): operatorType {
    if (!this.parent) return;
    if (!component) {
      component = new Paragraph();
    }
    let componentIndex = this.parent.findChildrenIndex(this);
    if (index === 0) {
      this.parent.addChildren([component], componentIndex, customerUpdate);
    }
    if (index === 1) {
      this.parent.addChildren([component], componentIndex + 1, customerUpdate);
    }
    return [component, index, index];
  }

  remove(
    start?: number,
    end?: number,
    customerUpdate: boolean = false
  ): operatorType {
    return this.replaceSelf(new Paragraph(), customerUpdate);
  }

  getRaw() {
    return {
      type: this.type,
      src: this.src,
      style: this.decorate.getStyle(),
      data: this.decorate.getData()
    };
  }

  render() {
    let builder = getContentBuilder();
    let map = {
      [ComponentType.image]: builder.buildeImage,
      [ComponentType.audio]: builder.buildeImage,
      [ComponentType.video]: builder.buildeImage
    };
    return map[this.type](
      this.id,
      this.src,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

export default Media;
