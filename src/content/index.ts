import ContentBulider from "./content-builder";
import BaseBuilder from "./baseBuilder";

let nowContentBuiler: BaseBuilder<any> = ContentBulider.getInstance();

export const getContentBuilder = () => nowContentBuiler;

export const setContentBuilder = (builder: BaseBuilder<any>) => {
  nowContentBuiler = builder || ContentBulider.getInstance();
};

export const changeContentBuiler = (builder: BaseBuilder<any>) => {
  nowContentBuiler = builder;
  Promise.resolve().then(() => {
    nowContentBuiler = ContentBulider.getInstance();
  });
};
