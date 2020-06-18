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

  // @ts-ignore
  let editorWrap = iframe.contentDocument.createElement("div");

  // 生成容器
  editorWrap.contentEditable = "true";
  editorWrap.classList.add("x-editor-root");
  editorWrap.style.whiteSpace = "pre-wrap";
  editorWrap.style.outline = "none";
  editorWrap.style.minHeight = "100%";
  editorWrap.appendChild(block.render());
  block.active = true;

  // firefox 下必须异步才能获取 contentDocument 与 contentWindow
  setTimeout(() => {
    if (iframe.contentDocument) {
      iframe.contentDocument.body.style.margin = "20px";
      iframe.contentDocument.body.appendChild(editorWrap);
      let style = iframe.contentDocument?.createElement("style");
      style.textContent = defaultStyle;
      iframe.contentDocument.head.appendChild(style);
      setContainDocument(iframe.contentDocument);
      setContainWindow(iframe.contentWindow);
    }
  });

  // 监听事件
  editorWrap.addEventListener("blur", (event) => {
    try {
      operator.onBlur(event);
    } catch (e) {
      console.warn(e);
    }
  });
  editorWrap.addEventListener("click", (event) => {
    try {
      operator.onClick(event);
    } catch (e) {
      console.warn(e);
    }
  });
  editorWrap.addEventListener("keydown", (event) => {
    try {
      operator.onKeyDown(event);
    } catch (e) {
      console.warn(e);
    }
  });
  editorWrap.addEventListener("compositionstart", (event) => {
    try {
      operator.onCompositionStart(event as CompositionEvent);
    } catch (e) {
      console.warn(e);
    }
  });
  editorWrap.addEventListener("compositionend", (event) => {
    try {
      operator.onCompositionEnd(event as CompositionEvent);
    } catch (e) {
      console.warn(e);
    }
  });
  editorWrap.addEventListener("paste", (event) => {
    console.info("仅可复制文本内容");
    try {
      operator.onPaste(event);
    } catch (e) {
      console.warn(e);
    }
  });
  editorWrap.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  return root;
};

export default createDraft;
