import Article from "../components/article";
import createEmptyArticle from "./create-empty-article";
import createDraft from "./create-draft";

const mount = (idOrDom: string | HTMLElement, article?: Article) => {
  if (!article) article = createEmptyArticle();
  let root;
  if (typeof idOrDom === "string") {
    root = document.getElementById(idOrDom);
  } else {
    root = idOrDom;
  }
  if (!root) throw Error("请传入正确的节点或节点 id");
  return createDraft(root, article);
};

export default mount;
