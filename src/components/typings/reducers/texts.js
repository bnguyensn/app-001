// @flow

import { MOVE_TEXT_DOWN } from '../actions/main';

/**
 * Manage the texts part of our app.
 * */

export function modifyTexts(state, action) {
  switch (action.type) {
    case MOVE_TEXT_DOWN:
      return state.map(text => ({
        ...text,
        posY: text.posY + action.payload,
      }));
    default:
      return state;
  }
}
