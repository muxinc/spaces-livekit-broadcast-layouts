import LayoutContext from "context/Layout";
import { useContext } from "react";

const useBackgroundImage = () => {
  const { backgroundImage } = useContext(LayoutContext);

  return backgroundImage;
};

export default useBackgroundImage;
