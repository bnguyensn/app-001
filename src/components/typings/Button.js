// @flow

import * as React from 'react';
import './button.css';

export default function Button(props: {
  children?: React.Node,
  action: any => any,
}) {
  const { children, action, ...rest } = props;

  return (
    <button className="button" type="button" onClick={action} {...rest}>
      {children}
    </button>
  );
}

export function PlayButton(props: { action: any => any, playing: boolean }) {
  const { action, playing, ...rest } = props;

  return (
    <Button action={action} {...rest}>
      {playing ? 'Pause' : 'Play'}
    </Button>
  );
}
