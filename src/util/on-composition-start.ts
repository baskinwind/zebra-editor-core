import getSelection from "../selection-operator/get-selection";
import backspace from "../rich-util/backspace";
import { createRecord } from "../record/util";

const onComposttionStart = (event: CompositionEvent) => {
  let selection = getSelection();
  createRecord(selection.range[0], selection.range[1]);
  if (!selection.isCollapsed) {
    backspace(selection.range[0], selection.range[1], event);
  }
};

export default onComposttionStart;
