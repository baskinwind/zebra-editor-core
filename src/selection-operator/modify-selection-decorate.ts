import getSelection from "./get-selection";
import focusAt from "../rich-util/focus-at";
import { getComponentById } from "../components/util";
import { storeData } from "../decorate";
import { getSelectedIdList } from "./util";
import { createRecord } from "../record/util";

// 修改选中文字的样式
const modifySelectionDecorate = (style?: storeData, data?: storeData) => {
  let selection = getSelection();
  // 为光标时，不需要处理
  if (selection.isCollapsed) {
    return;
  }
  let start = selection.range[0];
  let end = selection.range[1];
  createRecord(start, end);
  let idList = getSelectedIdList(start.id, end.id);

  // 为选中内容，不需要处理
  if (idList.length === 0) return;
  // 选中一行
  if (idList.length === 1) {
    let component = getComponentById(idList[0]);
    component.modifyContentDecorate(start.offset, end.offset - 1, style, data);
    return focusAt(selection.range[0], selection.range[1]);
  }
  // 其他情况
  let firstComponent = getComponentById(idList[0]);
  let lastComponent = getComponentById(idList[idList.length - 1]);
  firstComponent.modifyContentDecorate(start.offset, -1, style, data);
  lastComponent.modifyContentDecorate(0, end.offset - 1, style, data);
  for (let i = 1; i < idList.length - 1; i++) {
    let component = getComponentById(idList[i]);
    component.modifyContentDecorate(0, -1, style, data);
  }
  focusAt(selection.range[0], selection.range[1]);
};

export default modifySelectionDecorate;
