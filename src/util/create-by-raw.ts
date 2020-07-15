import { getComponentFactory } from "../components";
import { IRawType } from "../components/component";
import ComponentMap from "../const/component-create";
import Block from "../components/block";

// 将 getRaw 生成的转换为表示文章的结构
const createByRaw = (raw: IRawType): Block => {
  if (!raw.type) return getComponentFactory().buildParagraph();
  let creator = ComponentMap[raw.type];
  let component = creator(raw);
  return component;
};

export default createByRaw;
