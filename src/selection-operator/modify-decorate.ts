import Paragraph from "../components/pparagraph";
import getSelection from "./get-selection";
import { getComponentById } from "../components/util";

// 修改选区内内容的表现行为
const modifyDecorate = (name: string, value: string) => {
  let selection = getSelection();
  let start = selection.range[0].offset;
  let end = selection.range[1].offset;
  if (start > end) {
    [start, end] = [end, start];
  }
  if (start === end) {
    return;
  }
  let component = getComponentById(selection.range[0].componentId);

  if (component) {
    (component as Paragraph).changeCharDecorate(name, value, start, end - 1);
  }
};

export default modifyDecorate;
