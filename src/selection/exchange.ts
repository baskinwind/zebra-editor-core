import Editor from "../editor/editor";
import Block, { BlockType } from "../components/block";
import getSelection from "./get-selection";
import focusAt from "./focus-at";
import { getSelectedIdList } from "./util";

// 修改选区中整块内容的呈现
const exchange = (editor: Editor, newBlock: BlockType, ...args: any[]) => {
  let selection = getSelection(editor.mountedWindow);
  let start = selection.range[0];
  let end = selection.range[1];
  try {
    let idList = getSelectedIdList(editor.article, start.id, end.id);
    let endToTailSize =
      editor.storeManage.getBlockById(idList[idList.length - 1]).getSize() -
      end.offset;

    let exchangeList: Block[] = [];
    let idMap: { [key: string]: number } = {};

    // 获取转换后的组件
    idList.forEach((id) => {
      editor.storeManage
        .getBlockById(id)
        .exchangeTo(newBlock, args)
        .forEach((item) => {
          if (!idMap[item.id]) {
            idMap[item.id] = 1;
            exchangeList.push(item);
          }
        });
    });

    let nowStart = { id: "", offset: start.offset };
    let nowEnd = { id: "", offset: endToTailSize };

    // 获得光标开始位置
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

    // 获得光标结束位置
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
    focusAt(editor.mountedWindow, nowStart, nowEnd);
  } catch (err) {
    console.warn(err);
  }
};

export default exchange;
