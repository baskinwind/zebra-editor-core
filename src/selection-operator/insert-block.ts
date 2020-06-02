import Component from "../components/component";
import getSelection from "./get-selection";
import deleteSelection from "./delete-selection";
import focusAt from "./focus-at";
import { getComponentById } from "../components/util";

const insertBlock = (component: Component | Component[]) => {
  deleteSelection();
  let selection = getSelection();
  let nowComponent = getComponentById(selection.range[0].id);
  let index = nowComponent.parent?.findChildrenIndex(nowComponent);
  if (index === undefined) return;
  let start = selection.range[0].offset;
  return focusAt(nowComponent.split(start, component));
};

export default insertBlock;
