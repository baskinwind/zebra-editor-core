import { getComponentFactory } from ".";
import { operatorType, classType, IRawType } from "./component";
import Block from "./block";
import ContentCollection from "./content-collection";
import StructureCollection from "./structure-collection";
import ComponentType from "../const/component-type";
import { storeData } from "../decorate";
import { getContentBuilder } from "../content";
import { initRecordState } from "../record/decorators";
import { ICollectionSnapshoot } from "./collection";
import { createError } from "../util/handle-error";
import nextTicket from "../util/next-ticket";

type tableCellChildType = string | TableItem | undefined;

interface ITableSnapshoot extends ICollectionSnapshoot<TableRow> {
  col: number;
  needHead: boolean;
}

class Table extends StructureCollection<TableRow> {
  type: ComponentType = ComponentType.table;
  col: number;
  needHead: boolean;
  style: storeData = {
    margin: "auto",
    overflowX: "auto"
  };

  static getTable(component: Block): Table | undefined {
    let table: Table | undefined;
    if (component instanceof TableItem) {
      table = component.parent?.parent?.parent;
    } else if (component instanceof TableCell) {
      table = component.parent?.parent;
    } else if (component instanceof TableRow) {
      table = component.parent;
    } else if (component instanceof Table) {
      table = component;
    }
    return table;
  }

  static create(raw: IRawType): Table {
    let table = getComponentFactory().buildTable(
      0,
      0,
      [],
      false,
      raw.style,
      raw.data
    );
    let children = raw.children
      ? raw.children.map((item) => TableRow.create(item))
      : [];
    table.addChildren(children, 0, true);
    table.col = raw.col || 0;
    table.needHead = raw.needHead || false;
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
    this.needHead = needHead;
    let list = [];
    for (let i = 0; i < row + (needHead ? 1 : 0); i++) {
      if (needHead && i === 0) {
        list.push(new TableRow(col, children[i], "th"));
      } else {
        list.push(new TableRow(col, children[i]));
      }
    }
    this.col = col;
    this.addChildren(list, 0, true);
  }

  removeChildren(
    indexOrComponent: TableRow | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false
  ): TableRow[] {
    // 若子元素全部删除，将自己也删除
    if (removeNumber === this.getSize()) {
      nextTicket(() => {
        if (this.getSize() !== 0) return;
        this.removeSelf(customerUpdate);
      });
    }
    return super.removeChildren(indexOrComponent, removeNumber, customerUpdate);
  }

  setTableRow(row?: number) {
    let size = this.getSize() - (this.needHead ? 1 : 0);
    if (!row || row === size) return;
    if (row > size) {
      let list = [];
      for (let i = size; i < row; i++) {
        let item = new TableRow(this.col);
        list.push(item);
      }
      this.addChildren(list);
    } else {
      this.remove(row, size - row);
    }
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
      this.add(new TableRow(this.col, [], "th"), 0);
    } else {
      this.remove(0, 1);
    }
    this.needHead = needHead;
  }

  receive(block?: Block, customerUpdate: boolean = false): operatorType {
    if (!block) return;
    this.removeSelf(customerUpdate);
    return [block, 0, 0];
  }

  snapshoot(): ITableSnapshoot {
    let snap = super.snapshoot() as ITableSnapshoot;
    snap.needHead = this.needHead;
    snap.col = this.col;
    return snap;
  }

  restore(state: ITableSnapshoot) {
    this.needHead = state.needHead;
    this.col = state.col;
    super.restore(state);
  }

  getRaw() {
    let raw = super.getRaw();
    raw.col = this.col;
    raw.needHead = this.needHead;
    return raw;
  }

  getStatistic() {
    let res = super.getStatistic();
    res.table += 1;
    return res;
  }

  render() {
    return getContentBuilder().buildTable(
      this.id,
      () => this.children.map((item) => item.render()).toArray(),
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

class TableRow extends StructureCollection<TableCell> {
  type: ComponentType = ComponentType.tableRow;
  parent?: Table;
  emptyCell: number = 0;
  inCountEmptyCell: boolean = false;
  cellType: "th" | "td";

  static create(raw: IRawType): TableRow {
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
    this.cellType = cellType;
    let list = [];
    for (let i = 0; i < size; i++) {
      let item = new TableCell(children[i], this.cellType);
      list.push(item);
    }
    super.addChildren(list, 0, true);
  }

  setSize(size?: number) {
    let oldSize = this.getSize();
    if (!size || size === oldSize) return;
    if (size > oldSize) {
      let list = [];
      for (let i = oldSize; i < size; i++) {
        let item = new TableCell("", this.cellType);
        list.push(item);
      }
      this.add(list);
    } else {
      this.remove(size, oldSize - size);
    }
  }

  countEmptyCell(customerUpdate: boolean = false) {
    if (!this.inCountEmptyCell) {
      Promise.resolve().then(() => {
        this.inCountEmptyCell = false;
        this.emptyCell = 0;
      });
    }
    this.inCountEmptyCell = true;
    this.emptyCell += 1;
    if (this.emptyCell === this.getSize()) {
      let parent = this.getParent();
      this.removeSelf(customerUpdate);
      if (this.cellType === "th") {
        // @ts-ignore
        parent.needHead = false;
      }
    }
  }

  getRaw() {
    let raw = super.getRaw();
    raw.cellType = this.cellType;
    return raw;
  }

  addEmptyParagraph(bottom: boolean): operatorType {
    let parent = this.getParent();
    return parent.addEmptyParagraph(bottom);
  }

  render() {
    return getContentBuilder().buildTableRow(
      this.id,
      () => this.children.map((item) => item.render()).toArray(),
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

class TableCell extends StructureCollection<TableItem> {
  type: ComponentType = ComponentType.tableCell;
  parent?: TableRow;
  cellType: "th" | "td";

  static create(raw: IRawType): TableCell {
    let tableCell = new TableCell("", raw.cellType, raw.style, raw.data);
    let children = raw.children
      ? raw.children.map((item) => TableItem.create(item))
      : [];
    tableCell.addChildren(children, 0, true);
    if (children.length) {
      tableCell.removeChildren(tableCell.getSize() - 1, 1, true);
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
    return this.getSize() === 1 && this.getChild(0).getSize() === 0;
  }

  removeChildren(
    indexOrTableItem: TableItem | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false
  ) {
    if (this.getSize() === 1 && removeNumber === 1) {
      let tableItem = this.getChild(0) as TableItem;
      tableItem?.removeChildren(0, tableItem.getSize(), customerUpdate);
      return [tableItem];
    }
    return super.removeChildren(indexOrTableItem, removeNumber, customerUpdate);
  }

  childHeadDelete(
    tableItem: TableItem,
    index: number,
    customerUpdate: boolean = false
  ): operatorType {
    let prev = this.getPrev(tableItem);
    if (!prev) return;
    return tableItem.sendTo(prev, customerUpdate);
  }

  addEmptyParagraph(bottom: boolean): operatorType {
    let parent = this.getParent();
    return parent.addEmptyParagraph(bottom);
  }

  getRaw() {
    let raw = super.getRaw();
    raw.cellType = this.cellType;
    return raw;
  }

  render() {
    return getContentBuilder().buildTableCell(
      this.id,
      this.cellType,
      () => this.children.map((item) => item.render()).toArray(),
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

@initRecordState
class TableItem extends ContentCollection {
  type = ComponentType.tableItem;
  parent?: TableCell;
  style: storeData = {
    fontSize: "16px",
    textAlign: "center"
  };

  static create(raw: IRawType): TableItem {
    let tableItem = new TableItem("", raw.style, raw.data);
    let children = super.getChildren(raw);
    tableItem.addChildren(children, 0, true);
    return tableItem;
  }

  static exchangeOnly(block: Block, args: any[] = []): TableItem[] {
    let newItem = new TableItem();
    if (block instanceof ContentCollection) {
      newItem.addChildren(block.children.toArray(), 0);
    }
    return [newItem];
  }

  static exchange(
    block: Block,
    args: any[] = [],
    customerUpdate: boolean = false
  ): TableItem[] {
    throw createError("不允许切换表格内段落");
  }

  exchangeTo(builder: classType, args: any[]): Block[] {
    throw createError("表格内段落不允许切换类型！！", this);
  }

  createEmpty() {
    return new TableItem(
      "",
      this.decorate.copyStyle(),
      this.decorate.copyData()
    );
  }

  // 监控：当表格内容一行全被删除时，把一整行移除
  remove(
    start: number,
    end?: number,
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.getParent() as TableCell;
    let focus = super.remove(start, end, customerUpdate);
    if (parent.isEmpty()) {
      parent.parent?.countEmptyCell(customerUpdate);
    }
    return focus;
  }

  // 监控：当表格内容一行全被删除时，把一整行移除
  removeSelf(customerUpdate: boolean = false): operatorType {
    let parent = this.getParent() as TableCell;
    let focus = super.removeSelf(customerUpdate);
    if (parent.isEmpty()) {
      parent.parent?.countEmptyCell(customerUpdate);
    }
    return focus;
  }

  split(
    index: number,
    tableItem?: TableItem | TableItem[],
    customerUpdate: boolean = false
  ): operatorType {
    // 不允许非内容组件添加
    let hasComponent: boolean = tableItem !== undefined;
    if (Array.isArray(tableItem)) {
      if (tableItem.length === 0) hasComponent = false;
      let newList: TableItem[] = [];
      tableItem
        .filter((item) => {
          return item instanceof ContentCollection;
        })
        .forEach((item) => {
          newList.push(...TableItem.exchangeOnly(item));
        });
      tableItem = newList;
      tableItem = tableItem.length === 0 ? undefined : tableItem;
    } else if (tableItem && tableItem instanceof ContentCollection) {
      tableItem = TableItem.exchangeOnly(tableItem);
    } else {
      tableItem = undefined;
    }
    if (hasComponent && tableItem === undefined) {
      return;
    }
    return super.split(index, tableItem, customerUpdate);
  }

  // 表格项在删除时，默认不将光标后的内容添加到光标前
  sendTo(block: Block, customerUpdate: boolean = false): operatorType {
    try {
      this.parent?.findChildrenIndex(block);
      return super.sendTo(block, customerUpdate);
    } catch (e) {
      console.warn(e);
    }
  }

  render() {
    return getContentBuilder().buildParagraph(
      this.id,
      () => this.getContent(),
      this.decorate.getStyle(),
      { ...this.decorate.getData(), tag: "p" }
    );
  }
}

export default Table;
