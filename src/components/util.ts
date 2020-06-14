import { generate } from "shortid";
import Block from "./block";
const store: { [key: string]: any } = {};

export const getId = () => {
  return generate();
};

export const saveComponent = <T extends Block = Block>(
  component: T,
  key?: string
) => {
  if (key) {
    store[key] = component;
    return;
  }

  store[component.id] = component;
};

export const getComponentById = <T extends Block = Block>(id: string): T => {
  if (!id) {
    let article = store["article"];
    if (!article) throw Error("生成文章后调用。");
    return store["article"].children.get(0);
  }
  return store[id];
};

export const createError = (message: string, info?: any) => {
  let error = new Error(message);
  // @ts-ignore
  error.draftInfo = info;
  return error;
};
