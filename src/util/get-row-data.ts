import Component from "../components/component";

// 生成用于保存的 JSON 字符串
const getRawData = (component: Component) => {
  return JSON.stringify(component.getRaw());
};

export default getRawData;
