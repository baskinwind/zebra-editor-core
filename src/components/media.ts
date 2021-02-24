import ComponentFactory from ".";
import { operatorType, IRawType, classType } from "./component";
import Block, { IBlockSnapshoot } from "./block";
import BaseBuilder from "../content/base-builder";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { storeData } from "../decorate/index";
import updateComponent from "../util/update-component";

export type mediaType = "image" | "audio" | "video";

export interface IMediaSnapshoot extends IBlockSnapshoot {
  mediaType: mediaType;
  src: string;
}

class Media extends Block {
  src: string;
  mediaType: mediaType;
  type = ComponentType.media;
  structureType = StructureType.media;

  static create(componentFactory: ComponentFactory, raw: IRawType): Media {
    return componentFactory.buildMedia(
      raw.mediaType as mediaType,
      raw.src || "",
      raw.style,
      raw.data,
    );
  }

  constructor(
    mediaType: mediaType,
    src: string,
    style?: storeData,
    data?: storeData,
  ) {
    super(style, data);
    this.mediaType = mediaType;
    this.src = src;
  }

  setSrc(src: string) {
    if (this.src === src) return;
    this.src = src;
    updateComponent(this.editor, this);
    this.recordSnapshoot();
  }

  getSize(): number {
    return 1;
  }

  getType(): string {
    return `${this.type}>${this.mediaType}`;
  }

  getStatistic() {
    let res = super.getStatistic();
    res[this.mediaType] += 1;
    return res;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.src = this.src;
    raw.mediaType = this.mediaType;
    return raw;
  }

  exchangeTo(builder: classType, args: any[]): Block[] {
    return [this];
  }

  // removeSelf(): operatorType {
  //   let paragraph = getComponentFactory().buildParagraph();
  //   this.replaceSelf(paragraph);
  //   return [paragraph, 0, 0];
  // }

  modifyContentDecorate(
    start: number,
    end: number,
    style?: storeData,
    data?: storeData,
  ): operatorType {
    this.modifyDecorate(style, data);
    return [
      [this],
      { id: this.id, offset: start },
      { id: this.id, offset: end },
    ];
  }

  remove(start: number, end?: number): operatorType {
    const info = this.replaceSelf(this.getComponentFactory().buildParagraph());

    return [
      info[0],
      { id: this.id, offset: start },
      { id: this.id, offset: end ? end : start },
    ];
  }

  split(index: number, block?: Block): operatorType {
    let parent = this.getParent();
    if (!block) {
      block = this.getComponentFactory().buildParagraph();
    }
    let componentIndex = parent.findChildrenIndex(this);
    if (index === 0) {
      parent.addChildren([block], componentIndex);
    }
    if (index === 1) {
      parent.addChildren([block], componentIndex + 1);
    }
    return [[block], { id: block.id, offset: index }];
  }

  receive(block?: Block): operatorType {
    if (!block) return [[this]];
    if (block.isEmpty()) {
      block.removeSelf();
      return [[this, block], { id: this.id, offset: 1 }];
    }
    super.removeSelf();
    return [[block], { id: block.id, offset: 0 }];
  }

  snapshoot(): IMediaSnapshoot {
    let snap = super.snapshoot() as IMediaSnapshoot;
    snap.mediaType = this.mediaType;
    snap.src = this.src;
    return snap;
  }

  restore(state: IMediaSnapshoot) {
    this.mediaType = state.mediaType;
    this.src = state.src;
    super.restore(state);
  }

  render(contentBuilder: BaseBuilder, onlyDecorate: boolean = false) {
    let map = {
      image: "buildeImage",
      audio: "buildeAudio",
      video: "buildeVideo",
    };

    return contentBuilder[map[this.mediaType]](
      this.id,
      this.src,
      this.decorate.getStyle(onlyDecorate),
      this.decorate.getData(onlyDecorate),
    );
  }
}

export default Media;
