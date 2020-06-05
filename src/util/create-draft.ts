import Article from "../components/article";
import onClick from "./on-click";
import onPaste from "./on-paste";
import onComposttion from "./on-composition";
import { flushSelection } from "../selection-operator/get-selection";
import onKeyDown from "./on-keydown";

const createDraft = (root: HTMLElement, article: Article) => {
  let editorWrap = document.createElement("div");
  editorWrap.contentEditable = "true";
  editorWrap.classList.add("zebra-draft-root");
  editorWrap.style.whiteSpace = "pre-wrap";
  editorWrap.appendChild(article.render());
  editorWrap.addEventListener("blur", (event) => {
    try {
      flushSelection();
    } catch {}
  });
  editorWrap.addEventListener("click", (event) => {
    onClick(event);
  });
  editorWrap.addEventListener("keydown", (event) => {
    onKeyDown(event);
  });
  editorWrap.addEventListener("compositionstart", (event) => {
    console.log("compositionstart");
  });
  editorWrap.addEventListener("compositionend", (event) => {
    onComposttion(event as any);
  });
  editorWrap.addEventListener("paste", (event) => {
    event.preventDefault();
    onPaste(event);
    console.error("仅复制文本内容");
  });
  editorWrap.addEventListener("dragstart", (event) => {
    event.preventDefault();
    alert("拖拽功能暂不能用！！！");
    console.error("拖拽功能暂不能用！！！");
  });
  root.innerHTML = "";
  root.appendChild(editorWrap);
  return root;
};

export default createDraft;
