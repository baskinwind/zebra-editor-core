import Article from "../components/article";
import getSelection from "./get-selection";
import focusAt from "./focus-at";
import { getComponentById } from "../components/util";
import { storeData } from "../decorate";

// 修改选区内内容的表现行为
const modifySelectionDecorate = (style?: storeData, data?: storeData) => {
  let selection = getSelection();
  if (selection.isCollapsed) {
    return;
  }
  let start = selection.range[0];
  let end = selection.range[1];
  let article = getComponentById<Article>("article");
  let idList = article.getIdList(start.id, end.id)[2];

  if (idList.length === 0) return;
  if (idList.length === 1) {
    let component = getComponentById(idList[0]);
    component.modifyContentDecorate(start.offset, end.offset - 1, style, data);
    focusAt(selection.range[0], selection.range[1]);
    return;
  }

  let firstComponent = getComponentById(idList[0]);
  let lastComponent = getComponentById(idList[idList.length - 1]);
  firstComponent.modifyContentDecorate(start.offset, -1, style, data);
  lastComponent.modifyContentDecorate(0, end.offset - 1, style, data);
  for (let i = 1; i < idList.length - 1; i++) {
    let component = getComponentById(idList[i]);
    component.modifyContentDecorate(0, -1, style, data);
  }
  focusAt(selection.range[0], selection.range[1]);
};

export default modifySelectionDecorate;
