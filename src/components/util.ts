import { generate } from "shortid";
import Component from "./component";
import Article from "./article";
const store: { [key: string]: any } = {};

export const getId = () => {
  return generate();
};

export const saveComponent = <T extends Component = Component>(
  component: T
) => {
  store[component.id] = component;
  if (component instanceof Article) {
    store.article = component;
  }
};

export const getComponentById = <T extends Component = Component>(
  id: string
): T => {
  if (!id) {
    let article = store["article"];
    if (!article) throw Error("未生成文章，请先生成文章后调用。");
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
