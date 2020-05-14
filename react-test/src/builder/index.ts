import htmlBuilder from "./html-builder";
let nowBuiler = htmlBuilder;

export const getBuilder = () => nowBuiler;

export const changeBuiler = (builder: any) => {
  nowBuiler = builder;
};
