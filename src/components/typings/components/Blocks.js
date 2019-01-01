// @flow

import * as React from 'react';
import './block.css';

type TextBlockProps = {
  text: string,
  textMatched: string,
  textUnmatched: string,
  posX: number,
  posY: number,
};

function TextBlock(props: TextBlockProps) {
  const { text, textMatched, textUnmatched, posX, posY } = props;

  return (
    <div
      className="text-block"
      style={{ transform: `translate(${posX}px, ${posY}px` }}
    >
      <span className="matched">{textMatched}</span>
      {textUnmatched}
    </div>
  );
}

type InputBlockProps = {
  text: string,
};

function InputBlock(props: InputBlockProps) {
  const { text } = props;

  return (
    <div className="input-block-wrapper">
      <div className="input-block">{text}</div>
    </div>
  );
}

export { TextBlock, InputBlock };
