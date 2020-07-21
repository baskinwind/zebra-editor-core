import "./operator";
import article from "./article";
import { mount, createByRaw } from "../src";

mount("root", article, {
  onError(err) {
    console.dir(err);
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
