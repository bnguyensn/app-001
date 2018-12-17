// @flow

// $FlowFixMe
import React, { useState, useEffect } from 'react';
import Field from './Field';
import { PlayButton } from './Button';
import gameConfig from '../../data/typings/game-conf';
import sampleData from '../../data/typings/sample';
import './game.css';

export const ConfigContext = React.createContext(gameConfig);

function useTick(playing: boolean) {
  let T = null;

  const [tick, setTick] = useState(1);

  useEffect(() => {
    T = window.setTimeout(() => {
      // Update if playing
      if (playing) {
        // Update frame
        setTick(tick === gameConfig.fps ? 1 : tick + 1);
      }
    }, gameConfig.tickRate);

    return () => {
      window.clearInterval(T);
    };
  });

  return [tick, T];
}

export default function Game() {
  const [playing, setPlaying] = useState(true);

  const [tick, T] = useTick(playing);

  const handlePlayButtonClick = () => {
    setPlaying(!playing);
    window.clearInterval(T);
  };

  return (
    <ConfigContext.Provider value={gameConfig}>
      <div className="game">
        <Field tick={tick} textBlocksData={sampleData}>
          <PlayButton action={handlePlayButtonClick} playing={playing} />
          {tick}fps
        </Field>
      </div>
    </ConfigContext.Provider>
  );
}
