import { getContainDocument } from "../operator-selection/util";
import { getBlockById, clearBlock } from "../components/util";
import { createError } from "./handle-error";
import Article from "../components/article";
import saveArticle from "./save-article";
import { stopUpdate } from "./update-component";

const clearArticle = () => {
  let doc = getContainDocument();
  let editor = doc.getElementById("zebra-editor-contain");
  if (!editor) throw createError("文章节点获取失败", undefined, "create");
  editor.innerHTML = "";
  let beforeArticle = getBlockById<Article>("article");
  beforeArticle.active = false;
  saveArticle(beforeArticle);
  clearBlock();
  stopUpdate();
};

export default clearArticle;
