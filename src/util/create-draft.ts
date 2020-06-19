import Block from "../components/block";
import BaseBuilder from "../content/base-builder";
import BaseOperator from "../user-operator/base-operator";
import UserOperator from "../user-operator";
import { initRecord } from "../record/util";
import { startUpdate } from "./update-component";
import { setContentBuilder } from "../content";
import {
  setContainDocument,
  setContainWindow
} from "../selection-operator/util";
import defaultStyle from "./default-style";

export interface IOption {
  contentBuilder?: BaseBuilder;
  userOperator?: BaseOperator;
}

// 将组件挂载到某个节点上
const createDraft = (root: HTMLElement, block: Block, option?: IOption) => {
  startUpdate();
  initRecord(block);
  if (option && option.contentBuilder) {
    setContentBuilder(option.contentBuilder);
  }
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
    let editor = iframe.contentDocument.body;
    style.textContent = defaultStyle;
    iframe.contentDocument.head.appendChild(style);
    setContainDocument(iframe.contentDocument);
    setContainWindow(iframe.contentWindow);

    // 生成容器
    editor.contentEditable = "true";
    editor.appendChild(block.render());
    block.active = true;

    // 监听事件
    editor.addEventListener("blur", (event) => {
      editor.dataset.focus = "false";
      try {
        operator.onBlur(event);
      } catch (e) {
        console.warn(e);
      }
    });
    editor.addEventListener("mousedown", (event) => {
      editor.dataset.focus = "true";
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
  });

  return root;
};

export default createDraft;
