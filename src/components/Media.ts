import Component from "./Component";
import Entity from "./Entity";

import { getBuilder } from "../builder";

export default class Media extends Component {
  src: string;
  type: "IMAGE" | "AUDIO" | "VIDEO";

  constructor(
    type: "IMAGE" | "AUDIO" | "VIDEO",
    src: string,
    style?: Entity["style"],
    data?: Entity["style"]
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
      IMAGE: builder.buildeImage,
      AUDIO: builder.buildeImage,
      VIDEO: builder.buildeImage,
    };
    return map[this.type](this.src, this.entity.getStyle, this.entity.getData);
  }
}
