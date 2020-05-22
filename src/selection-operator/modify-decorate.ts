import Paragraph from "../components/paragraph";
import getSelection from "./get-selection";
import updateComponent from "./update-component";
import { getComponentById } from "../components/util";
import focusAt from "./focus-at";

// 修改选区内内容的表现行为
const modifyDecorate = (name: string, value: string) => {
  let selection = getSelection();
  console.log(selection);
  
  if (selection.isCollapsed) {
    return;
  }
  let anchor = selection.range[0];
  let focus = selection.range[1];
  let article = getComponentById("article");
  let idList = article.getIdList(anchor.id, focus.id);
  if (idList.length === 0) return;
  if (idList.length === 1) {
    let start = selection.range[0].offset;
    let end = selection.range[1].offset;
    if (start > end) {
      [start, end] = [end, start];
    }
    let component = getComponentById(selection.range[0].id) as Paragraph;
    if (component) {
      component.changeCharDecorate(name, value, start, end - 1);
    }
    updateComponent(component);
    focusAt(selection.range[0], selection.range[1]);
    return;
  }
  let start = anchor;
  let end = focus;
  if (idList[0] === focus.id) {
    [start, end] = [end, start];
  }
  let firstComponent = getComponentById(idList[0]) as Paragraph;
  let lastComponent = getComponentById(idList[idList.length - 1]) as Paragraph;
  firstComponent.changeCharDecorate(
    name,
    value,
    start.offset,
    firstComponent.children.size
  );
  updateComponent(firstComponent);
  lastComponent.changeCharDecorate(name, value, 0, end.offset - 1);
  updateComponent(lastComponent);
  for (let i = 1; i < idList.length - 1; i++) {
    let component = getComponentById(idList[i]) as Paragraph;
    component.changeCharDecorate(name, value, 0, component.children.size);
    updateComponent(component);
  }
  focusAt(selection.range[0], selection.range[1]);
};

export default modifyDecorate;
