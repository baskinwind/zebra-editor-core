import BlockComponent from "./decorate-component";
import { storeData } from "./entity";

import { getBuilder } from "../builder";
import ComponentType from "../const/component-type";

export default class Media extends BlockComponent {
  src: string;
  type: ComponentType.image | ComponentType.audio | ComponentType.video;

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
  getContent() {
    let builder = getBuilder();
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
