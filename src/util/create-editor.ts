import BaseBuilder from "../content/base-builder";
import UserOperator from "../operator-user";
import BaseOperator from "../operator-user/base-operator";
import ComponentFactory, { getComponentFactory } from "../components";
import { initRecord, redo, undo } from "../record/util";
import { startUpdate } from "./update-component";
import {
  setContainDocument,
  setContainWindow
} from "../operator-selection/util";
import defaultStyle from "./default-style";
import { getBlockById } from "../components/util";
import { addErrorHandle } from "./handle-error";
import nextTicket from "./next-ticket";
import { initSelection } from "../operator-selection/get-selection";
import Article from "../components/article";
import StructureType from "../const/structure-type";

export interface IOption {
  placeholder?: string;
  userOperator?: BaseOperator;
  contentBuilder?: BaseBuilder;
  componentFactory?: ComponentFactory;
  onError?: (error: Error) => void;
  beforeCreate?: (document: Document, window: Window | null) => void;
  afterCreate?: (document: Document, window: Window | null) => void;
}

// 将组件挂载到某个节点上
const createEditor = (
  root: HTMLElement,
  article: Article,
  option?: IOption
) => {
  if (option?.onError) {
    addErrorHandle(option.onError);
  }
  article.active = true;
  startUpdate();
  initRecord(article);
  initSelection(article);
  let operator = option?.userOperator || UserOperator.getInstance();

  // 生成 iframe 并获取 document 与 window 对象
  root.innerHTML = "";
  let iframe = document.createElement("iframe");
  iframe.id = "iframe";
  iframe.width = "100%";
  iframe.height = "100%";
  iframe.frameBorder = "0";
  root.appendChild(iframe);

  const loadIframe = () => {
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
    editor.appendChild(article.render());
    iframe.contentDocument.body.appendChild(editor);
    iframe.contentDocument.body.dataset.focus = "false";

    let placeholder = iframe.contentDocument.createElement("div");
    placeholder.classList.add("zebra-editor-placeholder");
    placeholder.textContent = option?.placeholder || "开始你的故事 ... ";

    document.addEventListener("editorChange", (e) => {
      let article = getBlockById<Article>("article");
      if (!article) return;
      if (article.isEmpty() && article.getChild(0).decorate.isEmpty()) {
        placeholder.style.display = "block";
      } else {
        placeholder.style.display = "none";
      }
      let lastTyle = article.getChild(article.getSize() - 1).structureType;
      if (lastTyle !== StructureType.content) {
        article.add(getComponentFactory().buildParagraph());
      }
    });
    iframe.contentDocument.body.appendChild(placeholder);
    nextTicket(() => {
      document.dispatchEvent(new Event("editorChange"));
    });

    // 监听事件
    editor.addEventListener("blur", (event) => {
      try {
        operator.onBlur(event);
      } catch (e) {
        console.warn(e);
      }
    });

    editor.addEventListener("click", (event) => {
      try {
        operator.onClick(event);
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

    editor.addEventListener("cut", (event) => {
      try {
        operator.onCut(event);
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

    editor.addEventListener("beforeinput", (event: any) => {
      try {
        operator.onBeforeInput(event);
      } catch (e) {
        console.warn(e);
      }
    });

    editor.addEventListener("input", (event: any) => {
      try {
        operator.onInput(event);
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

    iframe.contentDocument.addEventListener("keydown", (event) => {
      try {
        let key = event.key.toLowerCase();
        if ("z" === key && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
          return;
        }
      } catch (e) {
        console.warn(e);
      }
    });

    editor.addEventListener("mousedown", (event) => {
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

    editor.addEventListener("dragstart", (event) => {
      event.preventDefault();
    });

    editor.addEventListener("drop", (event) => {
      event.preventDefault();
    });

    if (option && option.afterCreate) {
      option.afterCreate(iframe.contentDocument, iframe.contentWindow);
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
