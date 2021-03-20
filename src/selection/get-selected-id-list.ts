import Article from "../components/article";
import Block from "../components/block";
import StructureCollection from "../components/structure-collection";

const walkCollection = (
  structureCollection: StructureCollection<Block>,
  callback: (block: Block) => boolean,
) => {
  for (let i = 0, len = structureCollection.getSize(); i < len; i++) {
    let each = structureCollection.getChild(i);
    if (each instanceof StructureCollection) {
      if (walkCollection(each, callback)) {
        return true;
      }
    } else {
      if (callback(each)) {
        return true;
      }
    }
  }
  return false;
};

export const getSelectedIdList = (
  article: Article,
  startId: string,
  endId: string = startId,
): string[] => {
  if (startId === "") return [];
  if (startId === endId) return [startId];
  let findStart = false;
  let selectedId: string[] = [];
  walkCollection(article, (block: Block) => {
    if (findStart || startId === block.id) {
      selectedId.push(block.id);
      findStart = true;
      return endId === block.id;
    }
    return false;
  });
  return selectedId;
};
