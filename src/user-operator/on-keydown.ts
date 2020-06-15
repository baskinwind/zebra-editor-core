import Paragraph from "../components/paragraph";
import StructureType from "../const/structure-type";
import getSelection from "../selection-operator/get-selection";
import input from "../rich-util/input";
import enter from "../rich-util/enter";
import backspace from "../rich-util/backspace";
import focusAt from "../rich-util/focus-at";
import { getBlockById } from "../components/util";
import { createRecord } from "../record/util";

const onKeyDown = (event: KeyboardEvent) => {
  let key = event.key;
  let lowerKey = key.toLowerCase();
  let isEnter = lowerKey === "enter";
  let isBackspace = lowerKey === "backspace";
  let isTab = lowerKey === "tab";
  if (!(isEnter || isBackspace || key.length === 1 || isTab)) {
    return;
  }

  let selection = getSelection();
  createRecord(selection.range[0], selection.range[1]);
  // 选中 article 直接子节点时，选中 table 前后时，会有该情况发生
  if (selection.selectStructure) {
    event?.preventDefault();
    let component = getBlockById(selection.range[0].id);
    if (isEnter) {
      focusAt(
        component.parent?.add(new Paragraph(), selection.range[0].offset)
      );
      return;
    }
    if (isBackspace) {
      if (component.structureType === StructureType.structure) {
        focusAt(component.replaceSelf(new Paragraph()));
        return;
      }
    }
    return;
  }

  // 换行
  if (isEnter) {
    enter(selection.range[0], selection.range[1], event);
    return;
  }
  // 删除
  if (isBackspace) {
    backspace(selection.range[0], selection.range[1], event);
    return;
  }

  if (isTab) {
    if (!selection.isCollapsed) {
      backspace(selection.range[0], selection.range[1], event);
      selection = getSelection();
    }
    event.preventDefault();
    input("    ", selection.range[0], event);
  }

  // 字符输入
  if (key.length === 1) {
    if (!selection.isCollapsed) {
      backspace(selection.range[0], selection.range[1], event);
      selection = getSelection();
    }
    input(key, selection.range[0], event);
  }
};

export default onKeyDown;
