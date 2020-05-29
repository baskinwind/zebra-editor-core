import contentBulider from "./content-builder";
let nowContentBuiler = contentBulider;

export const getContentBuilder = () => nowContentBuiler;

export const changeContentBuiler = (builder?: any) => {
  nowContentBuiler = builder;
  Promise.resolve().then(() => {
    nowContentBuiler = contentBulider;
  })
};
