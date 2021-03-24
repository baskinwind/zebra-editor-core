import "./index.styl";
import article from "./article";
import {
  ComponentFactory,
  ContentBuilder,
  HtmlBuilder,
  MarkdownBuilder,
  StatisticBuilder,
  Operator,
  exchange,
  modifySelectionDecorate,
  modifyDecorate,
  insertBlock,
  insertInline,
  modifyTable,
  modifyIndent,
  focusAt,
} from "../src";
import Editor from "../src/editor";

const editor = new Editor("root", article, {
  componentFactory: ComponentFactory,
  operator: Operator,
  contentBuilder: ContentBuilder,
});

window.editor = editor;

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
    logStatistic() {
      console.log(editor.article.render(new StatisticBuilder()));
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
      } else if (tag === "codeBlock") {
        exchange(editor, editor.componentFactory.typeMap.CODEBLOCK);
      } else if (tag === "ul" || tag === "ol" || tag === "nl") {
        exchange(editor, editor.componentFactory.typeMap.LIST, tag);
      } else {
        exchange(editor, editor.componentFactory.typeMap.HEADER, tag);
      }
    },

    bold() {
      modifySelectionDecorate(editor, {}, { toggle: "bold" });
    },
    deleteText() {
      modifySelectionDecorate(editor, {}, { toggle: "deleteText" });
    },
    italic() {
      modifySelectionDecorate(editor, {}, { toggle: "italic" });
    },
    underline() {
      modifySelectionDecorate(editor, {}, { toggle: "underline" });
    },
    code() {
      modifySelectionDecorate(editor, {}, { toggle: "code" });
    },
    clearStyle() {
      modifySelectionDecorate(editor, { remove: "all" }, { remove: "all" });
    },
    customerInlineStyle() {
      if (this.inlineStyle && this.inlineStyleValue) {
        let key = this.toHump(this.inlineStyle);
        modifySelectionDecorate(editor, { [key]: this.inlineStyleValue });
      }
    },

    addLink() {
      if (this.link) {
        modifySelectionDecorate(editor, {}, { link: this.link });
      }
    },
    unLink() {
      modifySelectionDecorate(editor, {}, { remove: "link" });
    },

    modifyStyle(name, value) {
      modifyDecorate(editor, { [name]: value });
    },
    customerBlockStyle() {
      if (this.blockStyle && this.blockStyleValue) {
        let key = this.toHump(this.blockStyle);
        modifyDecorate(editor, { [key]: this.blockStyleValue });
      }
    },

    addTable() {
      let table = editor.componentFactory.buildTable(3, 3, []);
      insertBlock(editor, table);
      focusAt(editor.mountedWindow, [table.getChild(0).getChild(0).getChild(0), 0, 0]);
    },
    modifyTable() {
      modifyTable(editor, {
        row: Number(this.tableRow),
        col: Number(this.tableCol),
        head: this.tableHead,
      });
    },

    indent() {
      modifyIndent(editor);
    },
    outdent() {
      modifyIndent(editor, true);
    },

    insertInlineImage() {
      let index = Math.floor(Math.random() * 3 + 1);
      insertInline(
        editor,
        editor.componentFactory.buildInlineImage(
          `https://zebrastudio.tech/img/demo/emoji-${index}.png`,
        ),
      );
    },
    customerInlineImage() {
      insertInline(editor, editor.componentFactory.buildInlineImage(this.inlineImage));
    },

    insertImage() {
      let index = Math.floor(Math.random() * 3 + 1);
      insertBlock(
        editor,
        editor.componentFactory.buildMedia(
          "image",
          `https://zebrastudio.tech/img/demo/img-${index}.jpg`,
        ),
      );
    },
    customerImage() {
      insertBlock(editor, editor.componentFactory.buildMedia("image", this.image));
    },
  },
});
