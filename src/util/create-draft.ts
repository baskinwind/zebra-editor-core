import Block from "../components/block";
import BaseBuilder from "../content/baseBuilder";
import onClick from "./on-click";
import onKeyDown from "./on-keydown";
import onComposttionEnd from "./on-composition-end";
import onComposttionStart from "./on-composition-start";
import onPaste from "./on-paste";
import { flushSelection } from "../selection-operator/get-selection";
import { initRecord } from "../record/util";
import { startUpdate } from "./update-component";
import { setContentBuilder } from "../content";

// 将组件挂载到某个节点上
const createDraft = (
  root: HTMLElement,
  block: Block,
  option?: {
    contentBuilder?: BaseBuilder;
  }
) => {
  startUpdate();
  initRecord(block);
  if (option && option.contentBuilder) {
    setContentBuilder(option.contentBuilder);
  }

  let editorWrap = document.createElement("div");
  editorWrap.contentEditable = "true";
  editorWrap.classList.add("zebra-draft-root");
  editorWrap.style.whiteSpace = "pre-wrap";
  editorWrap.appendChild(block.render());
  block.active = true;
  editorWrap.addEventListener("blur", (event) => {
    try {
      flushSelection();
    } catch (e) {
      console.warn(e);
    }
  });
  editorWrap.addEventListener("click", (event) => {
    try {
      onClick(event);
    } catch (e) {
      console.warn(e);
    }
  });
  editorWrap.addEventListener("keydown", (event) => {
    try {
      onKeyDown(event);
    } catch (e) {
      console.warn(e);
    }
  });
  editorWrap.addEventListener("compositionstart", (event) => {
    try {
      onComposttionStart(event as CompositionEvent);
    } catch (e) {
      console.warn(e);
    }
  });
  editorWrap.addEventListener("compositionend", (event) => {
    try {
      onComposttionEnd(event as CompositionEvent);
    } catch (e) {
      console.warn(e);
    }
  });
  editorWrap.addEventListener("paste", (event) => {
    console.info("仅可复制文本内容");
    try {
      event.preventDefault();
      onPaste(event);
    } catch (e) {
      console.warn(e);
    }
  });
  editorWrap.addEventListener("dragstart", (event) => {
    event.preventDefault();
    console.info("拖拽功能暂不可用！！！");
  });
  root.innerHTML = "";
  root.appendChild(editorWrap);
  return root;
};

export default createDraft;
