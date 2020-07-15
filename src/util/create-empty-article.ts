import { getComponentFactory } from "../components";

let factory = getComponentFactory();

const createEmptyArticle = () => {
  let article = factory.buildArticle();
  article.add(factory.buildParagraph());
  return article;
};

export default createEmptyArticle;
