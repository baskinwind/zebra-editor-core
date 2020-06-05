import StructureCollection from "./structure-collection";
import ContentCollection from "./content-collection";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { storeData } from "../decorate";
import { getContentBuilder } from "../builder";
import Component, { operatorType, classType, rawType } from "./component";
import { createError } from "./util";

type tableCellChildType = string | TableItem | undefined;

class Table extends StructureCollection<TableRow> {
  type: ComponentType = ComponentType.table;
  structureType: StructureType = StructureType.collection;
  row: number;
  col: number;
  needHead: boolean;

  static create(raw: rawType): Table {
    let table = new Table(0, 0, [], false, raw.style, raw.data);
    let children = raw.children
      ? raw.children.map((item) => TableRow.create(item))
      : [];
    table.addChildren(children, 0, true);
    return table;
  }

  constructor(
    row: number,
    col: number,
    children: (tableCellChildType[] | tableCellChildType)[][] = [],
    needHead: boolean = true,
    style?: storeData,
    data?: storeData
  ) {
    super(style, data);
    this.row = row;
    this.col = col;
    this.needHead = needHead;
    this.decorate.setData("tag", "table");
    this.decorate.setStyle("width", "100%");
    this.decorate.setStyle("borderCollapse", "collapse");
    let list = [];
    for (let i = 0; i < row + (needHead ? 1 : 0); i++) {
      if (needHead && i === 0) {
        list.push(new TableRow(col, children[i], "th"));
      } else {
        list.push(new TableRow(col, children[i]));
      }
    }
    this.addChildren(list, 0, true);
  }

  setTableRow(row?: number) {
    if (!row || row === this.row) return;
    if (row > this.row) {
      let list = [];
      for (let i = this.row; i < row; i++) {
        let item = new TableRow(this.col);
        list.push(item);
      }
      this.addChildren(list);
    } else {
      this.removeChildren(row, this.row - row);
    }
    this.row = row;
  }

  setTableCol(col?: number) {
    if (!col || col === this.col) return;
    this.children.forEach((item) => item.setSize(col));
    this.col = col;
  }

  setTableHead(needHead?: boolean) {
    if (needHead === undefined) return;
    if (needHead === this.needHead) return;
    if (needHead) {
      this.addChildren([new TableRow(this.col, [], "th")], 0);
    } else {
      this.removeChildren(0, 1);
    }
    this.needHead = needHead;
  }

  receive(
    component?: Component,
    customerUpdate: boolean = false
  ): operatorType {
    if (!component) return;
    this.removeSelf(customerUpdate);
    return [component, 0, 0];
  }

  getRaw() {
    let raw = super.getRaw();
    raw.needHead = this.needHead;
    raw.row = this.row;
    raw.col = this.col;
    return raw;
  }

  render() {
    return getContentBuilder().buildTable(
      this.id,
      this.children.map((item) => item.render()).toArray(),
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

class TableRow extends StructureCollection<TableCell> {
  parent?: Table;
  type: ComponentType = ComponentType.tableRow;
  structureType: StructureType = StructureType.collection;
  size: number;
  cellType: "th" | "td";
  emptyCell: number = 0;
  inCountEmptyCell: boolean = false;

  static create(raw: rawType): TableRow {
    let tableRow = new TableRow(0, [], raw.cellType, raw.style, raw.data);
    let children = raw.children
      ? raw.children.map((item) => TableCell.create(item))
      : [];
    tableRow.addChildren(children, 0, true);
    return tableRow;
  }

  constructor(
    size: number,
    children: (tableCellChildType[] | tableCellChildType)[] = [],
    cellType: "th" | "td" = "td",
    style?: storeData,
    data?: storeData
  ) {
    super(style, data);
    this.size = size;
    this.cellType = cellType;
    let list = [];
    for (let i = 0; i < size; i++) {
      let item = new TableCell(children[i], this.cellType);
      list.push(item);
    }
    super.addChildren(list, 0, true);
  }

  setSize(size?: number) {
    if (!size || size === this.size) return;
    if (size > this.size) {
      let list = [];
      for (let i = this.size; i < size; i++) {
        let item = new TableCell("", this.cellType);
        list.push(item);
      }
      this.addChildren(list);
    } else {
      this.removeChildren(size, this.size - size);
    }
    this.size = size;
  }

  removeChildren(
    indexOrComponent: TableCell | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false
  ): TableCell[] {
    throw createError("单元格不允许被删除！");
  }

  addEmptyCell(customerUpdate: boolean = false) {
    if (!this.inCountEmptyCell) {
      Promise.resolve().then(() => {
        this.inCountEmptyCell = false;
        this.emptyCell = 0;
      });
    }
    this.inCountEmptyCell = true;
    this.emptyCell += 1;
    if (this.emptyCell === this.children.size) {
      let parent = this.parent;
      if (!parent) return;
      this.removeSelf(customerUpdate);
      if (this.cellType === "th") {
        parent.needHead = false;
      } else {
        parent.row -= 1;
      }
    }
  }

  getRaw() {
    let raw = super.getRaw();
    raw.cellType = this.cellType;
    return raw;
  }

  render() {
    return getContentBuilder().buildTableRow(
      this.id,
      this.children.map((item) => item.render()).toArray(),
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

class TableCell extends StructureCollection<TableItem> {
  parent?: TableRow;
  type: ComponentType = ComponentType.tableCell;
  structureType: StructureType = StructureType.collection;
  cellType: "th" | "td";

  static create(raw: rawType): TableCell {
    let tableCell = new TableCell("", raw.cellType, raw.style, raw.data);
    let children = raw.children
      ? raw.children.map((item) => TableItem.create(item))
      : [];
    tableCell.addChildren(children, 0, true);
    if (children.length) {
      tableCell.removeChildren(tableCell.children.size - 1, 1, true);
    }
    return tableCell;
  }

  constructor(
    children: tableCellChildType[] | tableCellChildType = "",
    cellType: "th" | "td" = "td",
    style?: storeData,
    data?: storeData
  ) {
    super(style, data);
    this.cellType = cellType;
    if (!Array.isArray(children)) children = [children];
    this.addChildren(
      children.map((item) => {
        if (!item) {
          return new TableItem();
        }
        if (typeof item === "string") {
          return new TableItem(item);
        }
        return item;
      }),
      0,
      true
    );
  }

  isEmpty() {
    return (
      this.children.size === 1 && this.children.get(0)?.children.size === 0
    );
  }

  removeChildren(
    indexOrComponent: TableItem | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false
  ) {
    if (this.children.size === 1 && removeNumber === 1) {
      let component = this.children.get(0) as TableItem;
      component?.remove(0, -1, customerUpdate);
      return [component];
    }
    let removed = super.removeChildren(
      indexOrComponent,
      removeNumber,
      customerUpdate
    );
    return removed;
  }

  childHeadDelete(
    component: TableItem,
    index: number,
    customerUpdate: boolean = false
  ): operatorType {
    let prev = this.getPrev(component);
    if (!prev) return;
    return component.send(component, customerUpdate);
  }

  render() {
    return getContentBuilder().buildTableCell(
      this.id,
      this.cellType,
      this.children.map((item) => item.render()).toArray(),
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

class TableItem extends ContentCollection {
  parent?: TableCell;
  type = ComponentType.tableItem;
  emptyCellList: TableCell[] = [];

  static create(raw: rawType): TableItem {
    let tableItem = new TableItem("", raw.style, raw.data);
    let children = super.getChildren(raw);
    tableItem.addChildren(children, 0, true);
    return tableItem;
  }

  exchangeToOther(builder: classType, args: any[]): operatorType {
    throw createError("表格内段落不允许切换类型！！", this);
  }

  createEmpty() {
    return new TableItem("", this.decorate.getStyle(), this.decorate.getData());
  }

  removeSelf(customerUpdate: boolean = false): operatorType {
    let res = super.removeSelf(customerUpdate);
    let parent = this.parent;
    if (!parent) return res;
    if (parent.isEmpty()) {
      parent.parent?.addEmptyCell(customerUpdate);
    }
    return res;
  }

  split(
    index: number,
    component?: TableItem | TableItem[],
    customerUpdate: boolean = false
  ): operatorType {
    // 不允许别的类型添加
    let hasComponent: boolean = component !== undefined;
    if (Array.isArray(component)) {
      if (component.length === 0) hasComponent = false;
      component = component.filter((item) => {
        if (!(item instanceof ContentCollection)) return;
        TableItem.exchangeOnly(item);
        return true;
      });
      component = component.length === 0 ? undefined : component;
    } else if (component && component instanceof ContentCollection) {
      component = [TableItem.exchangeOnly(component) as TableItem];
    } else {
      component = undefined;
    }
    if (hasComponent && component === undefined) {
      return;
    }
    return super.split(index, component, customerUpdate);
  }

  send(component: Component, customerUpdate: boolean = false): operatorType {
    try {
      this.parent?.findChildrenIndex(component);
      return super.send(component, customerUpdate);
    } catch {
      return component.receive(undefined, customerUpdate);
    }
  }

  render() {
    const builder = getContentBuilder();
    return builder.buildParagraph(
      this.id,
      this.getContent(),
      this.decorate.getStyle(),
      { ...this.decorate.getData(), tag: "p" }
    );
  }
}

export default Table;

export { TableItem };
