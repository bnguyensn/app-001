// @flow

// $FlowFixMe
import React, { useEffect, useState, useContext } from 'react';
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
};

function useTick() {
  const gameConfig = useContext(ConfigContext);

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
      <TextBlock text="understandings" posX={50} posY={posY} />
    </div>
  );
}

export default Field;
