const errorHandleQueue: Function[] = [];

export const addErrorHandle = (func: (error: Error) => void) => {
  errorHandleQueue.push(func);
};

export const removeErrorHandle = (func: (error: Error) => void) => {
  let index = errorHandleQueue.indexOf(func);
  if (index !== -1) {
    errorHandleQueue.splice(index, 1);
  }
};

export const createError = (message: string, block?: any, type?: string) => {
  let error = new Error(message);
  // @ts-ignore
  error.type = type || "component";
  // @ts-ignore
  error.blockInfo = block;
  errorHandleQueue.forEach((item) => item(error));
  return error;
};
