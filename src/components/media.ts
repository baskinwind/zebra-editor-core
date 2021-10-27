import Editor from "../editor";
import { OperatorType, JSONType } from "./component";
import Block, { BlockType, BlockSnapshoot } from "./block";
import AbstractView from "../view/base-view";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { AnyObject } from "../decorate/index";
import ComponentFactory from "../factory";

export type MediaType = "image" | "audio" | "video";

export interface MediaSnapshoot extends BlockSnapshoot {
  mediaType: MediaType;
  src: string;
}

class Media extends Block {
  src: string;
  mediaType: MediaType;
  type = ComponentType.media;
  structureType = StructureType.media;

  static create(componentFactory: ComponentFactory, json: JSONType): Media {
    const media = componentFactory.buildMedia(json.mediaType as MediaType, json.src || "");
    media.modifyDecorate(json.style, json.data);
    return media;
  }

  constructor(mediaType: MediaType, src: string, editor?: Editor) {
    super(editor);
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
    style?: AnyObject,
    data?: AnyObject,
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

    if (index === 0) {
      parent.add(componentIndex, ...blockList);
    }

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

  snapshoot(): MediaSnapshoot {
    let snap = super.snapshoot() as MediaSnapshoot;
    snap.mediaType = this.mediaType;
    snap.src = this.src;
    return snap;
  }

  restore(state: MediaSnapshoot) {
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

  getJSON(): JSONType {
    let json = super.getJSON();
    json.src = this.src;
    json.mediaType = this.mediaType;
    return json;
  }

  render(contentView: AbstractView) {
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
