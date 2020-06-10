import getSelection from "./get-selection";
import focusAt from "../rich-util/focus-at";
import { getComponentById } from "../components/util";
import { getSelectedIdList } from "./util";
import Component, { classType } from "../components/component";

// 修改选区中整块内容的呈现
const exchangeComponent = (newClass: classType, ...args: any[]) => {
  let selection = getSelection();
  let start = selection.range[0];
  let end = selection.range[1];
  let idList = getSelectedIdList(start.id, end.id);

  if (idList.length === 0) return;
  if (idList.length === 1) {
    let newList = getComponentById(idList[0]).exchangeTo(newClass, args);
    if (!focus) {
      focusAt();
    } else {
      focusAt([newList[0], start.offset, end.offset]);
    }
    return;
  }
  let exchangeList: Component[] = [];
  idList.forEach((id) => {
    exchangeList.push(...getComponentById(id).exchangeTo(newClass, args));
  });
  let first = exchangeList[0];
  let last = exchangeList[exchangeList.length - 1];
  if (!first || !last) {
    focusAt();
  } else {
    focusAt(
      {
        id: first.id,
        offset: start.offset
      },
      {
        id: last.id,
        offset: end.offset
      }
    );
  }
};

export default exchangeComponent;
