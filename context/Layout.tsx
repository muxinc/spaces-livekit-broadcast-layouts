import React, { createContext, ReactNode, useState, useEffect } from "react";
import { Layout } from "../lib/types";

interface ILayoutContext {
  backgroundImage: string | null;
  layout: Layout;
  windowDimensions: WindowDimensions;
}

export const LayoutContext = createContext({} as ILayoutContext);

export default LayoutContext;

type WindowDimensions = {
  width: number | undefined;
  height: number | undefined;
};

interface Props {
  children: ReactNode;
  backgroundImage: ILayoutContext["backgroundImage"];
  layout: ILayoutContext["layout"];
}

export const LayoutProvider: React.FC<Props> = ({
  children,
  backgroundImage,
  layout,
}) => {
  const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize(): void {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return (): void => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <LayoutContext.Provider
      value={{
        backgroundImage,
        layout,
        windowDimensions,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
