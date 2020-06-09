import getSelection from "./get-selection";
import focusAt from "../rich-util/focus-at";
import { getComponentById } from "../components/util";
import { storeData } from "../decorate";
import { getSelectedIdList } from "./util";
import { createRecord } from "../record/util";

// 修改选中组件的样式
const modifyComponentDecorate = (style?: storeData, data?: storeData) => {
  let selection = getSelection();
  let start = selection.range[0];
  let end = selection.range[1];
  createRecord(start, end);
  let idList = getSelectedIdList(start.id, end.id);
  idList.forEach((id) => {
    let customerUpdate = !data && style?.remove;
    let component = getComponentById(id);
    component.modifyDecorate(style, data, customerUpdate);
    if (customerUpdate && style) {
      let dom = document.getElementById(component.id);
      if (!dom) return;
      for (let key in style) {
        if (dom.style[key] === style[key]) {
          dom.style[key] = "";
        } else {
          dom.style[key] = style[key];
        }
      }
    }
  });
  focusAt();
};

export default modifyComponentDecorate;
