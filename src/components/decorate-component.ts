import Component from "./ccomponent";
import DataDecorate from "../decorate/data";
import { storeData } from "../decorate/base";

export default abstract class BlockComponent extends Component {
  decorate: DataDecorate;

  constructor(style?: storeData, data?: storeData) {
    super();
    this.decorate = new DataDecorate(style, data);
  }
}
