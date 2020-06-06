import "./index.scss";
import article from "./index";

import InlineImage from "../src/components/inline-image";
import Media from "../src/components/media";
import Title from "../src/components/title";
import Paragraph from "../src/components/paragraph";
import { ListItem } from "../src/components/list";
import Table from "../src/components/table";
import updateComponent from "../src/selection-operator/update-component";

import ComponentType from "../src/const/component-type";

import modifySelectionDecorate from "../src/selection-operator/modify-selection-decorate";
import insertInline from "../src/selection-operator/insert-inline";
import insertBlock from "../src/selection-operator/insert-block";
import exchangeParagraph from "../src/selection-operator/exchange-paragraph";
import modifyComponentDecorate from "../src/selection-operator/modify-component-decorate";
import modifyTable from "../src/selection-operator/modify-table";
import getHtml from "../src/util/get-html";

new Vue({
  el: "#operator",
  template: "#operator-template",
  data() {
    return {
      inlineStyle: "fontSize",
      inlineStyleValue: "20px",
      blockStyle: "lineHeight",
      blockStyleValue: "2em",
      inlineImage: "",
      image: "",
      tableRow: 3,
      tableCol: 3,
      tableHead: true
    };
  },
  methods: {
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
        exchangeParagraph(Paragraph, tag);
      } else if (tag === "ul" || tag === "ol") {
        exchangeParagraph(ListItem, tag);
      } else {
        exchangeParagraph(Title, tag);
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
      modifySelectionDecorate({ clear: "style" });
    },
    customerInlineStyle() {
      if (this.inlineStyle && this.inlineStyleValue) {
        modifySelectionDecorate({ [this.inlineStyle]: this.inlineStyleValue });
      }
    },

    modifyStyle(name, value) {
      modifyComponentDecorate({ [name]: value });
    },
    customerBlockStyle() {
      if (this.blockStyle && this.blockStyleValue) {
        modifyComponentDecorate({ [this.blockStyle]: this.blockStyleValue });
      }
    },

    addTable() {
      insertBlock(new Table(3, 3));
    },
    modifyTable() {
      modifyTable({
        row: this.tableRow,
        col: this.tableCol,
        head: this.tableHead
      });
    },

    insertInlineImage() {
      let index = Math.floor(Math.random() * 56 + 1);
      insertInline(
        new InlineImage(
          `http://cdn.acohome.cn/${index}.png?imageMogr2/auto-orient/thumbnail/x20`
        )
      );
    },
    customerInlineImage() {
      insertInline(new InlineImage(this.inlineImage));
    },

    insertImage() {
      let index = Math.floor(Math.random() * 3 + 1);
      insertBlock(
        new Media(
          'image',
          `https://blogcdn.acohome.cn/demo-draft-${index}.jpg`
        )
      );
    },
    customerImage() {
      insertBlock(new Media(ComponentType.image, this.image));
    }
  }
});
