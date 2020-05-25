import Article from "../components/article";
import Paragraph from "../components/paragraph";

export default function createEmptyArticle() {
  let article = new Article();
  article.addChildren(new Paragraph());
  return article;
}
