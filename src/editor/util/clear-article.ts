import Editor from "../editor";
import saveArticle from "./save-article";
import { createError } from "../../util/handle-error";

const clearArticle = (editor: Editor, saveArticleToLocal: boolean = true) => {
  let editorDom = editor.mountedDocument.getElementById("zebra-editor-contain");
  if (!editorDom) throw createError("文章节点获取失败", undefined, "create");
  editorDom.innerHTML = "";
  editor.article.active = false;
  if (saveArticleToLocal) {
    saveArticle(editor.article);
  }
};

export default clearArticle;
