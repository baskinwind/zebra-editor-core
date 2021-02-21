import "./operator";
import article from "./article";
import { ComponentFactory, ContentBuilder, mount, UserOperator } from "../src";
import Editor from "../src/editor/editor";

const editor = new Editor("root", article, {
  componentFactory: ComponentFactory,
  userOperator: UserOperator,
  contentBuilder: ContentBuilder,
  beforeCreate(doc) {
    let defaultArticleTheme = doc.createElement("link");
    defaultArticleTheme.href =
      "https://zebrastudio.tech/theme/article/default.css";
    defaultArticleTheme.rel = "stylesheet";
    defaultArticleTheme.type = "text/css";
    doc.head.appendChild(defaultArticleTheme);
  },
});

console.log(editor);

// mount("root", article, {
//   beforeCreate(doc) {
//     let defaultArticleTheme = doc.createElement("link");
//     defaultArticleTheme.href =
//       "https://zebrastudio.tech/theme/article/default.css";
//     defaultArticleTheme.rel = "stylesheet";
//     defaultArticleTheme.type = "text/css";
//     doc.head.appendChild(defaultArticleTheme);
//   },
// });
