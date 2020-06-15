import Article from "../components/article";
import createDraft, { IOption } from "./create-draft";
import createEmptyArticle from "./create-empty-article";

// 将组件挂载到某个节点上
const mount = (
  idOrDom: string | HTMLElement,
  article?: Article,
  option?: IOption
) => {
  if (!article) article = createEmptyArticle();
  let root;
  if (typeof idOrDom === "string") {
    root = document.getElementById(idOrDom);
  } else {
    root = idOrDom;
  }
  if (!root) throw Error("请传入正确的节点或节点 id");
  return createDraft(root, article, option);
};

export default mount;
