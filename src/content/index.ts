import ContentBulider from "./content-builder";
import BaseBuilder from "./baseBuilder";

let nowContentBuiler: BaseBuilder = ContentBulider.getInstance();

export const getContentBuilder = () => nowContentBuiler;

export const setContentBuilder = (builder: BaseBuilder) => {
  nowContentBuiler = builder || ContentBulider.getInstance();
};

export const changeContentBuiler = (builder: BaseBuilder) => {
  nowContentBuiler = builder;
  Promise.resolve().then(() => {
    nowContentBuiler = ContentBulider.getInstance();
  });
};
