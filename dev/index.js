import "./operator";
import article from "./article";
import { mount } from "../src";

mount("root", article, {
  beforeCreate(doc) {
    let defaultArticleTheme = doc.createElement("link");
    defaultArticleTheme.href =
      "https://zebrastudio.tech/article-theme/default.css";
    defaultArticleTheme.rel = "stylesheet";
    defaultArticleTheme.type = "text/css";
    doc.head.appendChild(defaultArticleTheme);
  }
});
