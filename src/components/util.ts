import { generate } from "shortid";
import Component from "./ccomponent";
import Collection from "./collection";
import ComponentType from "../const/component-type";
const store: { [key: string]: Component } = {};

export const getId = () => {
  return generate();
};

export const saveComponent = (component: Component) => {
  store[component.id] = component;
  if (component.type === ComponentType.article) {
    store.article = component;
    console.log(component);
  }
};

export const getComponentById = (id: string) => store[id] as Collection<any>;
