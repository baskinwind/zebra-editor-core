import Block from "../components/block";
import BaseBuilder from "../content/base-builder";
import UserOperator from "../operator-user";
import BaseOperator from "../operator-user/base-operator";
import ComponentFactory from "../components";
import { initRecord } from "../record/util";
import { startUpdate } from "./update-component";
import {
  setContainDocument,
  setContainWindow
} from "../operator-selection/util";
import defaultStyle from "./default-style";
import { nextTicket } from "../components/util";

export interface IOption {
  placeholder?: string;
  userOperator?: BaseOperator;
  contentBuilder?: BaseBuilder;
  componentFactory?: ComponentFactory;
  beforeCreate?: (document: Document, window: Window | null) => void;
  afterCreate?: (document: Document, window: Window | null) => void;
}

// 将组件挂载到某个节点上
const createEditor = (root: HTMLElement, block: Block, option?: IOption) => {
  block.active = true;
  startUpdate();
  initRecord(block);
  let operator = option?.userOperator || UserOperator.getInstance();

  // 生成 iframe 并获取 document 与 window 对象
  root.innerHTML = "";
  let iframe = document.createElement("iframe");
  iframe.id = "iframe";
  iframe.width = "100%";
  iframe.height = "100%";
  iframe.frameBorder = "0";
  root.appendChild(iframe);

  // firefox 下必须异步才能获取 contentDocument 与 contentWindow
  setTimeout(() => {
    if (!iframe.contentDocument) {
      return;
    }

    let style = iframe.contentDocument.createElement("style");
    style.textContent = defaultStyle;
    iframe.contentDocument.head.appendChild(style);
    if (option && option.beforeCreate) {
      option.beforeCreate(iframe.contentDocument, iframe.contentWindow);
    }
    setContainDocument(iframe.contentDocument);
    setContainWindow(iframe.contentWindow);

    // 生成容器
    let editor = iframe.contentDocument.createElement("div");
    editor.id = "zebra-editor-contain";
    editor.contentEditable = "true";
    editor.appendChild(block.render());
    iframe.contentDocument.body.appendChild(editor);
    iframe.contentDocument.body.dataset.focus = "false";

    let placeholder = iframe.contentDocument.createElement("div");
    placeholder.classList.add("zebra-editor-placeholder");
    placeholder.textContent = option?.placeholder || "开始你的故事 ... ";

    document.addEventListener("editorchange", (e) => {
      if (!block.isEmpty()) {
        placeholder.style.display = "none";
      } else {
        placeholder.style.display = "block";
      }
    });
    iframe.contentDocument.body.appendChild(placeholder);
    nextTicket(() => {
      document.dispatchEvent(new Event("editorchange"));
    });

    // 监听事件
    editor.addEventListener("input", (event: any) => {
      try {
        operator.onInput(event);
      } catch (e) {
        console.warn(e);
      }
    });

    editor.addEventListener("beforeinput", (event: any) => {
      try {
        operator.onBeforeInput(event);
      } catch (e) {
        console.warn(e);
      }
    });

    editor.addEventListener("blur", (event) => {
      // @ts-ignore
      iframe.contentDocument.body.dataset.focus = "false";
      try {
        operator.onBlur(event);
      } catch (e) {
        console.warn(e);
      }
    });

    editor.addEventListener("mousedown", (event) => {
      // @ts-ignore
      iframe.contentDocument.body.dataset.focus = "true";
    });

    editor.addEventListener("click", (event) => {
      try {
        operator.onClick(event);
      } catch (e) {
        console.warn(e);
      }
    });

    editor.addEventListener("keydown", (event) => {
      try {
        operator.onKeyDown(event);
      } catch (e) {
        console.warn(e);
      }
    });

    editor.addEventListener("compositionstart", (event) => {
      try {
        operator.onCompositionStart(event as CompositionEvent);
      } catch (e) {
        console.warn(e);
      }
    });

    editor.addEventListener("compositionend", (event) => {
      try {
        operator.onCompositionEnd(event as CompositionEvent);
      } catch (e) {
        console.warn(e);
      }
    });

    editor.addEventListener("paste", (event) => {
      console.info("仅可复制文本内容");
      try {
        operator.onPaste(event);
      } catch (e) {
        console.warn(e);
      }
    });

    editor.addEventListener("dragstart", (event) => {
      event.preventDefault();
    });

    editor.addEventListener("drop", (event) => {
      event.preventDefault();
    });

    if (option && option.afterCreate) {
      option.afterCreate(iframe.contentDocument, iframe.contentWindow);
    }
  });

  return root;
};

export default createEditor;
