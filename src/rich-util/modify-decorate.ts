import focusAt from "./focus-at";
import { getBlockById } from "../components/util";
import { storeData } from "../decorate";
import { getContainDocument } from "../selection-operator/util";

const modifyDecorate = (
  idList: string[],
  style?: storeData,
  data?: storeData
) => {
  let containDocument = getContainDocument();
  idList.forEach((id) => {
    let customerUpdate = !data && !style?.remove;
    let component = getBlockById(id);
    component.modifyDecorate(style, data);
    if (customerUpdate && style) {
      let dom = containDocument.getElementById(component.id);
      if (!dom) return;
      for (let key in style) {
        dom.style[key] = style[key];
      }
    }
  });
  focusAt();
};

export default modifyDecorate;
