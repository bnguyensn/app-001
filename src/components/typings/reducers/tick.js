// @flow

export default function tick(state, action) {
  switch (action.type) {
    case 'NEXT_TICK':
      return { ...state };
    default:
      return state;
  }
}
