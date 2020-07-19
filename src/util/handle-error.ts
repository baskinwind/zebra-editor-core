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

export const createError = (message: string, info?: any) => {
  let error = new Error(message);
  // @ts-ignore
  error.editorInfo = info;
  errorHandleQueue.forEach((item) => item(error));
  return error;
};
