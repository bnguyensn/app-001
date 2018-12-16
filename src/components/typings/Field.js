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

function useTick() {
  let T = null;

  const [tick, setTick] = useState(1);
  const [posY, setPosY] = useState(0);

  useEffect(() => {
    T = window.setTimeout(() => {
      // Update timer
      setTick(tick === 60 ? 1 : tick + 1);

      // Update blocks
      setPosY(posY + 1);
    }, 41.67);

    return () => {
      window.clearInterval(T);
    };
  });

  return [tick, posY, T];
}

function Field(props: FieldProps) {
  const { textBlocksData } = props;

  const [tick, posY, T] = useTick();

  return (
    <div className="field">
      Tick: {tick}
      posY: {posY}
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
