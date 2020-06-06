import Table from "../components/table";
import input from "./input";
import getSelection from "../selection-operator/get-selection";
import enter from "../selection-operator/enter";
import backspace from "../selection-operator/backspace";
import Paragraph from "../components/paragraph";
import focusAt from "../selection-operator/focus-at";
import { getComponentById } from "../components/util";

const onKeyDown = (event: KeyboardEvent) => {
  console.log('onKeyDown');
  // 混合输入直接跳出
  if (event.isComposing || event.keyCode === 229) {
    return;
  }
  let key = event.key;
  let lowerKey = key.toLowerCase();
  let isEnter = lowerKey === "enter";
  let isBackspace = lowerKey === "backspace";
  if (!(isEnter || isBackspace || key.length === 1)) {
    return;
  }

  let selection = getSelection();
  // 选中 article 直接子节点时，选中 table 前后时，会有该情况发生
  if (selection.selectStructure) {
    event?.preventDefault();
    let component = getComponentById(selection.range[0].id);
    if (isEnter) {
      focusAt(component.parent?.add(new Paragraph(), selection.range[0].offset));
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
