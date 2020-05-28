import Paragraph from "../components/paragraph";
import getSelection from "./get-selection";
import updateComponent from "./update-component";
import { getComponentById } from "../components/util";
import focusAt from "./focus-at";
import Article from "../components/article";

// 修改选区内内容的表现行为
const modifySelectionDecorate = (name: string, value: string) => {
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
    if (component instanceof Paragraph) {
      if (component) {
        component.changeCharDecorate(name, value, start.offset, end.offset - 1);
      }
      updateComponent(component);
      focusAt(selection.range[0], selection.range[1]);
    }
    return;
  }
  let firstComponent = getComponentById(idList[0]);
  let lastComponent = getComponentById(idList[idList.length - 1]);
  if (firstComponent instanceof Paragraph) {
    firstComponent.changeCharDecorate(
      name,
      value,
      start.offset,
      firstComponent.children.size
    );
  }
  if (lastComponent instanceof Paragraph) {
    lastComponent.changeCharDecorate(name, value, 0, end.offset - 1);
  }
  for (let i = 1; i < idList.length - 1; i++) {
    let component = getComponentById(idList[i]);
    if (component instanceof Paragraph) {
      component.changeCharDecorate(name, value, 0, component.children.size);
    }
  }
  updateComponent(idList.map((id) => getComponentById(id)));
  focusAt(selection.range[0], selection.range[1]);
};

export default modifySelectionDecorate;
