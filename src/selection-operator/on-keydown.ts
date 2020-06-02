import escapeKey from "./escape-key";
import deleteSelection from "./delete-selection";

const onKeyDown = (event: KeyboardEvent) => {
  if (escapeKey(event)) return;
  let key = event.key.toLowerCase();
  if (key === "enter" || key === "backspace") {
    deleteSelection(event.key);
  }
};

export default onKeyDown;
