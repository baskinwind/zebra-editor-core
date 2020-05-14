import baseSelectionOperator from "./base";
let nowSelectionOperator = baseSelectionOperator;

export const getOperator = () => nowSelectionOperator;

export const changeOpeartor = (operator: any) => {
  nowSelectionOperator = operator;
};
