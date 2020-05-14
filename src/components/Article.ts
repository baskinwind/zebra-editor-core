import Component from "./Component";
import { getBuilder } from "../builder";

export default class Article extends Component {
  getContent() {
    return this.children?.map((component) => component.getContent());
  }

  render() {
    getBuilder().render(this.getContent());
  }
}
