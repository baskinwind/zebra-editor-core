import Article from "../components/article";
import Block from "../components/block";
import StructureCollection from "../components/structure-collection";

const walkCollection = (
  structureCollection: StructureCollection,
  callback: (block: Block) => boolean,
) => {
  for (let i = 0, len = structureCollection.getSize(); i < len; i++) {
    let item = structureCollection.getChild(i);
    if (item instanceof StructureCollection) {
      if (walkCollection(item, callback)) {
        return true;
      }
    } else {
      if (callback(item)) {
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
