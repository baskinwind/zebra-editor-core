import "../src/index.scss";
import "./operator";
import article from "./article";
import { mount, createByRaw, getBlockById } from "../src";

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
