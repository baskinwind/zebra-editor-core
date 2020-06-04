import Component, { rawType } from "../components/component";
import Paragraph from "../components/paragraph";
import ComponentMap from "../const/component-map";

const createByRaw = <T extends Component = Component>(raw: rawType): T => {
  if (!raw.type) return new Paragraph() as any;
  let creator = ComponentMap[raw.type];
  let component = creator(raw);
  return component;
};

export default createByRaw;
