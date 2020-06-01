import input from "./input";

const onComposttion = (event: CompositionEvent) => {
  input(event.data, true);
};

export default onComposttion;
