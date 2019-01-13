// @flow

/** ********** TYPES ********** **/

export type ActionType = {
  type: string,
  payload?: any,
  error?: boolean,
  meta?: any,
};

/** ********** ACTION TYPES ********** **/

export const PLAY_PAUSE = 'PLAY_PAUSE';
export const NEXT_TICK = 'NEXT_TICK';
export const TOGGLE_THROTTLING = 'TOGGLE_THROTTLING';

export const UPDATE_SCORE = 'UPDATE_SCORE';
export const SCORE_TEXT = 'SCORE_TEXT';
export const PENALISE_TEXT = 'PENALISE_TEXT';
export const MOVE_TEXT_DOWN = 'MOVE_TEXT_DOWN';
export const REPLACE_TEXT = 'REPLACE_TEXT';

export const KEY_DOWN = 'KEY_DOWN';
export const KEY_UP = 'KEY_UP';
