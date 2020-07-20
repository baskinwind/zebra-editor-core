import { getContainDocument } from "../operator-selection/util";
import createEmptyArticle from "./create-empty-article";
import { clearBlock, getBlockById } from "../components/util";
import { initRecord } from "../record/util";
import { initSelection } from "../operator-selection/get-selection";
import { createError } from "./handle-error";

const createNewArticle = () => {
  let doc = getContainDocument();
  let editor = doc.getElementById("zebra-editor-contain");
  if (!editor) throw createError("文章节点获取失败", undefined, "create");
  editor.innerHTML = "";
  let beforeArticle = getBlockById("article");
  localStorage.setItem(
    "zebra-editor-article-" + beforeArticle.id,
    JSON.stringify(beforeArticle.getRaw())
  );
  clearBlock();

  let saveArticleList =
    localStorage.getItem("zebra-editor-article-list")?.split("|") || [];
  saveArticleList.push(beforeArticle.id);
  // 最多存储 30 篇文章
  if (saveArticleList.length > 30) {
    localStorage.removeItem("zebra-editor-article-" + saveArticleList[0]);
    saveArticleList.shift();
  }
  localStorage.setItem("zebra-editor-article-list", saveArticleList.join("|"));

  let newArticle = createEmptyArticle();
  initRecord(newArticle);
  initSelection(newArticle);
  editor.appendChild(newArticle.render());
};

export default createNewArticle;
