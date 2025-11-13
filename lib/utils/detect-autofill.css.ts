import { globalStyle, keyframes, style } from "@vanilla-extract/css";

export const animation = keyframes({
  from: {},
  to: {},
});

export const form = style({});

globalStyle(`${form} :is(:autofill, :-webkit-autofill)`, {
  animationName: animation,
  animationDuration: "0.01s",
  animationIterationCount: 1,
});
