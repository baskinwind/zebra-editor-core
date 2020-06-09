import getSelection from "./get-selection";
import focusAt from "../rich-util/focus-at";
import { getComponentById } from "../components/util";
import { getSelectedIdList } from "./util";
import { classType } from "../components/component";

// 修改选区中整块内容的呈现
const exchangeComponent = (newClass: classType, ...args: any[]) => {
  let selection = getSelection();
  let start = selection.range[0];
  let end = selection.range[1];
  let idList = getSelectedIdList(start.id, end.id);

  if (idList.length === 0) return;
  if (idList.length === 1) {
    let focus = getComponentById(idList[0]).exchangeToOther(newClass, args);
    if (!focus) {
      focusAt();
    } else {
      focusAt([focus[0], start.offset, end.offset]);
    }
    return;
  }
  let focusList = idList.map((id) =>
    getComponentById(id).exchangeToOther(newClass, args)
  );
  let first = focusList[0];
  let last = focusList[focusList.length - 1];
  if (!first || !last) {
    focusAt();
  } else {
    focusAt(
      {
        id: first[0].id,
        offset: first[1] === -1 ? start.offset : first[1]
      },
      {
        id: last[0].id,
        offset: last[1] === -1 ? end.offset : last[1] + end.offset
      }
    );
  }
};

export default exchangeComponent;
