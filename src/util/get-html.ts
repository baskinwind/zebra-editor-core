import Article from "../components/article";
import { changeContentBuiler } from "../builder";
import htmlBuilder from "../builder/html-builder";

// 生成 HTML
const getHtml = (article: Article) => {
  changeContentBuiler(htmlBuilder);
  return article.render();
};

export default getHtml;
