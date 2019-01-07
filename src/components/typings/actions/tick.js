// @flow

import type { TickStateType, TickActionType } from '../reducers/tick';
import gameConf from '../../../data/typings/game-conf';

export default function nextTick(state: TickStateType): TickActionType {
  return {
    type: 'NEXT_TICK',
    payload: {
      tick: state.tick === gameConf.fps ? 1 : state.tick + 1,
      throttling: true,
    },
  };
}
