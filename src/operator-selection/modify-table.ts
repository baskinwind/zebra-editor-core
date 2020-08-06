import Table from "../components/table";
import getSelection from "./get-selection";
import { getBlockById } from "../components/util";
import { createRecord } from "../record/util";

// 修改表格内容
const modifyTable = (option: {
  row?: number;
  col?: number;
  head?: boolean;
}) => {
  let selection = getSelection();
  if (!selection.isCollapsed) return;
  let id = selection.range[0].id;
  let component = getBlockById(id);
  let table = Table.getTable(component);
  if (!table) return;
  createRecord(selection.range[0], selection.range[1]);
  if (option.row) {
    table.setTableRow(option.row);
  }
  if (option.col) {
    table.setTableCol(option.col);
  }
  if (option.head !== undefined) {
    table.setTableHead(option.head);
  }
};

export default modifyTable;
