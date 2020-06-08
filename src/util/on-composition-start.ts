import getSelection from "../selection-operator/get-selection";
import backspace from "../rich-util/backspace";

const onComposttionStart = (event: CompositionEvent) => {
  let selection = getSelection();
  if (!selection.isCollapsed) {
    backspace(selection.range[0], selection.range[1], event);
  }
};

export default onComposttionStart;
