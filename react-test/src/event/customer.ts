import Paragraph from "../components/paragraph";
import { getComponentById } from "../components/util";
import { getSelection } from "../selection-operator/index";

// 将选区内的内容添加样式
export const changeSelectionStyle = (name: string, value: string) => {
  let selection = getSelection();
  let start = selection.range[0].offset;
  let end = selection.range[1].offset;
  if (start > end) {
    [start, end] = [end, start];
  }
  let component = getComponentById(selection.range[0].componentId) as Paragraph;
  component.changeCharStyle(name, value, start, end);
  document.getElementById(component.id)?.replaceWith(component.getContent());
};
