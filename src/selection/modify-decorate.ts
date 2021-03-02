import Editor from "../editor/editor";
import getSelection from "./get-selection";
import { StoreData } from "../decorate";
import { getSelectedIdList } from "./util";
import focusAt from "./focus-at";

// 修改选中组件的样式
const modifyDecorate = (
  editor: Editor,
  style?: StoreData,
  data?: StoreData,
  focus: boolean = true,
) => {
  let selection = getSelection(editor.mountedWindow);
  let start = selection.range[0];
  let end = selection.range[1];
  let idList = getSelectedIdList(start.id, end.id);
  idList.forEach((id) => {
    let block = editor.storeManage.getBlockById(id);
    block.modifyDecorate(style, data);
  });
  if (focus) {
    focusAt(editor.mountedWindow);
  }
};

export default modifyDecorate;
