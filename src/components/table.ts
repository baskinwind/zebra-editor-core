import Collection from "./collection";
import Paragraph from "./paragraph";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { storeData } from "../decorate";
import { getContentBuilder } from "../builder";
import { List } from "immutable";
import { operatorType, classType } from "./component";

class Table extends Collection<TableRow>{
  type: ComponentType = ComponentType.table;
  structureType: StructureType = StructureType.collection;
  row: number;
  col: number;
  needHead: boolean;

  constructor(row: number, col: number, needHead: boolean = true, style?: storeData, data?: storeData) {
    super(style, data);
    this.row = row;
    this.col = col;
    this.needHead = needHead;
    this.decorate.setData("tag", 'table');
    this.decorate.setStyle('width', "100%");
    this.decorate.setStyle('borderCollapse', "collapse");
    let list = [];
    if (needHead) {
      list.push(new TableRow(col, 'th'));
    }
    for (let i = 0; i < row; i++) {
      let item = new TableRow(col);
      list.push(item);
    }
    this.addChildren(list);
  }

  render() {
    return getContentBuilder().buildTable(
      this.id,
      this.children.map(item => item.render()).toArray(),
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

class TableRow extends Collection<TableCell> {
  type: ComponentType = ComponentType.tableRow;
  structureType: StructureType = StructureType.collection;
  size: number;
  cellType: 'th' | 'td';

  constructor(size: number, cellType: 'th' | 'td' = 'td', style?: storeData, data?: storeData) {
    super(style, data);
    this.size = size;
    this.cellType = cellType;
    let list = [];
    for (let j = 0; j < size; j++) {
      let item = new TableCell(this.cellType);
      list.push(item);
    }
    super.addChildren(list);
  }

  render() {
    return getContentBuilder().buildTableRow(
      this.id,
      this.children.map(item => item.render()).toArray(),
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

class TableCell extends Collection<TableItem> {
  type: ComponentType = ComponentType.tableCell;
  structureType: StructureType = StructureType.collection;
  cellType: 'th' | 'td';

  constructor(cellType: 'th' | 'td' = 'td', style?: storeData, data?: storeData) {
    super(style, data);
    this.cellType = cellType;
    super.addChildren(new TableItem());
  }

  render() {
    return getContentBuilder().buildTableCell(
      this.id,
      this.cellType,
      this.children.map(item => item.render()).toArray(),
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

class TableItem extends Paragraph {
  exchangeToOther(builder: classType, args: any[]): operatorType {
    console.error('表格内段落不允许切换！！');
    return;
  }

  remove(
    start: number,
    end: number,
    customerUpdate: boolean = false
  ) {
    if (start < 0) {
      return;
    }
    return super.remove(start, end, customerUpdate);
  }
}

export default Table;
