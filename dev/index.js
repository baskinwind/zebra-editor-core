import "./operator";
import article from "./article";
import { mount, createByRaw } from "../src";

mount("root", article, {
  beforeCreate(doc) {
    let defaultArticleTheme = doc.createElement("link");
    defaultArticleTheme.href = "https://zebrastudio.tech/article-theme/default.css";
    defaultArticleTheme.rel = "stylesheet";
    defaultArticleTheme.type = "text/css";
    doc.head.appendChild(defaultArticleTheme);
  }
});

window.article = article;

window.getRaw = () => {
  return article.getRaw();
};

window.clearArticle = () => {
  let dom = document.getElementById("root");
  dom.innerHTML = "";
};

window.createByRawData = (raw) => {
  let article = createByRaw(raw);
  mount("root", article);
};

window.getStatistic = () => {
  return article.getStatistic();
};
