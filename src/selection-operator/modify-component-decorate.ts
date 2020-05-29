import Article from "../components/article";
import getSelection from "./get-selection";
import focusAt from "./focus-at";
import { getComponentById } from "../components/util";
import { storeData } from "../decorate";

const modifyComponentDecorate = (style?: storeData, data?: storeData) => {
  let selection = getSelection();
  let start = selection.range[0];
  let end = selection.range[1];
  let article = getComponentById<Article>("article");
  let idList = article.getIdList(start.id, end.id)[2];
  idList.forEach((id) => {
    let customerUpdate = !data;
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
