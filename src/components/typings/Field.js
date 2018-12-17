// @flow

import * as React from 'react';
import { ConfigContext } from './Game';
import TextBlock from './TextBlock';
import './field.css';

type TextBlockData = {
  id: number,
  text: string,
  posX: number,
  posY: number,
};

type FieldProps = {
  textBlocksData: TextBlockData[],
  children?: React.Node,
};

export default function Field(props: FieldProps) {
  const { textBlocksData, children } = props;

  return <div className="field">{children}</div>;
}
