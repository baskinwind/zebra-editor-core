import BaseOperator from "./base-operator";
import DirectionType from "../const/direction-type";
import getSelection, {
  flushSelection,
  getBeforeSelection,
} from "../operator-selection/get-selection";
import backspace from "../operator/backspace";
import input from "../operator/input";
import onKeyDown from "./on-keydown";
import onPaste from "./on-paste";
import { getBlockById } from "../components/util";
import { createDurationRecord, createRecord } from "../record/util";
import { getContainDocument } from "../operator-selection/util";
import focusAt from "../operator-selection/focus-at";
import nextTicket from "../util/next-ticket";
import saveArticle from "../util/save-article";

class UserOperator extends BaseOperator {
  static bulider: UserOperator;
  static getInstance() {
    if (!this.bulider) {
      this.bulider = new UserOperator();
    }
    return this.bulider;
  }

  isFireFox: boolean = navigator.userAgent.indexOf("Firefox") > -1;

  onBlur(event: FocusEvent) {
    flushSelection();
  }

  onClick(event: MouseEvent) {
    // 修复点击图片未选中图片的问题
    let doc = getContainDocument();
    let section = doc.getSelection();
    let target = event.target as HTMLElement;
    if (target.nodeName === "IMG") {
      try {
        section?.removeAllRanges();
      } catch {}
      let range = new Range();
      range.selectNode(target);
      section?.addRange(range);
    }
    nextTicket(() => {
      document.dispatchEvent(new Event("editorChange"));
    });
  }

  onDbclick(event: MouseEvent) {}

  onPaste(event: ClipboardEvent) {
    onPaste(event);
  }

  onCut(event: ClipboardEvent) {
    let selection = getSelection();
    setTimeout(() => {
      createRecord();
      backspace(selection.range[0], selection.range[1]);
    }, 30);
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
    let start = {
      id: selection.range[0].id,
      offset: selection.range[0].offset - [...event.data].length,
    };
    // 混合输入会导致获取选区在输入文字的后方
    input(event.data, start, event);
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
      !event.data
    )
      return;
    let data = event.data;
    let selection = getBeforeSelection();
    let start = selection.range[0];

    // 注：由于 firefox 不支持 beforeinput 事件，需要对 firefox 进行兼容处理
    if (this.isFireFox) {
      let selection = getSelection();
      start = {
        id: start.id,
        offset: selection.range[0].offset - [...event.data].length,
      };
      createDurationRecord(start, start);
    }

    input(data, start, event);
  }

  onKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    // 混合输入
    if (event.isComposing || event.keyCode === 229) {
      return;
    }
    if (key === "tab") {
      event.preventDefault();
      this.onTab(event);
      return;
    }
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      this.handleFunctionKey(
        event.ctrlKey || event.metaKey,
        event.shiftKey,
        key,
        event,
      );
      return;
    }
    if (/^arrow/i.test(event.key)) {
      let map = {
        ArrowUp: DirectionType.up,
        ArrowDown: DirectionType.down,
        ArrowLeft: DirectionType.left,
        ArrowRight: DirectionType.right,
      };
      this.handleArrawKey(map[event.key]);
      return;
    }
    onKeyDown(event);
  }

  handleArrawKey(direction: DirectionType) {
    nextTicket(() => {
      document.dispatchEvent(new Event("editorChange"));
    });
  }

  // 保留一些无需控制的行为，其他的都禁止掉，继承时，需先调用 super
  handleFunctionKey(
    ctrl: boolean,
    shift: boolean,
    key: string,
    event: KeyboardEvent,
  ) {
    let selection = getSelection();
    if (ctrl && key === "enter") {
      let component = getBlockById(selection.range[1].id);
      focusAt(component.addEmptyParagraph(!shift));
      return;
    }

    if (ctrl) {
      // 撤销与取消撤销代理到 iframe 上
      if (key === "z") {
        return;
      }
      // 全选、复制、剪切、黏贴无需控制
      if (!shift && ["a", "c", "x", "v"].includes(key)) {
        return;
      }
      // 保存
      if (key === "s") {
        this.onSave();
        event.preventDefault();
        return;
      }
    }

    // 屏蔽浏览器的默认行为，比如 ctrl + b 设置加粗等
    event.preventDefault();
  }

  onSave() {
    saveArticle();
  }

  onTab(event: KeyboardEvent) {}
}

export default UserOperator;
