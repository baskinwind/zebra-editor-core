import "./index.scss";
import article from "./article";
import ComponentFactory from "../src/components";
import modifySelectionDecorate from "../src/selection-operator/modify-selection-decorate";
import modifyDecorate from "../src/selection-operator/modify-decorate";

import { modifyTable, insertBlock, insertInline, exchange, getHtml, undo, redo, updateComponent } from "../src";

let factory = ComponentFactory.getInstance();

new Vue({
  el: "#operator",
  template: "#operator-template",
  data() {
    return {
      inlineStyle: "font-size",
      inlineStyleValue: "20px",
      blockStyle: "line-height",
      blockStyleValue: "2em",
      inlineImage: "./emjoy-1.png",
      image: "./draft-img-1.jpg",
      link: "http://acohome.com",
      tableRow: 3,
      tableCol: 3,
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
      updateComponent(article);
    },
    logHtml() {
      console.log(getHtml(article));
    },
    logRawData() {
      console.log(JSON.stringify(article.getRaw()));
    },

    modifyType(tag) {
      if (tag === "normal") {
        exchange('paragraph', tag);
      } else if (tag === "code") {
        exchange('code');
      } else if (tag === "ul" || tag === "ol") {
        exchange('list', tag);
      } else {
        exchange('title', tag);
      }
    },

    bold() {
      modifySelectionDecorate({ fontWeight: "bold" });
    },
    deleteType() {
      modifySelectionDecorate({ textDecoration: "line-through" });
    },
    itailc() {
      modifySelectionDecorate({ fontStyle: "italic" });
    },
    red() {
      modifySelectionDecorate({ color: "red" });
    },
    clearStyle() {
      modifySelectionDecorate({ remove: "all" });
    },
    customerInlineStyle() {
      if (this.inlineStyle && this.inlineStyleValue) {
        let key = this.toHump(this.inlineStyle);
        modifySelectionDecorate({ [key]: this.inlineStyleValue });
      }
    },
    addLink() {
      if (this.link) {
        modifySelectionDecorate({}, { link: this.link });
      }
    },
    unLink() {
      modifySelectionDecorate({}, { remove: "link" });
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
      insertBlock(factory.buildTable(3, 3));
    },
    modifyTable() {
      modifyTable({
        row: Number(this.tableRow),
        col: Number(this.tableCol),
        head: this.tableHead
      });
    },

    insertInlineImage() {
      let index = Math.floor(Math.random() * 3 + 1);
      insertInline(factory.buildInlineImage(`./emjoy-${index}.png`));
    },
    customerInlineImage() {
      insertInline(factory.buildInlineImage(this.inlineImage));
    },

    insertImage() {
      let index = Math.floor(Math.random() * 3 + 1);
      insertBlock(factory.buildMedia("image", `./draft-img-${index}.jpg`));
    },
    customerImage() {
      insertBlock(factory.buildMedia('image', this.image));
    }
  }
});
