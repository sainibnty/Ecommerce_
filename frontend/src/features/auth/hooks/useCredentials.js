import { useDispatch } from "react-redux";
import { setCredentials } from "../authSlice";

export const useCredentials = () => {
  const dispatch = useDispatch();

  return {
    setCredentials: (data) => dispatch(setCredentials(data)),
  };
};
