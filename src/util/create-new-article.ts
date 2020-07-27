import { getContainDocument } from "../operator-selection/util";
import createEmptyArticle from "./create-empty-article";
import { initRecord } from "../record/util";
import { initSelection } from "../operator-selection/get-selection";
import { createError } from "./handle-error";
import Article from "../components/article";

const createNewArticle = (article?: Article) => {
  let doc = getContainDocument();
  let editor = doc.getElementById("zebra-editor-contain");
  if (!editor) throw createError("文章节点获取失败", undefined, "create");
  editor.innerHTML = "";

  let newArticle = article || createEmptyArticle();
  newArticle.active = true;
  initRecord(newArticle);
  initSelection(newArticle);
  editor.appendChild(newArticle.render());
};

export default createNewArticle;
