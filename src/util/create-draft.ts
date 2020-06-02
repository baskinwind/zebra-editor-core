import Article from "../components/article";
import onClick from "../selection-operator/on-click";
import escapeKey from "../selection-operator/escape-key";
import onKeyUp from "../selection-operator/on-keyup";
import onPaste from "../selection-operator/on-paste";
import onComposttion from "../selection-operator/on-composition";
import { flushSelection } from "../selection-operator/get-selection";

const createDraft = (root: HTMLElement, article: Article) => {
  let editorWrap = document.createElement("div");
  // 是否正在混合输入
  let isComposition = false;
  // 混合输入是否结束，包括输入结束的选中输入
  let compositionEnd = true;
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
    escapeKey(event);
  });
  editorWrap.addEventListener("keyup", (event) => {
    if (!compositionEnd) {
      if (!isComposition) {
        compositionEnd = true;
      }
      return;
    }
    onKeyUp(event);
  });
  editorWrap.addEventListener("compositionstart", (event) => {
    isComposition = true;
    compositionEnd = false;
  });
  editorWrap.addEventListener("compositionend", (event) => {
    onComposttion(event as any);
    isComposition = false;
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
