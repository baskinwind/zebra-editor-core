import getSelection from "./get-selection";
import modifyDecorate from "../rich-util/modify-decorate";
import { storeData } from "../decorate";
import { getSelectedIdList } from "./util";
import { createRecord } from "../record/util";

// 修改选中组件的样式
const modifyBlockDecorate = (
  style?: storeData,
  data?: storeData,
  focus: boolean = true,
  record: boolean = true
) => {
  let selection = getSelection();
  let start = selection.range[0];
  let end = selection.range[1];
  if (record) createRecord(start, end);
  let idList = getSelectedIdList(start.id, end.id);
  modifyDecorate(idList, style, data, focus);
};

export default modifyBlockDecorate;
