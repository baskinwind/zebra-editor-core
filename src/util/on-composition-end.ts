import { getBeforeSelection } from "../selection-operator/get-selection";
import input from "./input";

const onComposttionEnd = (event: CompositionEvent) => {
  let selection = getBeforeSelection();
  input(event.data, {
    id: selection.range[0].id,
    offset: selection.range[0].offset
  });
};

export default onComposttionEnd;
