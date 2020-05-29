import Collection from "./collection";
import Paragraph from "./paragraph";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { storeData } from "../decorate";

class Table extends Collection<Paragraph>{
  type: ComponentType = ComponentType.table;
  structureType: StructureType = StructureType.collection;
  row: number;
  col: number;

  constructor(row: number, col: number, style?: storeData, data?: storeData) {
    super(style, data);
    this.row = row;
    this.col = col;
    this.decorate.setData("tag", 'table');
  }

  render() {
    return
  }
}

export default Table;
