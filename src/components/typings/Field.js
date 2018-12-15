// @flow

// $FlowFixMe
import React, { useEffect, useState } from 'react';
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

function updateField() {}

function useTick() {
  let T = null;

  // $FlowFixMe
  const [tick, setTick] = useState(1);

  // $FlowFixMe
  // Start the timer
  useEffect(() => {
    T = window.setTimeout(() => {
      setTick(tick === 60 ? 1 : tick + 1);
    }, 16.67);

    return () => {
      window.clearInterval(T);
    };
  });

  return [tick, T];
}

function Field(props: FieldProps) {
  const { textBlocksData } = props;

  const [tick, T] = useTick();

  return (
    <div className="field">
      Tick: {tick}
      <br />
      <br />
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
