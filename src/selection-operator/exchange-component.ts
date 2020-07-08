import Block from "../components/block";
import getSelection from "./get-selection";
import focusAt from "../rich-util/focus-at";
import { getBlockById } from "../components/util";
import { getSelectedIdList } from "./util";
import { classType } from "../components/component";
import { createRecord } from "../record/util";

// 修改选区中整块内容的呈现
const exchangeComponent = (newClass: classType, ...args: any[]) => {
  let selection = getSelection();
  let start = selection.range[0];
  let end = selection.range[1];
  createRecord(start, end);

  let idList = getSelectedIdList(start.id, end.id);
  let endToTailSize =
    getBlockById(idList[idList.length - 1]).getSize() - end.offset;
  let exchangeList: Block[] = [];
  let idMap: { [key: string]: any } = {};
  idList.forEach((id) => {
    getBlockById(id)
      .exchangeTo(newClass, args)
      .forEach((item) => {
        if (!idMap[item.id]) {
          idMap[item.id] = 1;
          exchangeList.push(item);
        }
      });
  });
  let nowStart = { id: "", offset: start.offset };
  let nowEnd = { id: "", offset: endToTailSize };
  let index = 0;
  while (index < exchangeList.length) {
    let component = exchangeList[index];
    let size = component.getSize();
    if (!nowStart.id && nowStart.offset >= 0 && nowStart.offset <= size) {
      nowStart.id = component.id;
      break;
    }
    nowStart.offset -= size;
    index += 1;
  }
  let tailIndex = exchangeList.length - 1;
  while (tailIndex >= 0) {
    let component = exchangeList[tailIndex];
    let size = component.getSize();
    if (!nowEnd.id && nowEnd.offset >= 0 && nowEnd.offset <= size) {
      nowEnd.id = component.id;
      nowEnd.offset = size - nowEnd.offset;
      break;
    }
    nowEnd.offset -= size;
    tailIndex -= 1;
  }
  focusAt(nowStart, nowEnd);
};

export default exchangeComponent;
