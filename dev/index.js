import "./index.styl";
import article from "./article";
import {
  ComponentFactory,
  ContentBuilder,
  HtmlBuilder,
  MarkdownBuilder,
  UserOperator,
  exchange,
  modifySelectionDecorate,
} from "../src";
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

new Vue({
  el: "#operator",
  template: "#operator-template",
  data() {
    return {
      inlineStyle: "font-size",
      inlineStyleValue: "20px",
      blockStyle: "line-height",
      blockStyleValue: "2em",
      inlineImage: "https://zebrastudio.tech/img/demo/emoji-1.png",
      image: "https://zebrastudio.tech/img/demo/img-1.jpg",
      link: "https://zebrastudio.tech",
      tableRow: 5,
      tableCol: 4,
      tableHead: true,
    };
  },
  methods: {
    toHump(text) {
      return text.replace(/\_(\w)/g, (all, letter) => letter.toUpperCase());
    },

    undo() {},
    redo() {},

    showArticle() {
      editor.articleManage.flush();
    },
    logHtml() {
      console.log(editor.article.render(new HtmlBuilder()));
    },
    logMD() {
      console.log(editor.article.render(new MarkdownBuilder()));
    },
    logRawData() {
      console.log(JSON.stringify(editor.article.getRaw()));
    },
    newArticle() {
      editor.articleManage.newArticle();
    },

    modifyType(tag) {
      if (tag === "normal") {
        exchange(editor, editor.componentFactory.typeMap.PARAGRAPH);
      } else if (tag === "code") {
        exchange(editor, editor.componentFactory.typeMap.CODE);
      } else if (tag === "ul" || tag === "ol" || tag === "nl") {
        exchange(editor, editor.componentFactory.typeMap.LIST, tag);
      } else {
        exchange(editor, editor.componentFactory.typeMap.HEADER, tag);
      }
    },

    bold() {
      modifySelectionDecorate(editor, {}, { bold: true });
    },
    deleteText() {
      modifySelectionDecorate(editor, {}, { deleteText: true });
    },
    italic() {
      modifySelectionDecorate(editor, {}, { italic: true });
    },
    underline() {
      modifySelectionDecorate(editor, {}, { underline: true });
    },
    code() {
      modifySelectionDecorate(editor, {}, { code: true });
    },
    clearStyle() {
      clearAll();
    },
    customerInlineStyle() {
      if (this.inlineStyle && this.inlineStyleValue) {
        let key = this.toHump(this.inlineStyle);
        modifySelectionDecorate({ [key]: this.inlineStyleValue });
      }
    },

    addLink() {
      if (this.link) {
        link(this.link);
      }
    },
    unLink() {
      unlink();
    },

    modifyStyle(name, value) {
      modifyDecorate({ [name]: value });
    },
    customerBlockStyle() {
      if (this.blockStyle && this.blockStyleValue) {
        let key = this.toHump(this.blockStyle);
        modifyDecorate({ [key]: this.blockStyleValue });
      }
    },

    addTable() {
      let table = factory.buildTable(3, 3);
      insertBlock(table);
      focusAt([table.getChild(0).getChild(0).getChild(0), 0, 0]);
    },
    modifyTable() {
      modifyTable({
        row: Number(this.tableRow),
        col: Number(this.tableCol),
        head: this.tableHead,
      });
    },

    indent() {
      modifyIndent();
    },
    outdent() {
      modifyIndent(true);
    },

    insertInlineImage() {
      let index = Math.floor(Math.random() * 3 + 1);
      insertInline(
        factory.buildInlineImage(
          `https://zebrastudio.tech/img/demo/emoji-${index}.png`,
        ),
      );
    },
    customerInlineImage() {
      insertInline(factory.buildInlineImage(this.inlineImage));
    },

    insertImage() {
      let index = Math.floor(Math.random() * 3 + 1);
      insertBlock(
        factory.buildMedia(
          "image",
          `https://zebrastudio.tech/img/demo/img-${index}.jpg`,
        ),
      );
    },
    customerImage() {
      insertBlock(factory.buildMedia("image", this.image));
    },
  },
});
