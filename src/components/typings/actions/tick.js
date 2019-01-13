// @flow

/**
 * Contain action creators that manage ticks.
 * */

import { NEXT_TICK, TOGGLE_THROTTLING } from './main';

/** ********** NEXT_TICK ********** **/

export type NextTickActionType = {
  type: string,
  payload: number,
};

export function nextTick(amount?: number = 1): NextTickActionType {
  return {
    type: NEXT_TICK,
    payload: amount,
  };
}

/** ********** TOGGLE_THROTTLING ********** **/

export type ToggleThrottlingActionType = {
  type: string,
};

export function toggleThrottling(): ToggleThrottlingActionType {
  return {
    type: TOGGLE_THROTTLING,
  };
}
