import escapeKey from "./escape-key";
import input from "./input";
import deleteSelection from "./delete-selection";

const onKeyUp = (event: KeyboardEvent, dom: any) => {
  // 混合输入
  // if (event.isComposing || event.keyCode === 229) {
  //   return;
  // }
  if (escapeKey(event)) return;
  deleteSelection(event, dom);
  let key = event.key;
  // 字符输入
  if (key.length === 1) {
    input(key, false, event);
  }
};

export default onKeyUp;
