import Editor from "../editor/editor";
import DirectionType from "../const/direction-type";
import getSelection, {
  flushSelection,
  getBeforeSelection,
} from "../operator-selection/get-selection";
import backspace from "../operator/backspace";
import input from "../operator/input";
import onKeyDown from "./on-keydown";
import onPaste from "./on-paste";
import focusAt from "../operator-selection/focus-at";
import saveArticle from "../editor/util/save-article";
import nextTicket from "../util/next-ticket";

class UserOperator {
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
    nextTicket(() => {
      document.dispatchEvent(new Event("editorChange"));
    });
  }

  onDbclick(event: MouseEvent) {}

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
      offset: selection.range[0].offset - [...event.data].length,
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
        offset: selection.range[0].offset - [...event.data].length,
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
    onKeyDown(this.editor, event);
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
    let selection = getSelection(this.editor.mountedWindow);
    if (ctrl && key === "enter") {
      let component = this.editor.storeManage.getBlockById(
        selection.range[1].id,
      );
      focusAt(this.editor.mountedWindow, component.addEmptyParagraph(!shift));
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
      // 刷新
      if (key === "r") {
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
