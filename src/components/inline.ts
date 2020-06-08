import Component from "./component";
import StructureType from "../const/structure-type";

abstract class Inline extends Component {
  abstract content: string;
  structureType = StructureType.unit;
}

export default Inline;
