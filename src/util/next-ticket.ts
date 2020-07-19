const nextTicket = (func: () => void) => {
  Promise.resolve().then(func);
};

export default nextTicket;
