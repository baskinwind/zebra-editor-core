import Media from "../components/media";
import Paragraph from "../components/paragraph";
import getSelection from "./get-selection";
import deleteSelection from "./delete-selection";
import focusAt from "./focus-at";
import { getComponentById } from "../components/util";

const insertBlock = (component: Media | Paragraph) => {
  deleteSelection();
  let selection = getSelection();
  let nowComponent = getComponentById(selection.range[0].id);
  let index = nowComponent.parent?.findChildrenIndex(nowComponent);
  if (index === undefined) return;
  let start = selection.range[0].offset;
  let focus = nowComponent.split(start, component);
  focusAt(focus);
  return;
};

export default insertBlock;
