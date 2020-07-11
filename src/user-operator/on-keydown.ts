import getSelection from "../selection-operator/get-selection";
import input from "../rich-util/input";
import enter from "../rich-util/enter";
import backspace from "../rich-util/backspace";
import { createRecord } from "../record/util";

// keydown 主要处理一些特殊表现的按键
// enter backspace tab
const onKeyDown = (event: KeyboardEvent) => {
  let key = event.key;
  let lowerKey = key.toLowerCase();
  let isEnter = lowerKey === "enter";
  let isBackspace = lowerKey === "backspace";
  let isTab = lowerKey === "tab";
  if (!(isEnter || isBackspace || isTab)) {
    return;
  }

  let selection = getSelection();

  // 选中结构组件时，选中 Table 前后时，会有该情况发生
  // FIXED: 目前不可选中 Table 的前后
  // if (selection.selectStructure) {
  //   event?.preventDefault();
  //   let component = getBlockById(selection.range[0].id);
  //   if (isEnter) {
  //     createRecord(selection.range[0], selection.range[1]);
  //     focusAt(
  //       component.parent?.add(
  //         getComponentFactory().buildParagraph(),
  //         selection.range[0].offset
  //       )
  //     );
  //     return;
  //   }
  //   if (isBackspace) {
  //     if (component.type === ComponentType.table) {
  //       createRecord(selection.range[0], selection.range[1]);
  //       focusAt(component.replaceSelf(getComponentFactory().buildParagraph()));
  //       return;
  //     }
  //   }
  //   return;
  // }

  createRecord(selection.range[0], selection.range[1]);
  // 换行
  if (isEnter) {
    enter(selection.range[0], selection.range[1], event);
    return;
  }
  // 删除
  if (isBackspace) {
    backspace(selection.range[0], selection.range[1], event);
    return;
  }

  if (isTab) {
    if (!selection.isCollapsed) {
      backspace(selection.range[0], selection.range[1], event);
      selection = getSelection();
    }
    event.preventDefault();
    input("    ", selection.range[0], event);
  }
};

export default onKeyDown;
