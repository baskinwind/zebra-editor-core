import Component from "./Component";

export default abstract class Inline extends Component {
  abstract type: string;
  abstract content: string;
}
