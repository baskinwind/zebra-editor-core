import Collection from "../components/collection";
import deleteSelection from "./delete-selection";
import input from "./input";
import escapeKey from "./escape-key";

const onKeyDown = (event: KeyboardEvent) => {
  if (escapeKey(event)) return;
  deleteSelection(event);
  let key = event.key;
  // 字符输入
  if (key.length === 1) {
    input(event.key, event);
    return;
  }
};

export default onKeyDown;

const inImage = (event: KeyboardEvent, component: Collection<any>) => {
  let key = event.key;
  if (key === "Backspace") {
    component.removeSelf();
    let dom = document.getElementById(component.id);
    dom?.remove();
    return;
  }
};
