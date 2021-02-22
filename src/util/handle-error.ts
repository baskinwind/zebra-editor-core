export const createError = (message: string, block?: any, type?: string) => {
  let error = new Error(message);
  // @ts-ignore
  error.type = type || "component";
  // @ts-ignore
  error.blockInfo = block;
  return error;
};
