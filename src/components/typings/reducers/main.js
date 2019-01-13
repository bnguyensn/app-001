// @flow

/**
 * This reducer manages the complete state of our app.
 * */

import type { ActionType } from '../actions/main';

/** ********** TYPES ********** **/

export type TextType = {
  id: number,
  text: string,
  matchedText: string,
  posX: number,
  posY: number,
};

export type StateType = {
  playing: boolean,
  tick: number,
  throttling: boolean,
  fieldHeight: ?number,
  fieldWidth: ?number,
  score: number,
  texts: TextType[],
};

/** ********** INITIAL STATE ********** **/

const INITIAL_STATE = {
  playing: true,
  tick: 1,
  throttling: false,
  fieldHeight: null,
  fieldWidth: null,
  score: 0,
  texts: [],
};

/** ********** MAIN REDUCER ********** **/

export default function app(
  state: StateType = INITIAL_STATE,
  action: ActionType,
) {}
