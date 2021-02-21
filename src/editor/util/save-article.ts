import { throttle } from "lodash";
import Article from "../../components/article";

const saveArticle = throttle((article: Article) => {
  // 空文章不做存储，示例文章不做存储
  if (article.isEmpty() || /^demo/.test(article.id)) return;
  localStorage.setItem(
    "zebra-editor-article-" + article.id,
    JSON.stringify(article.getRaw()),
  );
  let saveArticleList =
    localStorage.getItem("zebra-editor-article-list")?.split("|") || [];
  // 最多存储 30 篇文章
  if (saveArticleList.length > 30) {
    localStorage.removeItem("zebra-editor-article-" + saveArticleList[0]);
    saveArticleList.shift();
  }
  if (!saveArticleList.includes(article.id)) {
    saveArticleList.push(article.id);
  }
  localStorage.setItem("zebra-editor-article-list", saveArticleList.join("|"));
}, 100);

export default saveArticle;
