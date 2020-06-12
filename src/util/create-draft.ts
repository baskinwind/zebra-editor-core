import Article from "../components/article";
import onClick from "./on-click";
import onKeyDown from "./on-keydown";
import onComposttionEnd from "./on-composition-end";
import onComposttionStart from "./on-composition-start";
import onPaste from "./on-paste";
import { flushSelection } from "../selection-operator/get-selection";
import { initRecord, startRecord } from "../record/util";
import { startUpdate } from "./update-component";

// 将组件挂载到某个节点上
const createDraft = (root: HTMLElement, article: Article) => {
  startUpdate();
  startRecord();
  initRecord(article);

  let editorWrap = document.createElement("div");
  editorWrap.contentEditable = "true";
  editorWrap.classList.add("zebra-draft-root");
  editorWrap.style.whiteSpace = "pre-wrap";
  editorWrap.appendChild(article.render());
  article.active = true;
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
      onComposttionStart(event as any);
    } catch (e) {
      console.warn(e);
    }
  });
  editorWrap.addEventListener("compositionend", (event) => {
    try {
      onComposttionEnd(event as any);
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
