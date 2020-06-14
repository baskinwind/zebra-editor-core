import Table from "../components/table";
import input from "../rich-util/input";
import getSelection from "../selection-operator/get-selection";
import enter from "../rich-util/enter";
import backspace from "../rich-util/backspace";
import Paragraph from "../components/paragraph";
import focusAt from "../rich-util/focus-at";
import { getComponentById } from "../components/util";
import DirectionType from "../const/direction-type";
import { createRecord } from "../record/util";

const onKeyDown = (event: KeyboardEvent) => {
  // 混合输入直接跳出
  if (event.isComposing || event.keyCode === 229) {
    return;
  }

  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    return;
  }

  let key = event.key;
  let lowerKey = key.toLowerCase();
  let isEnter = lowerKey === "enter";
  let isBackspace = lowerKey === "backspace";
  let isArrow = /^Arrow/.test(key);
  let isTab = lowerKey === "tab";
  if (!(isEnter || isBackspace || key.length === 1 || isArrow || isTab)) {
    return;
  }

  let selection = getSelection();
  // 选中 article 直接子节点时，选中 table 前后时，会有该情况发生
  if (selection.selectStructure) {
    event?.preventDefault();
    let component = getComponentById(selection.range[0].id);
    if (isEnter) {
      focusAt(
        component.parent?.add(new Paragraph(), selection.range[0].offset)
      );
      return;
    }
    if (isBackspace) {
      if (component instanceof Table) {
        focusAt(component.replaceSelf(new Paragraph()));
        return;
      }
    }
    return;
  }

  if (isArrow) {
    let component = getComponentById(selection.range[0].id);
    let map = {
      ArrowUp: DirectionType.up,
      ArrowDown: DirectionType.down,
      ArrowLeft: DirectionType.left,
      ArrowRight: DirectionType.right
    };
    component.handleArrow(selection.range[0].offset, map[key]);
    return;
  }

  createRecord(selection.range[0], selection.range[1]);
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
