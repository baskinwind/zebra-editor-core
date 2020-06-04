import Component, { operatorType, rawType } from "./component";
import Paragraph from "./paragraph";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate/index";

type mediaType =
  | ComponentType.image
  | ComponentType.audio
  | ComponentType.video;

class Media extends Component {
  src: string;
  type: mediaType;
  structureType = StructureType.content;

  static create(raw: rawType): Media {
    return new Media(raw.type as mediaType, raw.src || "", raw.style, raw.data);
  }

  constructor(
    type: mediaType,
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
    super.removeSelf(customerUpdate);
    return [component, 0, 0];
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

  getRaw(): rawType {
    let raw: rawType = {
      type: this.type,
      src: this.src
    };
    if (this.decorate.styleIsEmpty()) {
      raw.style = this.decorate.getStyle();
    }
    if (this.decorate.dataIsEmpty()) {
      raw.data = this.decorate.getData();
    }
    return raw;
  }

  render() {
    let builder = getContentBuilder();
    let map = {
      [ComponentType.image]: builder.buildeImage,
      [ComponentType.audio]: builder.buildeAudio,
      [ComponentType.video]: builder.buildeVideo
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
