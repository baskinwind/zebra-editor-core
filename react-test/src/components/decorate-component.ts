import { storeData } from "../decorate/base";

import Component from "./component";
import DataDecorate from "../decorate/data";

export default abstract class BlockComponent extends Component {
  decorate: DataDecorate;

  constructor(style?: storeData, data?: storeData) {
    super();
    this.decorate = new DataDecorate(style, data);
  }
}
