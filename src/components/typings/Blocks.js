// @flow

import * as React from 'react';
import './block.css';

type TextBlockProps = {
  text: string,
  posX: number,
  posY: number,
};

function TextBlock(props: TextBlockProps) {
  const { text, posX, posY } = props;

  return (
    <div className="text-block" style={{ top: posY, left: posX }}>
      {text}
    </div>
  );
}

type InputBlockProps = {
  text: string,
};

function InputBlock(props: InputBlockProps) {
  const { text } = props;

  return <div className="input-block">{text}</div>;
}

export { TextBlock, InputBlock };
