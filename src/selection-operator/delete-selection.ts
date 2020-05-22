import getSelection from "./get-selection";
import { getComponentById } from "../components/util";
import Paragraph from "../components/paragraph";
import ComponentType from "../const/component-type";
import updateComponent from "./update-component";
import focusAt from "./focus-at";

const deleteSelection = (event?: KeyboardEvent) => {
  let selection = getSelection();
  let key = event?.key;
  let isEnter = key === "Enter";
  if (selection.isCollapsed && key === "Backspace") {
    let component = getComponentById(selection.range[0].id);
    component.removeChildren(selection.range[0].offset - 1);
    updateComponent(component);
    focusAt({
      id: component.id,
      offset: selection.range[0].offset - 1,
    });
    return;
  }
  let start = selection.range[0];
  let end = selection.range[1];
  let article = getComponentById("article");
  let idList = article.getIdList(start.id, end.id);
  if (idList.length === 0) return;
  if (idList.length === 1) {
    let id = idList[0];
    let component = getComponentById(id) as Paragraph;
    if (isEnter) {
      let content = component.children.slice(end.offset).toArray();
      let decorate = component.decorateList.slice(end.offset).toArray();
      let index = component.parent?.findChildrenIndex(component) as number;
      let newParagraph = new Paragraph();
      newParagraph.addChildren(content, 0, decorate);
      component.parent?.addChildren(newParagraph, index + 1);
      component.removeChildren(start.offset, component.children.size);
      updateComponent(component);
      focusAt({
        id: newParagraph.id,
        offset: 0,
      });
    } else {
      let info = component.removeChildren(
        start.offset,
        end.offset - start.offset
      );
      if (
        info.target.length === 1 &&
        info.target[0].type === ComponentType.inlineImage
      ) {
        updateComponent(component);
      }
      console.log(info);
    }
    return;
  }

  let lastComponent = getComponentById(idList[idList.length - 1]) as Paragraph;
  let firstComponent = getComponentById(idList[0]) as Paragraph;
  firstComponent.removeChildren(start.offset, firstComponent.children.size - 1);
  if (isEnter) {
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
