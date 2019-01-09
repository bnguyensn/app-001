// @flow

/**
 * Manage the tick part of our app.
 * */

import type { ActionType } from '../actions/main';
import { NEXT_TICK, TOGGLE_THROTTLING } from '../actions/main';
import gameConf from '../../../data/typings/game-conf';

/** ********** TICK ********** **/

export function tick(state: number, action: ActionType): number {
  const nextTick = state + action.payload;

  switch (action.type) {
    case NEXT_TICK:
      return nextTick >= gameConf.fps
        ? (nextTick % gameConf.fps) + 1
        : nextTick;
    default:
      return state;
  }
}

/** ********** THROTTLING ********** **/

export function throttle(state: boolean, action: ActionType): boolean {
  switch (action.type) {
    case TOGGLE_THROTTLING:
      return !state;
    default:
      return state;
  }
}
