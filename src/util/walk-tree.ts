import Block from "../components/block";
import StructureCollection from "../components/structure-collection";

export const walkTree = (
  structureCollection: StructureCollection<Block>,
  callback: (block: Block) => boolean | void,
) => {
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
