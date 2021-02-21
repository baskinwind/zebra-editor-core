import Editor from "../editor";
import Article from "../../components/article";
import createEmptyArticle from "./create-empty-article";
import nextTicket from "../../util/next-ticket";
import { createError } from "../../util/handle-error";

const createNewArticle = (editor: Editor, article?: Article) => {
  let editorDom = editor.mountedDocument.getElementById("zebra-editor-contain");
  if (!editorDom) throw createError("文章节点获取失败", undefined, "create");
  editorDom.innerHTML = "";

  let newArticle = article || createEmptyArticle(editor);
  newArticle.active = true;
  editorDom.appendChild(newArticle.render(editor.contentBuilder));
  editorDom.focus();
  nextTicket(() => {
    document.dispatchEvent(new Event("editorChange"));
  });
};

export default createNewArticle;
