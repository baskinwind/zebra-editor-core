import ContentBulider from "./content-builder";
import BaseBuilder from "./base-builder";

let nowContentBuiler: any;

export const getContentBuilder = <T extends BaseBuilder = BaseBuilder>(): T =>
  nowContentBuiler;

export const setContentBuilder = (builder?: BaseBuilder) => {
  nowContentBuiler = builder || ContentBulider.getInstance();
};

export const changeContentBuiler = (builder: BaseBuilder) => {
  nowContentBuiler = builder;
  Promise.resolve().then(() => {
    nowContentBuiler = ContentBulider.getInstance();
  });
};
