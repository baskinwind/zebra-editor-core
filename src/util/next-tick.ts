const nextTick = (func: () => void) => {
  Promise.resolve().then(func);
};

export default nextTick;
