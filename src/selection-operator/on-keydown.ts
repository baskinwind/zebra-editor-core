import deleteSelection from "./delete-selection";
import input from "./input";
import escapeKey from "./escape-key";

const onKeyDown = (event: KeyboardEvent) => {
  if (escapeKey(event)) return;
  deleteSelection(event.key);
  let key = event.key;
  // 字符输入
  if (key.length === 1) {
    input(event.key, event);
    return;
  }
};

export default onKeyDown;
