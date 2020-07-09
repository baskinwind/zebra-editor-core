import ContentBulider from "./content-builder";
import BaseBuilder from "./base-builder";

let nowContentBuiler: BaseBuilder;

export const getContentBuilder = () => nowContentBuiler;

export const setContentBuilder = (builder?: BaseBuilder) => {
  nowContentBuiler = builder || ContentBulider.getInstance();
};

export const changeContentBuiler = (builder: BaseBuilder) => {
  nowContentBuiler = builder;
  Promise.resolve().then(() => {
    nowContentBuiler = ContentBulider.getInstance();
  });
};
