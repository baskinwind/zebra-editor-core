import focusAt from "./focus-at";
import { getBlockById } from "../components/util";
import { storeData } from "../decorate";
import { getContainDocument } from "../selection-operator/util";

const modifyDecorate = (
  idList: string[],
  style?: storeData,
  data?: storeData
) => {
  idList.forEach((id) => {
    let component = getBlockById(id);
    component.modifyDecorate(style, data);
  });
  focusAt();
};

export default modifyDecorate;
