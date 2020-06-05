import Article from "../components/article";
import onClick from "./on-click";
import onPaste from "./on-paste";
import onComposttion from "./on-composition";
import onKeyDown from "./on-keydown";
import { flushSelection } from "../selection-operator/get-selection";

// 将组件挂载到某个节点上
const createDraft = (root: HTMLElement, article: Article) => {
  let editorWrap = document.createElement("div");
  editorWrap.contentEditable = "true";
  editorWrap.classList.add("zebra-draft-root");
  editorWrap.style.whiteSpace = "pre-wrap";
  editorWrap.appendChild(article.render());
  editorWrap.addEventListener("blur", (event) => {
    try {
      flushSelection();
    } catch (e) {
      console.error(e);
    }
  });
  editorWrap.addEventListener("click", (event) => {
    try {
      onClick(event);
    } catch (e) {
      console.error(e);
    }
  });
  editorWrap.addEventListener("keydown", (event) => {
    try {
      onKeyDown(event);
    } catch (e) {
      console.error(e);
    }
  });
  editorWrap.addEventListener("compositionend", (event) => {
    try {
      onComposttion(event as any);
    } catch (e) {
      console.error(e);
    }
  });
  editorWrap.addEventListener("paste", (event) => {
    console.info("目前仅能复制文本内容");
    try {
      event.preventDefault();
      onPaste(event);
    } catch (e) {
      console.error(e);
    }
  });
  editorWrap.addEventListener("dragstart", (event) => {
    event.preventDefault();
    console.info("拖拽功能暂不能用！！！");
  });
  root.innerHTML = "";
  root.appendChild(editorWrap);
  return root;
};

export default createDraft;
