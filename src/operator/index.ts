import Editor from "../editor";
import DirectionType from "../const/direction-type";
import getSelection from "../selection/get-selection";
import { Cursor } from "../selection/util";
import input from "./input";
import paste from "./paste";
import enter from "./enter";
import backspace from "./backspace";
import focusAt from "../selection/focus-at";
import nextTick from "../util/next-tick";

class Operator {
  isFireFox: boolean = navigator.userAgent.indexOf("Firefox") > -1;

  editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  onBlur(event: FocusEvent) {}

  onClick(event: MouseEvent) {
    // 修复点击图片未选中图片的问题
    let section = this.editor.mountedWindow.getSelection();
    let target = event.target as HTMLElement;
    if (target.nodeName === "IMG") {
      section?.removeAllRanges();
      let range = new Range();
      range.selectNode(target);
      section?.addRange(range);
    }

    nextTick(() => {
      document.dispatchEvent(new Event("editorChange"));
    });
  }

  onDoubleClick(event: MouseEvent) {}

  onInput(text: string, start: Cursor, event: KeyboardEvent | CompositionEvent | InputEvent) {
    input(this.editor, text, start, event);
  }

  onCut(event: ClipboardEvent) {
    let selection = getSelection(this.editor);
    setTimeout(() => {
      backspace(this.editor, selection.range[0], selection.range[1]);
    }, 30);
  }

  onPaste(event: ClipboardEvent) {
    paste(this.editor, event);
  }

  onSave() {
    this.editor.articleManage.save();
  }

  onTab(start: Cursor, end: Cursor, event: KeyboardEvent) {}

  onEnter(start: Cursor, end: Cursor, event: KeyboardEvent) {
    enter(this.editor, start, end, event);
  }

  onBackspace(start: Cursor, end: Cursor, event: KeyboardEvent) {
    backspace(this.editor, start, end, event);
  }

  onArraw(direction: DirectionType, event: KeyboardEvent) {
    nextTick(() => {
      document.dispatchEvent(new Event("editorChange"));
    });
  }

  onCommand(start: Cursor, end: Cursor, key: string, shift: boolean, event: KeyboardEvent) {
    if (key === "enter") {
      let component = this.editor.storeManage.getBlockById(start.id);
      let operator = component.addEmptyParagraph(!shift);
      focusAt(this.editor, operator?.[0] || start, operator?.[1]);
      return;
    }

    // 撤销与取消撤销代理到 iframe 上，避免工具栏撤销失效
    if (key === "z") {
      return;
    }

    // 全选、复制、剪切、黏贴无需控制
    if (!shift && ["a", "c", "x", "v"].includes(key)) {
      return;
    }

    event.preventDefault();

    // 保存
    if (key === "s") {
      this.onSave();
      return;
    }
  }

  onKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    let {
      range: [start, end],
    } = getSelection(this.editor);

    // 非功能按键放过
    if (event.ctrlKey || event.metaKey) {
      this.onCommand(start, end, key, event.shiftKey, event);
      return;
    }

    // tab
    if (key === "tab") {
      this.onTab(start, end, event);
      return;
    }

    // 换行
    if (key === "enter") {
      this.onEnter(start, end, event);
      return;
    }

    // 删除
    if (key === "backspace") {
      this.onBackspace(start, end, event);
      return;
    }

    // 方向键
    if (/^arrow/i.test(event.key)) {
      let map = {
        ArrowUp: DirectionType.up,
        ArrowDown: DirectionType.down,
        ArrowLeft: DirectionType.left,
        ArrowRight: DirectionType.right,
      };
      this.onArraw(map[event.key], event);
      return;
    }
  }
}

export default Operator;
