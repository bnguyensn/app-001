// @flow

import type { ActionType } from './main';
import type { TextType } from '../reducers/main';
import { MOVE_TEXT_DOWN, REPLACE_TEXT } from './main';

/**
 * Contain action creators that manage texts.
 * */

export function moveTextsDown(dist: number): ActionType {
  return {
    type: MOVE_TEXT_DOWN,
    payload: dist,
  };
}

export function replaceText(oldTextId: number, newText: TextType): ActionType {
  return {
    type: REPLACE_TEXT,
    payload: {
      oldTextId,
      newText,
    },
  };
}
