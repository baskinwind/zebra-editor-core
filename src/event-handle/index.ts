import { $on } from "../event";

const registerEvent = (handle: any) => {
  Object.keys(handle).forEach((key) => {
    $on(key, handle[key]);
  });
};

export default registerEvent;
