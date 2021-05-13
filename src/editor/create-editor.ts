import Editor from ".";
import editorStyle from "../util/editor-style";
import nextTick from "../util/next-tick";
import Article from "../components/article";
import StructureType from "../const/structure-type";
import getSelection from "../selection/get-selection";
import deleteSelection from "../operator/delete-selection";
import { getUtf8TextLengthFromJsOffset } from "../util/text-util";

// 将组件挂载到某个节点上
const createEditor = (
  root: HTMLElement,
  editor: Editor,
  beforeCreate?: (document: Document, window: Window) => void,
  afterCreate?: (document: Document, window: Window) => void,
) => {
  let operator = editor.userOperator;

  // 生成 iframe 并获取 document 与 window 对象
  root.innerHTML = "";
  let iframe = document.createElement("iframe");
  iframe.width = "100%";
  iframe.height = "100%";
  iframe.style.border = "none";
  root.appendChild(iframe);

  const loadIframe = () => {
    if (!iframe.contentWindow || !iframe.contentDocument) {
      return;
    }

    let style = iframe.contentDocument.createElement("style");
    style.textContent = editorStyle;
    iframe.contentDocument.head.appendChild(style);

    if (beforeCreate) {
      beforeCreate(iframe.contentDocument, iframe.contentWindow);
    }

    // 生成容器
    let editorDom = iframe.contentDocument.createElement("div");
    editorDom.id = "zebra-editor-contain";
    editorDom.contentEditable = "true";
    iframe.contentDocument.body.appendChild(editorDom);

    // placeholder
    if (editor.placeholder) {
      const placeholderStyle = iframe.contentDocument.createElement("style");
      placeholderStyle.textContent = `.zebra-editor-article > :first-child.zebra-editor-empty::before {content:'${editor.placeholder}';}`;
      iframe.contentDocument.head.appendChild(placeholderStyle);
    }

    document.addEventListener("editorChange", (e) => {
      let article = editor.article;
      if (!article) return;
      let size = article.getSize();
      if (size === 0) {
        article.add(0, editor.componentFactory.buildParagraph());
      } else {
        let lastTyle = article.getChild(size - 1).structureType;
        if (lastTyle !== StructureType.content) {
          article.add(-1, editor.componentFactory.buildParagraph());
        }
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

    editorDom.addEventListener("cut", (event) => {
      try {
        operator.onCut(event);
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

    editorDom.addEventListener("compositionstart", (event) => {
      let selection = getSelection(editor);
      if (!selection.isCollapsed) {
        deleteSelection(editor, selection.range[0], selection.range[1]);
      }
    });

    editorDom.addEventListener("compositionend", (event) => {
      try {
        let selection = getSelection(editor);
        let start = {
          id: selection.range[0].id,
          offset: selection.range[0].offset - getUtf8TextLengthFromJsOffset(event.data),
        };

        operator.onInput(event.data, start, event);
      } catch (e) {
        console.warn(e);
      }
    });

    editorDom.addEventListener("beforeinput", (event: any) => {
      try {
        // 排除已经处理的输入
        if (
          event.inputType === "insertCompositionText" ||
          event.inputType === "deleteContentBackward" ||
          !event.data
        ) {
          return;
        }

        let selection = getSelection(editor);
        if (!selection.isCollapsed) {
          deleteSelection(editor, selection.range[0], selection.range[1]);
        }
      } catch (e) {
        console.warn(e);
      }
    });

    editorDom.addEventListener("input", (event: any) => {
      try {
        // 排除已经处理的输入
        if (
          event.inputType === "insertCompositionText" ||
          event.inputType === "deleteContentBackward" ||
          !event.data
        ) {
          return;
        }

        let selection = getSelection(editor);
        let start = {
          id: selection.range[0].id,
          offset: selection.range[0].offset - getUtf8TextLengthFromJsOffset(event.data),
        };

        operator.onInput(event.data, start, event);
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

    // 如果先前有选区控制选中
    editorDom.addEventListener("mousedown", (event) => {
      let focus = iframe.contentDocument?.hasFocus();
      let selection = iframe.contentWindow?.getSelection();

      if (!focus && !selection?.isCollapsed && selection?.anchorNode) {
        let editedDom = selection.anchorNode.parentElement;
        while (editedDom && editedDom?.contentEditable !== "true") {
          editedDom = editedDom.parentElement;
        }
        if (editedDom) {
          event.preventDefault();
          editedDom.focus();
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

  iframe.addEventListener("load", loadIframe);
  return root;
};

export default createEditor;
