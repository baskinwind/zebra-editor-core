import BaseOperator from "./base-operator";
import DirectionType from "../const/direction-type";
import getSelection, {
  flushSelection
} from "../operator-selection/get-selection";
import backspace from "../operator-character/backspace";
import input from "../operator-character/input";
import onKeyDown from "./on-keydown";
import onPaste from "./on-paste";
import { getBlockById, nextTicket } from "../components/util";
import { createDurationRecord, undo, redo } from "../record/util";
import { getContainWindow } from "../operator-selection/util";
import focusAt from "../operator-selection/focus-at";

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
    nextTicket(() => {
      document.dispatchEvent(new Event("editorchange"));
    });
  }

  onPaste(event: ClipboardEvent) {
    onPaste(event);
  }

  onCompositionStart(event: CompositionEvent) {
    let selection = getSelection();
    createDurationRecord(selection.range[0], selection.range[1]);
    if (!selection.isCollapsed) {
      backspace(selection.range[0], selection.range[1], event);
    }
  }

  onCompositionEnd(event: CompositionEvent) {
    let selection = getSelection();
    // 混合输入会导致获取选区在输入文字的后方
    input(
      event.data,
      {
        id: selection.range[0].id,
        offset: selection.range[0].offset - [...event.data].length
      },
      event
    );
  }

  onBeforeInput(event: InputEvent) {
    // 排除已经处理的输入
    if (
      event.inputType === "insertCompositionText" ||
      event.inputType === "deleteContentBackward" ||
      !event.data ||
      event.data === ""
    )
      return;
    let selection = getSelection();
    let start = selection.range[0];
    let end = selection.range[1];
    createDurationRecord(start, end);
    if (!selection.isCollapsed) {
      backspace(start, end);
      selection = getSelection();
    }
  }

  onInput(event: InputEvent) {
    // 排除已经处理的输入
    if (
      event.inputType === "insertCompositionText" ||
      event.inputType === "deleteContentBackward" ||
      !event.data ||
      event.data === ""
    )
      return;
    let data = event.data;
    let selection = getSelection();
    let start = selection.range[0];
    start.offset = start.offset - [...data].length;
    input(data, start, event);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.isComposing || event.keyCode === 229) {
      return;
    }
    if (event.key.toLowerCase() === "tab") {
      this.onTab(event);
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
    nextTicket(() => {
      document.dispatchEvent(new Event("editorchange"));
    });
  }

  // 仅处理 enter c v z 的逻辑，继承时，需先调用 super
  handleFunctionKey(event: KeyboardEvent) {
    let selection = getSelection();
    let isCtrl = event.ctrlKey || event.metaKey;
    let key = event.key.toLowerCase();
    if (isCtrl && event.key === "Enter") {
      let component = getBlockById(selection.range[1].id);
      focusAt(component.addEmptyParagraph(!event.shiftKey));
      return;
    }
    // 复制、黏贴不控制
    if (isCtrl && ["c", "v"].includes(key)) {
      return;
    }
    if (isCtrl && "z" === key) {
      if (event.shiftKey) {
        redo();
      } else {
        undo();
      }
      return;
    }
    event.preventDefault();
  }

  onTab(event: KeyboardEvent) {
    event.preventDefault();
  }
}

export default UserOperator;
