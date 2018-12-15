// @flow

import * as React from 'react';
import './text-block.css';

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

export default TextBlock;
