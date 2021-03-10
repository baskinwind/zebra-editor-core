// 组件相关
import ComponentFactory, { getDefaultComponentFactory } from "./components";

// 内容生成器
import ContentBuilder from "./content/content-builder";
import MarkdownBuilder from "./content/markdown-builder";
import HtmlBuilder from "./content/html-builder";

// 用户操作处理
import UserOperator from "./operator/user-operator";

// 选区相关操作
import focusAt from "./selection/focus-at";
import getSelection from "./selection/get-selection";
import insertBlock from "./selection/insert-block";
import insertInline from "./selection/insert-inline";
import modifyDecorate from "./selection/modify-decorate";
import modifySelectionDecorate from "./selection/modify-selection-decorate";
import modifyTable from "./selection/modify-table";
import modifyIndent from "./selection/modify-indent";
import exchange from "./selection/exchange";

// 操作内容
import updateComponent from "./util/update-component";

import nextTick from "./util/next-tick";

export {
  ComponentFactory,
  getDefaultComponentFactory,
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
  nextTick as nextTicket,
  updateComponent,
};
