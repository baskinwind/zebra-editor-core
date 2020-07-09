import { generate } from "shortid";
import Block from "./block";
const store: { [key: string]: any } = {};

export interface IStatistic {
  word: number;
  image: number;
  audio: number;
  video: number;
  table: number;
  list: number;
  code: number;
  block: number;
}

export const getId = () => {
  return generate();
};

export const saveBlock = <T extends Block = Block>(
  component: T,
  key?: string
) => {
  if (key) {
    store[key] = component;
    return;
  }

  store[component.id] = component;
};

export const getBlockById = <T extends Block = Block>(id: string): T => {
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

export const mergerStatistic = (oldS: IStatistic, newS: IStatistic) => {
  return {
    word: oldS.word + newS.word,
    image: oldS.image + newS.image,
    audio: oldS.audio + newS.audio,
    video: oldS.video + newS.video,
    table: oldS.table + newS.table,
    list: oldS.list + newS.list,
    code: oldS.code + newS.code,
    block: oldS.block + newS.block
  };
};

export const nextTicket = (func: () => void) => {
  Promise.resolve().then(func);
};
