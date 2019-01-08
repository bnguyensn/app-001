// @flow

/**
 * Manage the tick part of our app.
 * */

import type {
  NextTickActionType,
  ToggleThrottlingActionType,
} from '../actions/tick';
import { NEXT_TICK, TOGGLE_THROTTLING } from '../actions/main';
import gameConf from '../../../data/typings/game-conf';

/** ********** TICK ********** **/

export function tick(state: number, action: NextTickActionType): number {
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

export type ToggleThrottlingStateType = {
  throttling: boolean,
};

export function throttle(
  state: ToggleThrottlingStateType,
  action: ToggleThrottlingActionType,
): ToggleThrottlingStateType {
  switch (action.type) {
    case TOGGLE_THROTTLING:
      return {
        throttling: !state.throttling,
      };
    default:
      return state;
  }
}
