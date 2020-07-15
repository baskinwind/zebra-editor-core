import Block from "../components/block";
import getSelection from "./get-selection";
import deleteSelection from "../operator-character/delete-selection";
import focusAt from "./focus-at";
import { getBlockById } from "../components/util";
import { createRecord } from "../record/util";
import StructureType from "../const/structure-type";

// 在光标处插入一个内容块
const insertBlock = (block: Block | Block[]) => {
  let selection = getSelection();
  createRecord(selection.range[0], selection.range[1]);
  if (!selection.isCollapsed) {
    deleteSelection(selection.range[0], selection.range[1]);
    selection = getSelection();
  }
  try {
    let nowComponent = getBlockById(selection.range[0].id);
    let start = selection.range[0].offset;
    let focus = nowComponent.split(start, block);
    if (focus && focus[0].structureType === StructureType.structure) {
      return;
    }
    focusAt(focus);
  } catch (e) {
    console.warn(e);
  }
};

export default insertBlock;
