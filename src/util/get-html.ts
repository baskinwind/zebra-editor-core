import Article from "../components/article";
import { changeContentBuiler } from "../content";
import HtmlBuilder from "../content/html-builder";

// 生成 HTML
const getHtml = (article: Article) => {
  changeContentBuiler(HtmlBuilder.getInstance());
  return article.render();
};

export default getHtml;
