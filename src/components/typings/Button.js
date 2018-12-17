// @flow

import * as React from 'react';
import './button.css';

export default function Button(props: {
  children?: React.Node,
  action: any => any,
}) {
  const { children, action } = props;

  return (
    <button className="button" type="button" onClick={action}>
      {children}
    </button>
  );
}

export function PlayButton(props: { action: any => any, playing: boolean }) {
  const { action, playing } = props;

  return <Button action={action}>{playing ? 'Pause' : 'Play'}</Button>;
}
