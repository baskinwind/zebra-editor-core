// 组件相关
import ComponentFactory, { getComponentFactory } from "./components";
import { getBlockById } from "./components/util";

// 内容生成器
import ContentBuilder from "./content/content-builder";
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
import mount from "./util/mount";
import createNewArticle from "./util/create-new-article";
import clearArticle from "./util/clear-article";
import getContentByBuilder from "./util/get-content-by-builder";
import getRawData from "./util/get-raw-data";
import createByRaw from "./util/create-by-raw";
import saveArticle from "./util/save-article";
import updateComponent from "./util/update-component";

// 文章历史相关
import { createRecord, undo, redo } from "./record/util";

// 一些快捷操作
export * from "./util/quick";

export {
  ComponentFactory,
  getComponentFactory,
  getBlockById,
  ContentBuilder,
  HtmlBuilder,
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
  mount,
  createNewArticle,
  clearArticle,
  getContentByBuilder,
  getRawData,
  createByRaw,
  saveArticle,
  updateComponent,
  createRecord,
  undo,
  redo
};
