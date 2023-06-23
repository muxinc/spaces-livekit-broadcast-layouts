import LayoutContext from "context/Layout";
import { useContext } from "react";

const useLayout = () => {
  const { layout } = useContext(LayoutContext);

  return layout;
};

export default useLayout;
