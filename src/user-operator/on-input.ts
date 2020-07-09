import getSelection from "../selection-operator/get-selection";
import input from "../rich-util/input";

const onInput = (event: InputEvent) => {
  // 排除已经处理的输入
  if (
    event.inputType === "insertCompositionText" ||
    event.inputType === "deleteContentBackward" ||
    !event.data ||
    event.data === ""
  )
    return;
  let data = event.data;
  let selection = getSelection();
  let start = selection.range[0];
  start.offset = start.offset - data.length;
  input(data, start, event);
};

export default onInput;
