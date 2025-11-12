import { keyframes, style } from "@vanilla-extract/css";

export const animation = keyframes({
  from: {},
  to: {},
});

export const form = style({
  selectors: {
    "&:has(input:is(:-webkit-autofill, :autofill))": {
      animationName: animation,
      animationDuration: "0.01s",
      animationIterationCount: 1,
      border: "1px solid red !important", // For debugging
    },
  },
});
