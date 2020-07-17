import { getComponentFactory } from "../components";
import { IRawType } from "../components/component";
import Block from "../components/block";

// 将 getRaw 生成的转换为表示文章的结构
const createByRaw = (raw: IRawType): Block => {
  let factory = getComponentFactory();
  if (!raw.type) return factory.buildParagraph();
  return factory.typeMap[raw.type].create(raw);
};

export default createByRaw;
