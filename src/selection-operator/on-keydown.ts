import escapeKey from "./escape-key";
import input from "./input";
import deleteSelection from "./delete-selection";

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
