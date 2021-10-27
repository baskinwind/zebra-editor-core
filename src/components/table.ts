import Editor from "../editor";
import { AnyObject } from "../decorate";
import { OperatorType, JSONType } from "./component";
import Block from "./block";
import ContentCollection from "./content-collection";
import StructureCollection from "./structure-collection";
import AbstractView from "../view/base-view";
import ComponentType from "../const/component-type";
import { CollectionSnapshoot } from "./collection";
import { createError } from "../util";
import ComponentFactory from "../factory";
import { nextTick } from "../util";

type tableCellType = string | string[];

interface TableSnapshoot extends CollectionSnapshoot<TableRow> {
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

  static create(componentFactory: ComponentFactory, json: JSONType): Table {
    let children = (json.children || []).map((each) => {
      return TableRow.create(componentFactory, each);
    });

    let table = componentFactory.buildTable(0, 0, [], []);
    table.modifyDecorate(json.style, json.data);
    table.add(0, ...children);
    return table;
  }

  constructor(
    row: number,
    col: number,
    head: tableCellType[] | boolean = true,
    rows: tableCellType[][] = [],
    editor?: Editor,
  ) {
    super(editor);

    let tableRows = [];
    if (head) {
      if (head === true) {
        head = [];
      }
      tableRows.push(new TableRow(col, TableCellEnum.th, head));
    }

    for (let i = 0; i < row; i++) {
      tableRows.push(new TableRow(col, TableCellEnum.td, rows[i]));
    }

    this.add(0, ...tableRows);
  }

  getRowSize() {
    return this.getChild(0).getSize();
  }

  addRow(index: number) {
    let cellSize = this.getChild(0).getSize();
    let newTableRow = new TableRow(cellSize);
    this.add(index, newTableRow);
  }

  getColSize() {
    return this.getChild(0).getChild(0).getSize();
  }

  addCol(index: number) {
    this.children.forEach((each) => each.addCell(index));
  }

  removeRow(start: number, end: number = start + 1) {
    this.remove(start, end);
  }

  removeCol(start: number, end: number = start + 1) {
    this.children.forEach((each) => each.remove(start, end));
  }

  setRow(row: number) {
    let size = this.getSize();
    let cellSize = this.getChild(0).getSize();
    let hasHead = this.getChild(0).cellType === "th";
    let rowSize = hasHead ? size - 1 : size;

    if (row === rowSize) return;

    if (row > rowSize) {
      let list = [];
      for (let i = rowSize; i < row; i++) {
        let each = new TableRow(cellSize);
        list.push(each);
      }
      this.add(-1, ...list);
    } else {
      this.remove(row, size);
    }
  }

  setCol(col: number) {
    this.children.forEach((each) => each.setSize(col));
  }

  hasHead(): boolean {
    return this.getChild(0).cellType === TableCellEnum.th;
  }

  setHead(head: boolean) {
    let hasHead = this.getChild(0).cellType === TableCellEnum.th;

    if (head === hasHead) return;

    if (head) {
      let colNumber = this.getChild(0).getSize();
      this.add(0, new TableRow(colNumber, TableCellEnum.th, []));
    } else {
      this.remove(0, 1);
    }
  }

  receive(block: Block): OperatorType {
    this.removeSelf();
    return [{ id: block.id, offset: 0 }];
  }

  restore(state: TableSnapshoot) {
    super.restore(state);
  }

  render(contentView: AbstractView) {
    return contentView.buildTable(
      this.id,
      () => this.children.toArray().map((each) => each.render(contentView)),
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
  }
}

export enum TableCellEnum {
  th = "th",
  td = "td",
}

class TableRow extends StructureCollection<TableCell> {
  type: ComponentType = ComponentType.tableRow;
  parent?: Table;
  cellType: TableCellEnum;

  static create(componentFactory: ComponentFactory, json: JSONType): TableRow {
    let tableRow = new TableRow(json.children!.length, json.cellType, []);
    tableRow.modifyDecorate(json.style, json.data);
    let children = (json.children || []).map((each) => TableCell.create(componentFactory, each));
    tableRow.add(0, ...children);
    return tableRow;
  }

  constructor(
    size: number,
    cellType: TableCellEnum = TableCellEnum.td,
    children: tableCellType[] = [],
    editor?: Editor,
  ) {
    super(editor);
    this.cellType = cellType;

    let cells = [];
    for (let i = 0; i < size; i++) {
      if (children[i]) {
        cells.push(new TableCell(this.cellType, children[i]));
      } else {
        cells.push(new TableCell(this.cellType));
      }
    }

    super.add(0, ...cells);
  }

  addCell(index: number) {
    let newTableCell = new TableCell(this.cellType);
    this.add(index, newTableCell);
    return newTableCell;
  }

  setSize(size: number) {
    let cellSize = this.getSize();

    if (size === cellSize) return;

    if (size > cellSize) {
      let list = [];
      for (let i = cellSize; i < size; i++) {
        let each = new TableCell(this.cellType);
        list.push(each);
      }
      this.add(-1, ...list);
    } else {
      this.remove(size, cellSize);
    }
  }

  getJSON() {
    let raw = super.getJSON();
    raw.cellType = this.cellType;
    return raw;
  }

  addEmptyParagraph(bottom: boolean): OperatorType {
    let parent = this.getParent();
    return parent.addEmptyParagraph(bottom);
  }

  render(contentView: AbstractView) {
    return contentView.buildTableRow(
      this.id,
      () => this.children.toArray().map((each) => each.render(contentView)),
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
  }
}

class TableCell extends StructureCollection<TableItem> {
  type: ComponentType = ComponentType.tableCell;
  parent?: TableRow;
  cellType: TableCellEnum;

  static create(componentFactory: ComponentFactory, raw: JSONType): TableCell {
    let children = (raw.children || []).map((each) => TableItem.create(componentFactory, each));

    let tableCell = new TableCell(raw.cellType, "");
    tableCell.modifyDecorate(raw.style, raw.data);
    tableCell.add(0, ...children);

    return tableCell;
  }

  constructor(
    cellType: TableCellEnum = TableCellEnum.td,
    children: tableCellType = "",
    editor?: Editor,
  ) {
    super(editor);
    this.cellType = cellType;

    if (!Array.isArray(children)) {
      children = [children];
    }

    this.add(0, ...children.map((each) => new TableItem(each)));
  }

  isEmpty() {
    return this.getSize() === 1 && this.getChild(0).getSize() === 0;
  }

  removeChildren(start: number, end: number = -1) {
    let removed = super.removeChildren(start, end);
    // 若删除后仍在 active 状态，则至少保证有一个空行
    nextTick(() => {
      if (this.active && this.getSize() === 0) {
        this.add(0, new TableItem());
      }
    });
    return removed;
  }

  childHeadDelete(tableItem: TableItem): OperatorType {
    let prev = this.getPrev(tableItem);
    if (!prev) {
      return [{ id: tableItem.id, offset: 0 }];
    }

    return tableItem.sendTo(prev);
  }

  addEmptyParagraph(bottom: boolean): OperatorType {
    let parent = this.getParent();
    return parent.addEmptyParagraph(bottom);
  }

  getJSON() {
    let raw = super.getJSON();
    raw.cellType = this.cellType;
    return raw;
  }

  render(contentView: AbstractView) {
    return contentView.buildTableCell(
      this.id,
      this.cellType,
      () => this.children.toArray().map((each) => each.render(contentView)),
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
  }
}

class TableItem extends ContentCollection {
  type = ComponentType.tableItem;
  parent?: TableCell;
  style: AnyObject = {
    textAlign: "center",
  };

  static create(componentFactory: ComponentFactory, raw: JSONType): TableItem {
    let tableItem = new TableItem();
    tableItem.modifyDecorate(raw.style, raw.data);
    tableItem.add(0, ...this.createChildren(componentFactory, raw));
    return tableItem;
  }

  static exchange(): TableItem[] {
    throw createError("不允许切换表格内段落");
  }

  exchangeTo(): Block[] {
    throw createError("表格内段落不允许切换类型", this);
  }

  createEmpty() {
    const tableImem = new TableItem();
    tableImem.modifyDecorate(this.decorate.copyStyle(), this.decorate.copyData());
    return tableImem;
  }

  split(index: number, ...tableItem: TableItem[]): OperatorType {
    if (tableItem.length) {
      throw createError("表格组件不允许添加其他组件", this);
    }

    return super.split(index);
  }

  render(contentView: AbstractView) {
    return contentView.buildParagraph(
      this.id,
      () => this.getChildren(contentView),
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
  }
}

export default Table;
