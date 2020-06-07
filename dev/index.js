import "../src/default.scss";
import "./operator";
import article from "./article";
import mount from "../src/util/mount";

mount("root", article);

window.article = article;

window.getRaw = () => {
  return article.getRaw();
};

window.clearArticle = () => {
  let dom = document.getElementById("root");
  dom.innerHTML = "";
};

window.createByRaw = (raw) => {
  let article = createByRaw(raw);
  mount("root", article);
};
