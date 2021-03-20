export const getTextLength = (text: string | null) => {
  if (!text) return 0;
  return [...text].length;
};

export const getTextSurePosition = (text: string | null, index: number) => {
  let sureList = [...(text || "")];
  return sureList.slice(0, index).join("").length;
};
