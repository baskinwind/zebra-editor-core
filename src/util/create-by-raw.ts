import Component, { IRawType } from "../components/component";
import Paragraph from "../components/paragraph";
import ComponentMap from "../const/component-map";

// 将 getRaw 生成的转换为表示文章的结构
const createByRaw = <T extends Component = Component>(raw: IRawType): T => {
  if (!raw.type) return new Paragraph() as any;
  let creator = ComponentMap[raw.type];
  let component = creator(raw);
  return component;
};

export default createByRaw;
