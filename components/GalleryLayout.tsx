import React, {
  Children,
  cloneElement,
  isValidElement,
  ReactNode,
  useMemo,
} from "react";
import { Flex } from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";

import { calcOptimalBoxes } from "lib/gallery";

interface Props {
  gap?: number;
  aspectRatio?: number;
  width: number;
  height: number;
  children: ReactNode;
}

const GalleryLayout = ({
  children,
  width,
  height,
  gap = 10,
  aspectRatio = 16 / 9,
}: Props) => {
  const bestFit = useMemo(() => {
    if (children) {
      return calcOptimalBoxes(
        width,
        height,
        Children.count(children),
        aspectRatio,
        gap
      );
    }
  }, [children, width, height, gap, aspectRatio]);

  return (
    <Flex
      wrap="wrap"
      width="100%"
      height="100%"
      gap={`${gap}px`}
      overflow="hidden"
      alignItems="center"
      alignContent="center"
      justifyContent="center"
    >
      <AnimatePresence>
        {Children.map(children, (child) => {
          if (
            isValidElement(child) &&
            bestFit &&
            bestFit.width &&
            bestFit.height
          ) {
            return cloneElement(child, {
              width: bestFit.width,
              height: bestFit.height,
            });
          } else {
            return child;
          }
        })}
      </AnimatePresence>
    </Flex>
  );
};

export default GalleryLayout;
