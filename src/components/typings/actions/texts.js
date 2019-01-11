// @flow

import type { ActionType } from './main';

/**
 * Contain action creators that manage texts.
 * */

export function moveTextsDown(dist: number): ActionType {
  return {
    type: 'MOVE_TEXT_DOWN',
    payload: dist,
  };
}
