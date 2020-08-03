import getSelection from "../operator-selection/get-selection";
import enter from "../operator/enter";
import backspace from "../operator/backspace";
import { createRecord } from "../record/util";

// keydown 主要处理一些特殊表现的按键
// enter backspace
const onKeyDown = (event: KeyboardEvent) => {
  let key = event.key;
  let lowerKey = key.toLowerCase();
  let isEnter = lowerKey === "enter";
  let isBackspace = lowerKey === "backspace";
  if (!(isEnter || isBackspace)) {
    return;
  }

  let selection = getSelection();
  createRecord(selection.range[0], selection.range[1]);

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
};

export default onKeyDown;
