import Component, { operatorType, rawType } from "./component";
import Paragraph from "./paragraph";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate/index";
import { createError } from "./util";

type mediaType = "image" | "audio" | "video";

class Media extends Component {
  type: ComponentType = ComponentType.media;
  src: string;
  mediaType: mediaType;
  structureType = StructureType.content;

  static create(raw: rawType): Media {
    return new Media(
      raw.mediaType as mediaType,
      raw.src || "",
      raw.style,
      raw.data
    );
  }

  constructor(
    mediaType: mediaType,
    src: string,
    style?: storeData,
    data?: storeData
  ) {
    super(style, data);
    this.mediaType = mediaType;
    this.src = src;
  }

  setSrc(src: string) {
    this.src = src;
  }

  getSize(): number {
    return 1;
  }

  removeSelf(customerUpdate: boolean = false): operatorType {
    let paragraph = new Paragraph();
    this.replaceSelf(paragraph, customerUpdate);
    return [paragraph, 0, 0];
  }

  receive(
    component?: Component,
    customerUpdate: boolean = false
  ): operatorType {
    if (!component) return;
    if (component.isEmpty()) {
      component.removeSelf(customerUpdate);
      return [this, 1, 1];
    }
    super.removeSelf(customerUpdate);
    return [component, 0, 0];
  }

  split(
    index: number,
    component?: Component,
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.parent;
    if (!parent) throw createError("该节点已失效", this);
    if (!component) {
      component = new Paragraph();
    }
    let componentIndex = parent.findChildrenIndex(this);
    if (index === 0) {
      parent.addChildren([component], componentIndex, customerUpdate);
    }
    if (index === 1) {
      parent.addChildren([component], componentIndex + 1, customerUpdate);
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

  modifyContentDecorate(
    start: number,
    end: number,
    style?: storeData,
    data?: storeData,
    customerUpdate: boolean = false
  ) {
    this.modifyDecorate(style, data, customerUpdate);
    return [this, 0, 1];
  }

  getRaw(): rawType {
    let raw: rawType = {
      type: this.type,
      mediaType: this.mediaType,
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
      image: builder.buildeImage,
      audio: builder.buildeAudio,
      video: builder.buildeVideo
    };
    return map[this.mediaType](
      this.id,
      this.src,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

export default Media;
