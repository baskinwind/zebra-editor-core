import Editor from "../editor";
import defaultStyle from "../../util/default-style";
import nextTick from "../../util/next-tick";
import Article from "../../components/article";
import StructureType from "../../const/structure-type";

// 将组件挂载到某个节点上
const createEditor = (
  root: HTMLElement,
  article: Article,
  editor: Editor,
  beforeCreate?: (document: Document, window: Window) => void,
  afterCreate?: (document: Document, window: Window) => void,
) => {
  article.active = true;
  let operator = editor.userOperator;

  // 生成 iframe 并获取 document 与 window 对象
  root.innerHTML = "";
  let iframe = document.createElement("iframe");
  iframe.id = `iframe-${article.id}`;
  iframe.width = "100%";
  iframe.height = "100%";
  iframe.style.border = "none";
  root.appendChild(iframe);

  const loadIframe = () => {
    if (!iframe.contentWindow || !iframe.contentDocument) {
      return;
    }

    let style = iframe.contentDocument.createElement("style");
    style.textContent = defaultStyle;
    iframe.contentDocument.head.appendChild(style);

    if (beforeCreate) {
      beforeCreate(iframe.contentDocument, iframe.contentWindow);
    }

    // 生成容器
    let editorDom = iframe.contentDocument.createElement("div");
    editorDom.id = "zebra-editor-contain";
    editorDom.contentEditable = "true";
    editorDom.appendChild(article.render(editor.contentBuilder));
    iframe.contentDocument.body.appendChild(editorDom);

    // placeholder
    const placeholderStyle = iframe.contentDocument.createElement("style");
    placeholderStyle.textContent = `.zebra-editor-article > :first-child.zebra-editor-empty::before {content:'${editor.placeholder}';}`;
    iframe.contentDocument.head.appendChild(placeholderStyle);

    document.addEventListener("editorChange", (e) => {
      let article = editor.article;
      if (!article) return;
      let lastTyle = article.getChild(article.getSize() - 1).structureType;
      if (lastTyle !== StructureType.content) {
        article.add(editor.componentFactory.buildParagraph());
      }
    });

    nextTick(() => {
      document.dispatchEvent(new Event("editorChange"));
    });

    // 监听事件
    editorDom.addEventListener("blur", (event) => {
      try {
        operator.onBlur(event);
      } catch (e) {
        console.warn(e);
      }
    });

    editorDom.addEventListener("click", (event) => {
      try {
        operator.onClick(event);
      } catch (e) {
        console.warn(e);
      }
    });

    editorDom.addEventListener("dblclick", (event) => {
      try {
        operator.onDoubleClick(event);
      } catch (e) {
        console.warn(e);
      }
    });

    editorDom.addEventListener("paste", (event) => {
      console.info("仅可复制文本内容");
      try {
        operator.onPaste(event);
      } catch (e) {
        console.warn(e);
      }
    });

    editorDom.addEventListener("cut", (event) => {
      try {
        operator.onCut(event);
      } catch (e) {
        console.warn(e);
      }
    });

    editorDom.addEventListener("compositionstart", (event) => {
      try {
        operator.onCompositionStart(event as CompositionEvent);
      } catch (e) {
        console.warn(e);
      }
    });

    editorDom.addEventListener("compositionend", (event) => {
      try {
        operator.onCompositionEnd(event as CompositionEvent);
      } catch (e) {
        console.warn(e);
      }
    });

    editorDom.addEventListener("beforeinput", (event: any) => {
      try {
        operator.onBeforeInput(event);
      } catch (e) {
        console.warn(e);
      }
    });

    editorDom.addEventListener("input", (event: any) => {
      try {
        operator.onInput(event);
      } catch (e) {
        console.warn(e);
      }
    });

    editorDom.addEventListener("keydown", (event) => {
      try {
        operator.onKeyDown(event);
      } catch (e) {
        console.warn(e);
      }
    });

    // 撤回和取消撤回，单独设置，设置在 iframe 上。
    iframe.contentDocument.addEventListener("keydown", (event) => {
      try {
        const key = event.key.toLowerCase();
        if ("z" === key && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          if (event.shiftKey) {
            editor.historyManage.redo();
          } else {
            editor.historyManage.undo();
          }
        }
      } catch (e) {
        console.warn(e);
      }
    });

    editorDom.addEventListener("mousedown", (event) => {
      let focus = iframe.contentDocument?.hasFocus();
      let selection = iframe.contentWindow?.getSelection();

      if (!focus && !selection?.isCollapsed && selection?.anchorNode) {
        let contentEdit = selection.anchorNode.parentElement;
        while (contentEdit && contentEdit?.contentEditable !== "true") {
          contentEdit = contentEdit.parentElement;
        }
        if (contentEdit) {
          event.preventDefault();
          contentEdit.focus();
        }
      }
    });

    editorDom.addEventListener("dragstart", (event) => {
      event.preventDefault();
    });

    editorDom.addEventListener("drop", (event) => {
      event.preventDefault();
    });

    if (afterCreate) {
      afterCreate(iframe.contentDocument, iframe.contentWindow);
    }
  };

  // firefox 下必须通过 load 才能正确加载
  if (navigator.userAgent.indexOf("Firefox") > -1) {
    iframe.addEventListener("load", loadIframe);
  } else {
    loadIframe();
  }

  return root;
};

export default createEditor;
