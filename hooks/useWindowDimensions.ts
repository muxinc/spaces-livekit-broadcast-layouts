import LayoutContext from "context/Layout";
import { useContext } from "react";

const useWindowDimensions = () => {
  const { windowDimensions } = useContext(LayoutContext);

  return windowDimensions;
};

export default useWindowDimensions;
