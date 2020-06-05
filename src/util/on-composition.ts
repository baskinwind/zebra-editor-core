import input from "../selection-operator/input";
import updateComponent from "../selection-operator/update-component";

const onComposttion = (event: CompositionEvent) => {
  input(event.data, true);
};

export default onComposttion;
