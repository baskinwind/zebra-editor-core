import Component, { OperatorType } from "./component";
import StructureType from "../const/structure-type";
import ContentCollection from "./content-collection";
import Collection from "./collection";

abstract class Inline extends Component {
  abstract content: string;
  parent?: ContentCollection;
  structureType = StructureType.unit;

  // 添加到某个组件内，被添加的组件必须为 ContentCollection 类型
  addInto(collection: ContentCollection, index: number = -1): OperatorType {
    return collection.add(index, this);
  }
}

export default Inline;
