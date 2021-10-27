import ComponentFactory from "./factory";

import DomView from "./view/dom-view";
import HtmlView from "./view/html-view";

import Operator from "./operator";

import focusAt from "./selection/focus-at";
import getSelection from "./selection/get-selection";
import getSelectedIdList from "./selection/get-selected-id-list";
import insertBlock from "./selection/insert-block";
import insertInline from "./selection/insert-inline";
import modifyDecorate from "./selection/modify-decorate";
import modifySelectionDecorate from "./selection/modify-selection-decorate";
import modifyTable from "./selection/modify-table";
import modifyIndent from "./selection/modify-indent";
import exchange from "./selection/exchange";

import updateComponent from "./util/update-component";
import { nextTick } from "./util";

import Editor from "./editor";
import StructureType from "./const/structure-type";
import { Cursor } from "./selection/util";
import deleteSelection from "./operator/delete-selection";

export * from "./components";

export {
  Editor,
  ComponentFactory,
  DomView,
  HtmlView,
  Operator,
  StructureType,
  Cursor,
  focusAt,
  getSelection,
  deleteSelection,
  getSelectedIdList,
  insertBlock,
  insertInline,
  modifyDecorate,
  modifySelectionDecorate,
  modifyTable,
  modifyIndent,
  exchange,
  nextTick,
  updateComponent,
};
