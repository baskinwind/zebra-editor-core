import Article from "../components/article";
import Paragraph from "../components/paragraph";

const createEmptyArticle = () => {
  let article = new Article();
  article.addChildren(new Paragraph());
  return article;
};

export default createEmptyArticle;
