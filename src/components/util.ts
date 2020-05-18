import { generate } from "shortid";
import Component from "./component";
import Collection from "./collection";
const store: { [key: string]: Component } = {};

export const getId = () => {
  return generate();
};

export const saveComponent = (component: Component) => {
  store[component.id] = component;
};

export const getComponentById = (id: string) => store[id] as Collection<any>;
