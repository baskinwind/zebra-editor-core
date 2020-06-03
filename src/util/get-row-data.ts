import Component from "../components/component";

const getRawData = (component: Component) => {
  return JSON.stringify(component.getRaw());
};

export default getRawData;
