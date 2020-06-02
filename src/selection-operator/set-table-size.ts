import getSelection from "./get-selection";
import { getComponentById } from "../components/util";
import Component from "../components/component";
import Table, { TableItem } from "../components/table";

const getTable = (component: Component | undefined): Table => {
  if (!component) {
    throw Error("仅支持传入表格的子组件");
  }
  if (component instanceof Table) {
    return component;
  }
  return getTable(component.parent);
};

const setTableSize = (option: { row?: number; col?: number; head?: boolean }) => {
  let selection = getSelection();
  if (!selection.isCollapsed) return;
  let id = selection.range[0].id;
  let component = getComponentById(id);
  if (component instanceof Table || component instanceof TableItem) {
    try {
      let table = getTable(component);
      if (option.row) {
        table.setTableRow(option.row);
      }
      if (option.col) {
        table.setTableCol(option.col);
      }
      if (option.head !== undefined) {
        table.setTableHead(option.head);
      }
    } catch (e) {
      console.error(e);
    }
  }
};

export default setTableSize;
