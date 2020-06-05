import input from "../selection-operator/input";

const onComposttion = (event: CompositionEvent) => {
  input(event.data, true);
};

export default onComposttion;
