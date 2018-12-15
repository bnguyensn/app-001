// @flow

import * as React from 'react';
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
};

function Field(props: FieldProps) {
  const { textBlocksData } = props;

  return (
    <div className="field">
      {textBlocksData.map(textBlockData => (
        <TextBlock
          key={textBlockData.id}
          text={textBlockData.text}
          posX={textBlockData.posX}
          posY={textBlockData.posY}
        />
      ))}
    </div>
  );
}

export default Field;
