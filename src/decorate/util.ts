import { generate } from "shortid";

export const getId = () => {
  return generate();
};
