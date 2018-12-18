// @flow

// $FlowFixMe
import React, { useState, useEffect } from 'react';
import Field from './Field';
import { PlayButton } from './Button';
import gameConfig from '../../data/typings/game-conf';
import sampleData from '../../data/typings/sample';
import './game.css';
import TextBlock from './TextBlock';

export const ConfigContext = React.createContext(gameConfig);

export type BlockType = {
  id: number,
  text: string,
  posX: number,
  posY: number,
};

export default function Game() {
  const [tick, setTick] = useState(1);
  const [throttling, setThrottling] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [blocks, setBlocks] = useState(sampleData);

  const updateThrottling = () => {
    setThrottling(true);
    setTimeout(() => {
      setThrottling(false);
    }, gameConfig.tickRate);
  };

  const updateTick = () => {
    setTick(tick === gameConfig.fps ? 1 : tick + 1);
  };

  const moveBlocksDown = () => {
    setBlocks(blocks.map(block => ({ ...block, posY: block.posY + 1 })));
  };

  const handlePlayButtonClick = () => {
    setPlaying(!playing);
  };

  //const [tick, T] = useTick(playing, moveBlocksDown);
  useEffect(() => {
    if (playing && !throttling) {
      updateTick();
      moveBlocksDown();
      updateThrottling();
    }
  });

  return (
    <ConfigContext.Provider value={gameConfig}>
      <div className="game">
        <Field tick={tick} textBlocksData={sampleData}>
          <PlayButton
            action={handlePlayButtonClick}
            playing={playing}
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
            }}
          />
          {tick}fps
          {blocks.map(block => (
            <TextBlock
              key={block.id}
              text={block.text}
              posX={block.posX}
              posY={block.posY}
            />
          ))}
        </Field>
      </div>
    </ConfigContext.Provider>
  );
}
