import ComponentFactory from ".";
import { OperatorType, IRawType } from "./component";
import Block from "./block";
import ContentCollection from "./content-collection";
import StructureCollection from "./structure-collection";
import BaseBuilder from "../builder/base-builder";
import ComponentType from "../const/component-type";
import { StoreData } from "../decorate";
import { ICollectionSnapshoot } from "./collection";
import { createError } from "../util/handle-error";

type tableCellType = string | string[];

interface ITableSnapshoot extends ICollectionSnapshoot<TableRow> {
  col: number;
  needHead: boolean;
}

class Table extends StructureCollection<TableRow> {
  type: ComponentType = ComponentType.table;

  static getTable(block: Block): Table | undefined {
    let table: Table | undefined;
    if (block instanceof TableItem) {
      table = block.parent?.parent?.parent;
    } else if (block instanceof TableCell) {
      table = block.parent?.parent;
    } else if (block instanceof TableRow) {
      table = block.parent;
    } else if (block instanceof Table) {
      table = block;
    }
    return table;
  }

  static create(componentFactory: ComponentFactory, raw: IRawType): Table {
    let table = componentFactory.buildTable(0, 0, [], [], raw.style, raw.data);
    let children = raw.children
      ? raw.children.map((item) => TableRow.create(componentFactory, item))
      : [];
    table.addChildren(0, children);
    return table;
  }

  constructor(
    row: number,
    col: number,
    head: tableCellType[] | boolean = true,
    rows: tableCellType[][] = [],
    style?: StoreData,
    data?: StoreData,
  ) {
    super(style, data);

    let tableRows = [];
    if (head) {
      if (head === true) {
        head = [];
      }
      tableRows.push(new TableRow(col, "th", head));
    }

    for (let i = 0; i < row; i++) {
      tableRows.push(new TableRow(col, "td", rows[i]));
    }

    this.addChildren(0, tableRows);
  }

  addRow(index: number) {
    let cellSize = this.getChild(0).getSize();
    let newTableRow = new TableRow(cellSize);
    this.add(newTableRow, index);
  }

  addCol(index: number) {
    this.children.forEach((item) => item.addCell(index));
  }

  removeChildren(start: number, end: number = 0): TableRow[] {
    let operator = super.removeChildren(start, end);

    // 若子元素全部删除，将自己也删除
    if (this.getSize() == 0) {
      this.removeSelf();
    }
    return operator;
  }

  removeRow(start: number, end: number = start + 1) {
    this.remove(start, end);
  }

  removeCol(start: number, end: number = start + 1) {
    this.children.forEach((item) => item.remove(start, end));
  }

  setRow(row: number) {
    let size = this.getSize();
    let cellSize = this.getChild(0).getSize();
    let hasHead = this.getChild(0).cellType === "th";
    let rowSize = hasHead ? size - 1 : size;

    if (row === rowSize) {
      return;
    }

    if (row > rowSize) {
      let list = [];
      for (let i = rowSize; i < row; i++) {
        let item = new TableRow(cellSize);
        list.push(item);
      }
      this.add(list, size + 1);
    } else {
      this.remove(row, size);
    }
  }

  setCol(col: number) {
    this.children.forEach((item) => item.setSize(col));
  }

  setHead(head: boolean) {
    let hasHead = this.getChild(0).cellType === "th";

    if (head === hasHead) return;

    if (head) {
      let colNumber = this.getChild(0).getSize();
      this.add(new TableRow(colNumber, "th", []), 0);
    } else {
      this.remove(0, 1);
    }
  }

  receive(block: Block): OperatorType {
    this.removeSelf();
    return [[block], { id: block.id, offset: 0 }];
  }

  restore(state: ITableSnapshoot) {
    super.restore(state);
  }

  getStatistic() {
    let res = super.getStatistic();
    res.table += 1;
    return res;
  }

  render(contentBuilder: BaseBuilder) {
    return contentBuilder.buildTable(
      this.id,
      () => this.children.map((item) => item.render(contentBuilder)).toArray(),
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
  }
}

class TableRow extends StructureCollection<TableCell> {
  type: ComponentType = ComponentType.tableRow;
  parent?: Table;
  cellType: "th" | "td";

  static create(componentFactory: ComponentFactory, raw: IRawType): TableRow {
    let tableRow = new TableRow(
      raw.children!.length,
      raw.cellType,
      [],
      raw.style,
      raw.data,
    );
    let children = raw.children
      ? raw.children.map((item) => TableCell.create(componentFactory, item))
      : [];
    tableRow.addChildren(0, children);
    return tableRow;
  }

  constructor(
    size: number,
    cellType: "th" | "td" = "td",
    children: tableCellType[] = [],
    style?: StoreData,
    data?: StoreData,
  ) {
    super(style, data);
    this.cellType = cellType;

    let cells = [];
    for (let i = 0; i < size; i++) {
      if (children[i]) {
        cells.push(new TableCell(this.cellType, children[i]));
      } else {
        cells.push(new TableCell(this.cellType));
      }
    }

    super.addChildren(0, cells);
  }

  addCell(index?: number) {
    let newTableCell = new TableCell(this.cellType);
    this.add(newTableCell, index);
    return newTableCell;
  }

  setSize(size: number) {
    let cellSize = this.getSize();

    if (size === cellSize) {
      return;
    }

    if (size > cellSize) {
      let list = [];
      for (let i = cellSize; i < size; i++) {
        let item = new TableCell(this.cellType);
        list.push(item);
      }
      this.add(list);
    } else {
      this.remove(size, cellSize);
    }
  }

  getRaw() {
    let raw = super.getRaw();
    raw.cellType = this.cellType;
    return raw;
  }

  addEmptyParagraph(bottom: boolean): OperatorType {
    let parent = this.getParent();
    return parent.addEmptyParagraph(bottom);
  }

  render(contentBuilder: BaseBuilder) {
    return contentBuilder.buildTableRow(
      this.id,
      () => this.children.map((item) => item.render(contentBuilder)).toArray(),
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
  }
}

class TableCell extends StructureCollection<TableItem> {
  type: ComponentType = ComponentType.tableCell;
  parent?: TableRow;
  cellType: "th" | "td";

  static create(componentFactory: ComponentFactory, raw: IRawType): TableCell {
    let tableCell = new TableCell(raw.cellType, "", raw.style, raw.data);
    let children = raw.children
      ? raw.children.map((item) => TableItem.create(componentFactory, item))
      : [];
    tableCell.addChildren(0, children);
    if (children.length) {
      tableCell.removeChildren(tableCell.getSize() - 1);
    }
    return tableCell;
  }

  constructor(
    cellType: "th" | "td" = "td",
    children: tableCellType = "",
    style?: StoreData,
    data?: StoreData,
  ) {
    super(style, data);
    this.cellType = cellType;

    if (!Array.isArray(children)) {
      children = [children];
    }

    this.addChildren(
      0,
      children.map((item) => new TableItem(item)),
    );
  }

  isEmpty() {
    return this.getSize() === 1 && this.getChild(0).getSize() === 0;
  }

  removeChildren(start: number, end: number = 0) {
    // 单元格至少要保存一个空行
    if (this.getSize() === 1) {
      this.getChild(0)?.removeChildren(0);
      return [];
    }
    return super.removeChildren(start, end);
  }

  childHeadDelete(tableItem: TableItem): OperatorType {
    let prev = this.getPrev(tableItem);
    if (!prev) return [[]];
    return tableItem.sendTo(prev);
  }

  addEmptyParagraph(bottom: boolean): OperatorType {
    let parent = this.getParent();
    return parent.addEmptyParagraph(bottom);
  }

  getRaw() {
    let raw = super.getRaw();
    raw.cellType = this.cellType;
    return raw;
  }

  render(contentBuilder: BaseBuilder) {
    return contentBuilder.buildTableCell(
      this.id,
      this.cellType,
      () => this.children.map((item) => item.render(contentBuilder)).toArray(),
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
  }
}

class TableItem extends ContentCollection {
  type = ComponentType.tableItem;
  parent?: TableCell;
  style: StoreData = {
    textAlign: "center",
  };

  static create(componentFactory: ComponentFactory, raw: IRawType): TableItem {
    let tableItem = new TableItem("", raw.style, raw.data);
    let children = super.getChildren(componentFactory, raw);
    tableItem.addChildren(0, children);
    return tableItem;
  }

  static exchange(): TableItem[] {
    throw createError("不允许切换表格内段落");
  }

  exchangeTo(): Block[] {
    throw createError("表格内段落不允许切换类型", this);
  }

  createEmpty() {
    return new TableItem(
      "",
      this.decorate.copyStyle(),
      this.decorate.copyData(),
    );
  }

  split(index: number, tableItem?: TableItem | TableItem[]): OperatorType {
    if (tableItem) {
      throw createError("表格组件不允许添加其他组件", this);
    }
    return super.split(index, tableItem);
  }

  render(contentBuilder: BaseBuilder) {
    return contentBuilder.buildParagraph(
      this.id,
      () => this.getContent(contentBuilder),
      this.decorate.getStyle(),
      { ...this.decorate.getData(), tag: "p" },
    );
  }
}

export default Table;
