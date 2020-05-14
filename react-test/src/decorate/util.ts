import { generate } from "shortid";
const store: { [key: string]: any } = {};

export const getId = () => {
  return generate();
};

export const saveDecorete = (component: any) => {
  store[component.id] = component;
};

export const getDecoreteById = (id: string) => store[id];
