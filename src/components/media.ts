import Component from "./component";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate/index";

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
