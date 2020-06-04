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
    let children = raw.children
      ? raw.children.map((item: rawType) =>
          item.children
            ? item.children.map((item: any) => TableItem.create(item))
            : []
        )
      : [];
    return new Table(
      raw.row || 3,
      raw.col || 3,
      children,
      raw.needHead,
      raw.style,
      raw.data
    );
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

  addIntoTail(
    component: Component,
    customerUpdate: boolean = false
  ): operatorType {
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
  type: ComponentType = ComponentType.tableRow;
  structureType: StructureType = StructureType.collection;
  size: number;
  cellType: "th" | "td";

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
  type: ComponentType = ComponentType.tableCell;
  structureType: StructureType = StructureType.collection;
  cellType: "th" | "td";

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

  childHeadDelete(component: TableItem, index: number): operatorType {
    let prev = this.getPrev(component);
    if (!prev) return;
    return prev.addIntoTail(component);
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
  type = ComponentType.tableItem;

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
      component = [TableItem.exchangeOnly(component)];
    } else {
      component = undefined;
    }
    if (hasComponent && component === undefined) {
      return;
    }
    return super.split(index, component, customerUpdate);
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
