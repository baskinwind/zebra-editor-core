import ComponentFactory from "../components";

let factory = ComponentFactory.getInstance();

const createEmptyArticle = () => {
  let article = factory.buildArticle();
  article.add(factory.buildParagraph());
  return article;
};

export default createEmptyArticle;
