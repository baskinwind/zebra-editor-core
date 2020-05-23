import getSelection from "./get-selection";
import { getComponentById } from "../components/util";
import Paragraph from "../components/paragraph";

const deleteSelection = (lineBreak: boolean = false) => {
  let selection = getSelection();
  if (selection.isCollapsed) {
    let anchor = selection.range[0];
    if(anchor)
    return;
  }
  let anchor = selection.range[0];
  let focus = selection.range[1];
  let article = getComponentById("article");
  let idList = article.getIdList(anchor.componentId, focus.componentId);
  if (idList.length === 0) return;
  if (idList.length === 1) {
    let id = idList[0];
    let component = getComponentById(id);
    console.log(anchor, focus);
    component.removeChildren(
      Math.min(anchor.offset, focus.offset),
      Math.abs(anchor.offset - focus.offset)
    );
    return;
  }
  let start = anchor;
  let end = focus;
  if (idList[0] === focus.componentId) {
    [start, end] = [end, start];
  }
  let lastComponent = getComponentById(idList[idList.length - 1]) as Paragraph;
  let firstComponent = getComponentById(idList[0]) as Paragraph;
  firstComponent.removeChildren(start.offset, firstComponent.children.size - 1);
  if (lineBreak) {
    lastComponent.removeChildren(0, end.offset);
    article.removeChildren(getComponentById(idList[1]), idList.length - 2);
  } else {
    let lastContent = lastComponent.children.slice(end.offset).toArray();
    let lastDecorate = lastComponent.decorateList.slice(end.offset).toArray();
    firstComponent.addChildren(lastContent, undefined, lastDecorate);
    article.removeChildren(getComponentById(idList[1]), idList.length - 1);
  }
};

export default deleteSelection;
