import focusAt from "./focus-at";
import { getBlockById } from "../components/util";
import { storeData } from "../decorate";

const modifyDecorate = (
  idList: string[],
  style?: storeData,
  data?: storeData
) => {
  idList.forEach((id) => {
    let customerUpdate = !data && !style?.remove;
    let component = getBlockById(id);
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

export default modifyDecorate;
