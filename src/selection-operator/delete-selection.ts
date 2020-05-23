import getSelection from "./get-selection";
import { getComponentById } from "../components/util";
import Paragraph from "../components/paragraph";
import updateComponent from "./update-component";
import focusAt from "./focus-at";
import Article from "../components/article";
import Collection from "../components/collection";
import Character from "../components/character";

const deleteSelection = (event?: KeyboardEvent) => {
  let selection = getSelection();
  let key = event?.key;
  let isEnter = key === "Enter";
  let isBackspace = key === "Backspace";
  if (selection.isCollapsed && !(isEnter || isBackspace)) return;
  if (selection.isCollapsed && isBackspace) {
    let component = getComponentById(selection.range[0].id);
    if (component instanceof Paragraph) {
      component.removeChildren(selection.range[0].offset - 1);
      updateComponent(component);
      focusAt({
        id: component.id,
        offset: selection.range[0].offset - 1,
      });
    } else {
      let newParagraph = new Paragraph();
      component.replaceSelf(newParagraph);
      updateComponent([component, newParagraph]);
      focusAt({
        id: newParagraph.id,
        offset: 0,
      });
    }
    return;
  }
  let start = selection.range[0];
  let end = selection.range[1];
  let article = getComponentById<Article>("article");
  let idList = article.getIdList(start.id, end.id);
  if (idList.length === 0) return;
  if (idList.length === 1) {
    let id = idList[0];
    let component = getComponentById(id);
    if (component instanceof Paragraph) {
      if (!component.parent) return;
      if (isEnter) {
        let content = component.children.slice(end.offset).toArray();
        let decorate = component.decorateList.slice(end.offset).toArray();
        let index = component.parent.findChildrenIndex(component);
        let newParagraph = new Paragraph();
        newParagraph.addChildren(content, 0, decorate);
        component.parent.addChildren(newParagraph, index + 1);
        component.removeChildren(start.offset, component.children.size);
        updateComponent([component, newParagraph]);
        focusAt({
          id: newParagraph.id,
          offset: 0,
        });
      } else {
        component.removeChildren(
          start.offset,
          end.offset - start.offset
        );
        updateComponent(component);
        focusAt({
          id: component.id,
          offset: start.offset,
        });
      }
    } else {
      let newParagraph = new Paragraph();
      component.replaceSelf(newParagraph);
      updateComponent([component, newParagraph]);
      focusAt({
        id: newParagraph.id,
        offset: 0,
      });
    }
    return;
  }

  let firstComponent = getComponentById(idList[0]);
  let lastComponent = getComponentById(idList[idList.length - 1]);
  if (!firstComponent.parent || !lastComponent.parent) return;
  let firstIndex = firstComponent.parent.findChildrenIndex(firstComponent);
  if (firstComponent instanceof Paragraph) {
    firstComponent.removeChildren(start.offset, firstComponent.children.size - 1);
  } else {
    firstComponent.removeSelf();
  }
  if (lastComponent instanceof Paragraph) {
    lastComponent.removeChildren(0, end.offset);
  } else {
    lastComponent.removeSelf();
  }
  if (isEnter) {
    article.removeChildren(getComponentById(idList[1]), idList.length - 2);
    updateComponent(idList.map(id => getComponentById(id)));
    focusAt({
      id: lastComponent.id,
      offset: 0,
    });
  } else {
    if (firstComponent instanceof Paragraph && lastComponent instanceof Paragraph) {
      let lastContent = lastComponent.children.slice(0).toArray();
      let lastDecorate = lastComponent.decorateList.slice(0).toArray();
      firstComponent.addChildren(lastContent, undefined, lastDecorate);
      article.removeChildren(getComponentById(idList[1]), idList.length - 1);
      updateComponent(idList.map(id => getComponentById(id)));
      focusAt({
        id: firstComponent.id,
        offset: start.offset,
      });
    } else {
      article.removeChildren(getComponentById(idList[1]), idList.length - 2);
      let updateList = idList.map(id => getComponentById(id));
      if (!firstComponent.actived && !lastComponent.actived) {
        let newParagraph = new Paragraph();
        updateList.push(newParagraph);
        article.addChildren(newParagraph, firstIndex);
      }
      updateComponent(updateList);
      if (firstComponent.actived) {
        focusAt({
          id: firstComponent.id,
          offset: start.offset,
        });
      } else if (lastComponent.actived) {
        focusAt({
          id: lastComponent.id,
          offset: 0,
        });
      } else {
        focusAt({
          id: updateList[updateList.length - 1].id,
          offset: 0,
        })
      }
    }
  }
};

export default deleteSelection;
