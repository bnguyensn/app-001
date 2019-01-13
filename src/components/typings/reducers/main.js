// @flow

/**
 * Manage the complete state of our app.
 * */

import type { ActionType } from '../actions/main';
import { NEXT_TICK, TOGGLE_THROTTLING } from '../actions/main';
import { tick, throttle } from './tick';

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

const INITIAL_TEXTS_BY_ID = {};

const INITIAL_STATE = {
  playing: true,
  tick: 1,
  throttling: false,
  fieldHeight: null,
  fieldWidth: null,
  score: 0,
  texts: [],
};

/** ********** REDUCER ********** **/

export default function app(
  state: StateType = INITIAL_STATE,
  action: ActionType,
): StateType {
  switch (action.type) {
    case NEXT_TICK:
      return {
        ...state,
        tick: tick(state.tick, action),
      };
    case TOGGLE_THROTTLING:
      return {
        ...state,
        throttling: throttle(state.throttling, action),
      };
    default:
      return state;
  }
}
