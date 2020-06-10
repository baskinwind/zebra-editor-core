import "../src/default.scss";
import "./operator";
import article from "./article";
import mount from "../src/util/mount";
import createByRaw from "../src/util/create-by-raw";
import { getComponentById } from "../src/components/util";

mount("root", article);

window.article = article;

window.getComponentById = getComponentById;

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
