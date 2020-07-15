import getSelection from "./get-selection";
import { getSelectedIdList } from "./util";
import { createRecord } from "../record/util";
import { getBlockById } from "../components/util";
import focusAt from "../operator-character/focus-at";

// 修改选中组件的缩进
const modifyIndent = (isOutdent: boolean = false) => {
  let selection = getSelection();
  let start = selection.range[0];
  let end = selection.range[1];
  createRecord(start, end);
  let idList = getSelectedIdList(start.id, end.id);
  let newStartId: string = "";
  let newEndId: string = "";
  idList.forEach((item, index) => {
    let block = getBlockById(item);
    let focus;
    if (isOutdent) {
      focus = block.outdent();
    } else {
      focus = block.indent();
    }
    if (index === 0) {
      newStartId = focus ? focus[0].id : block.id;
    }
    if (index === idList.length - 1) {
      newEndId = focus ? focus[0].id : block.id;
    }
  });
  focusAt(
    { id: newStartId, offset: start.offset },
    { id: newEndId, offset: end.offset }
  );
};

export default modifyIndent;
