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
