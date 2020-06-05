import escapeKey from "../selection-operator/escape-key";
import input from "../selection-operator/input";
import deleteSelection from "../selection-operator/delete-selection";

const onKeyUp = (event: KeyboardEvent) => {
  // 混合输入
  if (event.isComposing || event.keyCode === 229) {
    deleteSelection(event, true);
    return;
  }
  if (escapeKey(event)) return;
  deleteSelection(event);
  let key = event.key;
  // 字符输入
  if (key.length === 1) {
    input(key, false, event);
  }
};

export default onKeyUp;
