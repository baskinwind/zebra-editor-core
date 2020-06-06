import getSelection from "../selection-operator/get-selection";
import input from "./input";

const onComposttionEnd = (event: CompositionEvent) => {
  let selection = getSelection();
  input(event.data, {
    id: selection.range[0].id,
    offset: selection.range[0].offset - event.data.length
  });
};

export default onComposttionEnd;
