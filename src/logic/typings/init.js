// @flow

import run from './run';
import words from '../../data/typings/words-1';

export type Config = {
  blockSpeed: number, // ms for a block to travel to the end
  blockInterval: number, // ms for a new block to appear
  maxBlock: number, // Maximum number of text blocks that can appear on screen
  minBlock: number, // Minimum number of text blocks that can appear on screen
};

const DEFAULT_CONFIG: Config = {
  blockSpeed: 10000,
  blockInterval: 1000,
  maxBlock: 10,
  minBlock: 0,
};

export default function init(config: Config = DEFAULT_CONFIG) {}
