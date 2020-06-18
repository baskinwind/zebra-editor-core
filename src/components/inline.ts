import Component from "./component";
import StructureType from "../const/structure-type";
import ContentCollection from "./content-collection";

abstract class Inline extends Component {
  abstract content: string;
  parent?: ContentCollection;
  structureType = StructureType.unit;
}

export default Inline;
