import getSelection from "../selection-operator/get-selection";
import input from "../rich-util/input";
import backspace from "../rich-util/backspace";
import { createTextRecord } from "../record/util";

const onInput = (event: InputEvent) => {
  let key = event.data || "";
  let selection = getSelection();
  let start = selection.range[0];
  start.offset = start.offset - key.length;
  // 排除混合输入
  if (event.inputType === "insertCompositionText") return;
  input(key, start, event);
};

export default onInput;
