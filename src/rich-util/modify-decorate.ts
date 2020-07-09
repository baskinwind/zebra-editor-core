import focusAt from "./focus-at";
import { getBlockById } from "../components/util";
import { storeData } from "../decorate";
import { getContainDocument } from "../selection-operator/util";

const modifyDecorate = (
  idList: string[],
  style?: storeData,
  data?: storeData,
  focus: boolean = true
) => {
  idList.forEach((id) => {
    let block = getBlockById(id);
    block.modifyDecorate(style, data);
  });
  if (focus) {
    focusAt();
  }
};

export default modifyDecorate;
