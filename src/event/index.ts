import Event from "./eevent";

const event = new Event();

export const $emit = <T>(eventName: string, e: T) => {
  event.$emit<T>(eventName, e);
};

export const $on = <T>(eventName: string, func: (evnet: T) => void) => {
  event.$on<T>(eventName, func);
};
