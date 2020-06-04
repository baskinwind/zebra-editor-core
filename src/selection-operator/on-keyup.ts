import escapeKey from "./escape-key";
import input from "./input";
import deleteSelection from "./delete-selection";

const onKeyUp = (event: KeyboardEvent) => {
  if (escapeKey(event)) return;
  console.log(12341234);

  deleteSelection(event);
  let key = event.key;
  // 字符输入
  if (key.length === 1) {
    input(key, false, event);
  }
};

export default onKeyUp;
