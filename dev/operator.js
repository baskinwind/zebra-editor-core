import "./index.scss";
import article from "./article";

import {
  getComponentFactory,
  modifyTable,
  insertBlock,
  insertInline,
  exchange,
  getContentByBuilder,
  undo,
  redo,
  updateComponent,
  modifySelectionDecorate,
  modifyDecorate,
  bold,
  deleteText,
  itailc,
  underline,
  code,
  clearAll,
  link,
  unlink,
  modifyIndent,
  focusAt,
  createNewArticle
} from "../src";

let factory = getComponentFactory();

new Vue({
  el: "#operator",
  template: "#operator-template",
  data() {
    return {
      inlineStyle: "font-size",
      inlineStyleValue: "20px",
      blockStyle: "line-height",
      blockStyleValue: "2em",
      inlineImage: "http://cdn.acohome.cn/emoji-1.png",
      image: "http://cdn.acohome.cn/demo-img-1.jpg",
      link: "http://acohome.cn",
      tableRow: 5,
      tableCol: 4,
      tableHead: true
    };
  },
  methods: {
    toHump(text) {
      return text.replace(/\_(\w)/g, (all, letter) => letter.toUpperCase());
    },

    undo() {
      undo();
    },
    redo() {
      redo();
    },

    showArticle() {
      updateComponent(article, false);
    },
    logHtml() {
      console.log(getContentByBuilder(article));
    },
    logRawData() {
      console.log(JSON.stringify(article.getRaw()));
    },
    newArticle() {
      createNewArticle();
    },

    modifyType(tag) {
      if (tag === "normal") {
        exchange(factory.typeMap.PARAGRAPH);
      } else if (tag === "code") {
        exchange(factory.typeMap.CODE);
      } else if (tag === "ul" || tag === "ol" || tag === "nl") {
        exchange(factory.typeMap.LIST, tag);
      } else {
        exchange(factory.typeMap.HEADER, tag);
      }
    },

    bold() {
      bold();
    },
    deleteText() {
      deleteText();
    },
    itailc() {
      itailc();
    },
    underline() {
      underline();
    },
    code() {
      code();
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
        head: this.tableHead
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
        factory.buildInlineImage(`http://cdn.acohome.cn/emoji-${index}.png`)
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
          `http://cdn.acohome.cn/demo-img-${index}.jpg`
        )
      );
    },
    customerImage() {
      insertBlock(factory.buildMedia("image", this.image));
    }
  }
});
