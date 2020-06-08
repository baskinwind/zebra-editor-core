import getSelection from "./get-selection";
import focusAt from "./focus-at";
import { getComponentById } from "../components/util";
import { getSelectedIdList } from "./util";
import { classType } from "../components/component";

// 修改选区中整块内容的呈现
const exchangeParagraph = (newClass: classType, ...args: any[]) => {
  let selection = getSelection();
  let start = selection.range[0];
  let end = selection.range[1];
  let idList = getSelectedIdList(start.id, end.id);

  if (idList.length === 0) return;
  if (idList.length === 1) {
    let newComponent = getComponentById(idList[0]).exchangeToOther(
      newClass,
      args
    );
    focusAt([newComponent, start.offset, end.offset]);
    return;
  }
  let newList = idList.map((id) =>
    getComponentById(id).exchangeToOther(newClass, args)
  );

  focusAt(
    {
      id: newList[0].id,
      offset: start.offset
    },
    {
      id: newList[newList.length - 1].id,
      offset: end.offset
    }
  );
};

export default exchangeParagraph;
