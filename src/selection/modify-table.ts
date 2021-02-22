import Editor from "../editor/editor";
import Table from "../components/table";
import getSelection from "./get-selection";

// 修改表格内容
const modifyTable = (
  editor: Editor,
  option: {
    row?: number;
    col?: number;
    head?: boolean;
  },
) => {
  let selection = getSelection(editor.mountedWindow);
  if (!selection.isCollapsed) return;
  let id = selection.range[0].id;
  let component = editor.storeManage.getBlockById(id);
  let table = Table.getTable(component);
  if (!table) return;
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
