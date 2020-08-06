import { getContainDocument } from "../operator-selection/util";
import createEmptyArticle from "./create-empty-article";
import { initRecord } from "../record/util";
import { initSelection } from "../operator-selection/get-selection";
import { createError } from "./handle-error";
import Article from "../components/article";
import { startUpdate } from "./update-component";
import nextTicket from "./next-ticket";

const createNewArticle = (article?: Article) => {
  let doc = getContainDocument();
  let editor = doc.getElementById("zebra-editor-contain");
  if (!editor) throw createError("文章节点获取失败", undefined, "create");
  editor.innerHTML = "";

  let newArticle = article || createEmptyArticle();
  newArticle.active = true;
  editor.appendChild(newArticle.render());
  initRecord(newArticle);
  initSelection(newArticle);
  startUpdate();
  editor.focus();
  nextTicket(() => {
    document.dispatchEvent(new Event("editorchange"));
  });
};

export default createNewArticle;
