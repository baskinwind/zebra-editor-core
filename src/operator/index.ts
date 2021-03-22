import Editor from "../editor";
import DirectionType from "../const/direction-type";
import getSelection, { flushSelection, getBeforeSelection } from "../selection/get-selection";
import backspace from "./backspace";
import input from "./input";
import onKeyDown from "./on-keydown";
import onPaste from "./on-paste";
import focusAt from "../selection/focus-at";
import nextTick from "../util/next-tick";
import { getTextLength } from "../util/text-util";

class Operator {
  isFireFox: boolean = navigator.userAgent.indexOf("Firefox") > -1;

  editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  onBlur(event: FocusEvent) {
    flushSelection(this.editor.mountedWindow);
  }

  onClick(event: MouseEvent) {
    // 修复点击图片未选中图片的问题
    let section = this.editor.mountedWindow.getSelection();
    let target = event.target as HTMLElement;
    if (target.nodeName === "IMG") {
      try {
        section?.removeAllRanges();
      } catch {}
      let range = new Range();
      range.selectNode(target);
      section?.addRange(range);
    }

    nextTick(() => {
      document.dispatchEvent(new Event("editorChange"));
    });
  }

  onDoubleClick(event: MouseEvent) {}

  onPaste(event: ClipboardEvent) {
    onPaste(this.editor, event);
  }

  onCut(event: ClipboardEvent) {
    let selection = getSelection(this.editor.mountedWindow);
    setTimeout(() => {
      backspace(this.editor, selection.range[0], selection.range[1]);
    }, 30);
  }

  onCompositionStart(event: CompositionEvent) {
    let selection = getSelection(this.editor.mountedWindow);
    if (!selection.isCollapsed) {
      backspace(this.editor, selection.range[0], selection.range[1], event);
    }
  }

  onCompositionEnd(event: CompositionEvent) {
    let selection = getSelection(this.editor.mountedWindow);
    let start = {
      id: selection.range[0].id,
      offset: selection.range[0].offset - getTextLength(event.data),
    };
    // 混合输入会导致获取选区在输入文字的后方
    input(this.editor, event.data, start, event);
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
    let selection = getSelection(this.editor.mountedWindow);
    let start = selection.range[0];
    let end = selection.range[1];
    if (!selection.isCollapsed) {
      backspace(this.editor, start, end);
      getSelection(this.editor.mountedWindow);
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
      let selection = getSelection(this.editor.mountedWindow);
      start = {
        id: start.id,
        offset: selection.range[0].offset - getTextLength(event.data),
      };
    }

    input(this.editor, data, start, event);
  }

  onKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    // 混合输入
    if (event.isComposing || event.keyCode === 229) {
      return;
    }

    // tab 特殊处理
    if (key === "tab") {
      event.preventDefault();
      this.onTab(event);
      return;
    }

    // 功能键特殊处理
    if (event.ctrlKey || event.metaKey) {
      this.handleFunctionKey(event.ctrlKey || event.metaKey, event.shiftKey, key, event);
      return;
    }

    // 方向键特殊处理
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

    onKeyDown(this.editor, event);
  }

  handleArrawKey(direction: DirectionType) {
    nextTick(() => {
      document.dispatchEvent(new Event("editorChange"));
    });
  }

  // 保留一些无需控制的行为，其他的都禁止掉，继承时，需先调用 super
  handleFunctionKey(ctrl: boolean, shift: boolean, key: string, event: KeyboardEvent) {
    let selection = getSelection(this.editor.mountedWindow);

    if (ctrl && key === "enter") {
      let component = this.editor.storeManage.getBlockById(selection.range[1].id);
      let operator = component.addEmptyParagraph(!shift);
      focusAt(this.editor.mountedWindow, operator[1], operator[2]);
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

      // 页面刷新
      if (key === "r") {
        return;
      }
    }

    // 屏蔽浏览器的默认行为，比如 ctrl + b 设置加粗等
    event.preventDefault();
  }

  onSave() {
    this.editor.articleManage.save();
  }

  onTab(event: KeyboardEvent) {}
}

export default Operator;
