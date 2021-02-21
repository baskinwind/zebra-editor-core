// 组件相关
import ComponentFactory, { getComponentFactory } from "./components";

// 内容生成器
import ContentBuilder from "./content/content-builder";
import MarkdownBuilder from "./content/markdown-builder";
import HtmlBuilder from "./content/html-builder";

// 用户操作处理
import UserOperator from "./operator-user";

// 选区相关操作
import focusAt from "./operator-selection/focus-at";
import getSelection from "./operator-selection/get-selection";
import insertBlock from "./operator-selection/insert-block";
import insertInline from "./operator-selection/insert-inline";
import modifyDecorate from "./operator-selection/modify-decorate";
import modifySelectionDecorate from "./operator-selection/modify-selection-decorate";
import modifyTable from "./operator-selection/modify-table";
import modifyIndent from "./operator-selection/modify-indent";
import exchange from "./operator-selection/exchange";

// 操作内容
import createNewArticle from "./editor/util/create-new-article";
import clearArticle from "./editor/util/clear-article";
import getRawData from "./util/get-raw-data";
import createByRaw from "./editor/util/create-by-raw";
import saveArticle from "./editor/util/save-article";
import updateComponent from "./util/update-component";

import nextTicket from "./util/next-ticket";

// 一些快捷操作
export * from "./util/quick";

export {
  ComponentFactory,
  getComponentFactory,
  ContentBuilder,
  HtmlBuilder,
  MarkdownBuilder,
  UserOperator,
  focusAt,
  getSelection,
  insertBlock,
  insertInline,
  modifyDecorate,
  modifySelectionDecorate,
  modifyTable,
  modifyIndent,
  exchange,
  createNewArticle,
  clearArticle,
  getRawData,
  createByRaw,
  saveArticle,
  nextTicket,
  updateComponent,
};
