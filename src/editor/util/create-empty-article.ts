import Editor from "../editor";

const createEmptyArticle = (editor: Editor) => {
  let article = editor.componentFactory.buildArticle();
  article.add(editor.componentFactory.buildParagraph());
  return article;
};

export default createEmptyArticle;
