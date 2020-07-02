import getSelection from "../selection-operator/get-selection";
import input from "../rich-util/input";
import backspace from "../rich-util/backspace";
import { createTextRecord } from "../record/util";

const onInput = (event: InputEvent) => {
  let key = event.data || "";
  let selection = getSelection();

  createTextRecord(selection.range[0], selection.range[1]);
  if (!selection.isCollapsed) {
    backspace(selection.range[0], selection.range[1]);
    selection = getSelection();
  }
  // 排除混合输入
  if (event.inputType === "insertCompositionText") return;
  input(
    key,
    {
      id: selection.range[0].id,
      offset: selection.range[0].offset - key.length
    },
    event
  );
};

export default onInput;
