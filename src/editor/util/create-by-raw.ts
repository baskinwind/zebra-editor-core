import ComponentFactory, { getComponentFactory } from "../../components";
import { IRawType } from "../../components/component";
import Block from "../../components/block";

// 将 getRaw 生成的转换为表示文章的结构
const createByRaw = (
  componentFactory: ComponentFactory,
  raw: IRawType,
): Block => {
  if (!raw.type) return componentFactory.buildParagraph();
  return componentFactory.typeMap[raw.type].create(componentFactory, raw);
};

export default createByRaw;
