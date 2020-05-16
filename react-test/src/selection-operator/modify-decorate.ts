import Paragraph from "../components/paragraph";
import { getComponentById } from "../components/util";
import { getSelection } from "../selection-operator/selection";

// 修改选区内内容的表现行为
const modifyDecorate = (name: string, value: string) => {
  let selection = getSelection();
  let start = selection.range[0].offset;
  let end = selection.range[1].offset;
  if (start > end) {
    [start, end] = [end, start];
  }
  let component = getComponentById(selection.range[0].componentId) as Paragraph;
  component.changeCharStyle(name, value, start, end);
  document.getElementById(component.id)?.replaceWith(component.render());
};

export default modifyDecorate;
