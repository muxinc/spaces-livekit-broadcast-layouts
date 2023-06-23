import React from "react";

type SVG = React.SVGAttributes<SVGElement>;

export type IconProps = React.SVGAttributes<SVGElement> & {
  /**
   * The color of the SVG. `currentColor` by default.
   */
  color?: string;
} & (
    | {
        /**
         * Set this prop to scale the icon alongside font size.
         * EX: Set this prop if using a text link with an icon.
         *
         * You should not set this prop alongside a `width` or `height`
         */
        scalable: true;
        width?: never;
        height?: never;
      }
    | {
        scalable?: false;
        width?: Pick<SVG, "width">["width"];
        height?: Pick<SVG, "height">["height"];
      }
  );
