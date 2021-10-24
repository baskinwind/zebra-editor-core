import Block from "../components/block";
import StructureCollection from "../components/structure-collection";

export const nextTick = (func: () => void) => {
  Promise.resolve().then(func);
};

export const walkTree = (
  structureCollection: StructureCollection<Block>,
  callback: (block: Block) => boolean | void,
) => {
  if (callback(structureCollection)) {
    return true;
  }

  for (let i = 0, len = structureCollection.getSize(); i < len; i++) {
    let each = structureCollection.getChild(i);
    if (each instanceof StructureCollection) {
      if (walkTree(each, callback)) {
        return true;
      }
    }
    if (callback(each)) {
      return true;
    }
  }
  return false;
};