import getSelection from "./get-selection";
import { storeData } from "../decorate";
import { getSelectedIdList } from "./util";
import { createRecord } from "../record/util";
import { getBlockById } from "../components/util";
import focusAt from "./focus-at";

// 修改选中组件的样式
const modifyDecorate = (
  style?: storeData,
  data?: storeData,
  focus: boolean = true
) => {
  let selection = getSelection();
  let start = selection.range[0];
  let end = selection.range[1];
  createRecord(start, end);
  let idList = getSelectedIdList(start.id, end.id);
  idList.forEach((id) => {
    let block = getBlockById(id);
    block.modifyDecorate(style, data);
  });
  if (focus) {
    focusAt();
  }
};

export default modifyDecorate;
