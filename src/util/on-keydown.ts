import input from "../selection-operator/input";
import deleteSelection from "../selection-operator/delete-selection";

const onKeyDown = (event: KeyboardEvent) => {
  let key = event.key;
  let lowerKey = key.toLowerCase();
  // 控制混合输入
  if (event.isComposing || event.keyCode === 229) {
    deleteSelection(event, true);
    return;
  }
  // 换行或删除
  if (lowerKey === "enter" || lowerKey === "backspace") {
    deleteSelection(event);
    return;
  }
  // 字符输入
  if (key.length === 1) {
    input(key, false, event);
  }
};

export default onKeyDown;
