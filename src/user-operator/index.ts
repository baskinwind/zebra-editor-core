import BaseOperator from "./base-operator";
import DirectionType from "../const/direction-type";
import getSelection, {
  flushSelection,
  getBeforeSelection
} from "../selection-operator/get-selection";
import backspace from "../rich-util/backspace";
import input from "../rich-util/input";
import onKeyDown from "./on-keydown";
import onPaste from "./on-paste";
import { getBlockById } from "../components/util";
import { createRecord } from "../record/util";
import { getContainWindow } from "../selection-operator/util";

class UserOperator extends BaseOperator {
  static bulider: UserOperator;
  static getInstance() {
    if (!this.bulider) {
      this.bulider = new UserOperator();
    }
    return this.bulider;
  }

  onBlur(event: FocusEvent) {
    flushSelection();
  }

  onClick(event: MouseEvent) {
    // 修复点击图片未选中图片的问题
    let target = event.target as any;
    if (target.nodeName === "IMG") {
      let section = getContainWindow().getSelection();
      try {
        section?.removeAllRanges();
      } catch {}
      let range = new Range();
      range.selectNode(target);
      section?.addRange(range);
    }
    if (target.nodeName === "A") {
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent) {
    onPaste(event);
  }

  onCompositionStart(event: CompositionEvent) {
    let selection = getSelection();
    createRecord(selection.range[0], selection.range[1]);
    if (!selection.isCollapsed) {
      backspace(selection.range[0], selection.range[1], event);
    }
  }

  onCompositionEnd(event: CompositionEvent) {
    let selection = getBeforeSelection();
    // createRecord(selection.range[0], selection.range[1]);
    input(event.data, {
      id: selection.range[0].id,
      offset: selection.range[0].offset - event.data.length
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.isComposing || event.keyCode === 229) {
      return;
    }
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      this.handleFunctionKey(event);
      return;
    }
    if (/^Arrow/.test(event.key)) {
      let map = {
        ArrowUp: DirectionType.up,
        ArrowDown: DirectionType.down,
        ArrowLeft: DirectionType.left,
        ArrowRight: DirectionType.right
      };
      this.handleArrawKey(map[event.key]);
      return;
    }
    onKeyDown(event);
    return;
  }

  handleArrawKey(direction: DirectionType) {
    let selection = getSelection();
    let component = getBlockById(selection.range[0].id);
    component.handleArrow(selection.range[0].offset, direction);
  }

  handleFunctionKey(event: KeyboardEvent) {}
}

export default UserOperator;
