import { getComponentFactory } from "../components";

const createEmptyArticle = () => {
  let factory = getComponentFactory();
  let article = factory.buildArticle();
  article.add(factory.buildParagraph());
  return article;
};

export default createEmptyArticle;
