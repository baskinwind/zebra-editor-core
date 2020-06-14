import focusAt from "./focus-at";
import { getComponentById } from "../components/util";
import { storeData } from "../decorate";
import { cursorType, getSelectedIdList } from "../selection-operator/util";

// 修改选中文字的样式
const modifyInlineDecorate = (
  start: cursorType,
  end: cursorType,
  style?: storeData,
  data?: storeData
) => {
  let idList = getSelectedIdList(start.id, end.id);
  // 为选中内容，不需要处理
  if (idList.length === 0) return;
  // 选中一行
  if (idList.length === 1) {
    let component = getComponentById(idList[0]);
    component.modifyContentDecorate(start.offset, end.offset - 1, style, data);
    return focusAt(start, end);
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
  focusAt(start, end);
};

export default modifyInlineDecorate;
