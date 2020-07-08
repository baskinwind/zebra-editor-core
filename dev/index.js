import "./operator";
import article from "./article";
import { mount, createByRaw, getBlockById, getSelectionInfo } from "../src";

mount("root", article);

window.article = article;

window.getBlockById = getBlockById;

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

window.flush = () => {
  let raw = article.getRaw();
  let articleRaw = createByRaw(raw);
  mount("root", articleRaw);
};

window.getSelectionInfo = getSelectionInfo;
