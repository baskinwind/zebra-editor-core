import getSelection from "./get-selection";
import deleteSelection from "./delete-selection";
import { getComponentById } from "../components/util";
import Paragraph from "../components/paragraph";
import updateComponent from "./update-component";
import Media from "../components/media";
import focusAt from "./focus-at";

const insertBlock = (component: Media | Paragraph) => {
  deleteSelection();
  let selection = getSelection();
  console.log(selection);
  
  let nowComponent = getComponentById(selection.range[0].id);
  let index = nowComponent.parent?.findChildrenIndex(nowComponent);
  if (index === undefined) return;
  let start = selection.range[0].offset;
  if (start === 0) {
    nowComponent.parent?.addChildren(component, index);
    updateComponent([component]);
    focusAt({
      id: component.id,
      offset: 1,
    });
    return;
  }
  if (nowComponent instanceof Paragraph) {
    if (start === nowComponent.children.size) {
      nowComponent.parent?.addChildren(component, index + 1);
      updateComponent([component]);
      focusAt({
        id: component.id,
        offset: 1,
      });
      return;
    }
    let removedChildren = nowComponent.children
      .slice(start, nowComponent.children.size)
      .toArray();
    nowComponent.removeChildren(start, nowComponent.children.size - start);
    nowComponent.parent?.addChildren(component, index + 1);
    let newParagraph = new Paragraph();
    newParagraph.addChildren(removedChildren);
    nowComponent.parent?.addChildren(newParagraph, index + 2);
    updateComponent([nowComponent, newParagraph, component]);
    focusAt({
      id: component.id,
      offset: 1,
    });
  }
  if (nowComponent instanceof Media) {
    if (start === 1) {
      nowComponent.parent?.addChildren(component, index + 1);
      updateComponent([component]);
      focusAt({
        id: component.id,
        offset: 1,
      });
      return;
    }
  }
};

export default insertBlock;
