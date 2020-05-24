import Article from "../components/article";
import Paragraph from "../components/paragraph";

export default function createEnptyArticle() {
  let article = new Article();
  article.addChildren(new Paragraph());
  return article;
}
