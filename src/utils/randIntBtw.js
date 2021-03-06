// @flow

/**
 * Inclusive of min and max
 * */
export default function randIntBtw(max: number, min: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
