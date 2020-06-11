import input from "../rich-util/input";
import { getBeforeSelection } from "../selection-operator/get-selection";
import { createRecord } from "../record/util";

const onComposttionEnd = (event: CompositionEvent) => {
  let selection = getBeforeSelection();
  createRecord(selection.range[0], selection.range[1]);
  input(event.data, {
    id: selection.range[0].id,
    offset: selection.range[0].offset - event.data.length
  });
};

export default onComposttionEnd;
