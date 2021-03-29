import ComponentFactory from ".";
import { OperatorType, IRawType } from "./component";
import Block, { BlockType, IBlockSnapshoot } from "./block";
import BaseView from "../view/base-view";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { StoreData } from "../decorate/index";

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

  constructor(mediaType: mediaType, src: string, style?: StoreData, data?: StoreData) {
    super(style, data);
    this.mediaType = mediaType;
    this.src = src;
  }

  setSrc(src: string) {
    if (this.src === src) return;
    this.componentWillChange();
    this.src = src;
    this.updateComponent([this]);
  }

  exchangeTo(builder: BlockType, args: any[]): Block[] {
    return [this];
  }

  modifyContentDecorate(
    start: number,
    end: number,
    style?: StoreData,
    data?: StoreData,
  ): OperatorType {
    this.modifyDecorate(style, data);
    return [
      { id: this.id, offset: start },
      { id: this.id, offset: end },
    ];
  }

  remove(): OperatorType {
    let paragraph = this.getComponentFactory().buildParagraph();
    this.replaceSelf(paragraph);

    return [{ id: paragraph.id, offset: 0 }];
  }

  split(index: number, ...blockList: Block[]): OperatorType {
    if (blockList.length === 0) {
      blockList.push(this.getComponentFactory().buildParagraph());
    }

    let parent = this.getParent();
    let componentIndex = parent.findChildrenIndex(this);

    // 首位分割
    if (index === 0) {
      parent.add(componentIndex, ...blockList);
    }

    // 末位分割
    if (index === 1) {
      parent.add(componentIndex + 1, ...blockList);
    }

    return [{ id: blockList[0].id, offset: 0 }];
  }

  receive(block: Block): OperatorType {
    if (block.isEmpty()) {
      block.removeSelf();
      return [{ id: this.id, offset: 1 }];
    }

    super.removeSelf();
    return [{ id: block.id, offset: 0 }];
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

  getSize(): number {
    return 1;
  }

  getType(): string {
    return `${this.type}>${this.mediaType}`;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.src = this.src;
    raw.mediaType = this.mediaType;
    return raw;
  }

  render(contentView: BaseView) {
    let map = {
      image: "buildeImage",
      audio: "buildeAudio",
      video: "buildeVideo",
    };

    return contentView[map[this.mediaType]](
      this.id,
      this.src,
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
  }
}

export default Media;
