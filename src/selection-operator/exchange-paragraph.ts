import getSelection from "./get-selection";
import focusAt from "./focus-at";
import { getComponentById } from "../components/util";
import { getSelectedIdList } from "./util";

// 修改选区中整块内容的呈现
const exchangeParagraph = (newClass: any, ...args: any[]) => {
  let selection = getSelection();
  let start = selection.range[0];
  let end = selection.range[1];
  let idList = getSelectedIdList(start.id, end.id);
  idList.forEach((id) => {
    getComponentById(id).exchangeToOther(newClass, args);
  });
  focusAt();
};

export default exchangeParagraph;
