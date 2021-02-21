import { v4 as uuidv4 } from "uuid";

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
  return uuidv4();
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
    block: oldS.block + newS.block,
  };
};
