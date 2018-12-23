// @flow

// $FlowFixMe
import React, { useState, useEffect } from 'react';
import Field from './Field';
import { PlayButton } from './Button';
import gameConfig from '../../data/typings/game-conf';
import sampleData from '../../data/typings/sample';
import './game.css';
import { InputBlock, TextBlock } from './Blocks';

export const ConfigContext = React.createContext(gameConfig);

const TEXT_REGEX = /[a-z]/i;

export type BlockType = {
  id: number,
  text: string,
  posX: number,
  posY: number,
};

export default function Game() {
  const [playing, setPlaying] = useState(true);
  const handlePlayButtonClick = () => {
    setPlaying(!playing);
  };

  const [tick, setTick] = useState(1);
  const [throttling, setThrottling] = useState(false);
  const updateTick = () => {
    setTick(tick === gameConfig.fps ? 1 : tick + 1);
  };
  const updateThrottling = () => {
    setThrottling(true);
    setTimeout(() => {
      setThrottling(false);
    }, gameConfig.tickRate);
  };

  const [textBlocks, setTextBlocks] = useState(sampleData);
  const moveBlocksDown = () => {
    setTextBlocks(
      textBlocks.map(block => ({ ...block, posY: block.posY + 1 })),
    );
  };

  useEffect(() => {
    if (playing && !throttling) {
      updateTick();
      moveBlocksDown();
      updateThrottling();
    }
  });

  const [inputText, setInputText] = useState('');
  const updateInputText = (e: SyntheticKeyboardEvent<HTMLElement>) => {
    if (e.key === 'Backspace' || e.key === 'Enter') {
      setInputText('');
    } else if (e.key.length === 1 && TEXT_REGEX.test(e.key)) {
      setInputText(inputText + e.key.toLowerCase());
    }
  };
  useEffect(() => {
    if (playing) {
      window.addEventListener('keypress', updateInputText);
    }

    return () => {
      window.removeEventListener('keypress', updateInputText);
    };
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
          {textBlocks.map(block => (
            <TextBlock
              key={block.id}
              text={block.text}
              posX={block.posX}
              posY={block.posY}
            />
          ))}
          <InputBlock text={inputText} />
        </Field>
      </div>
    </ConfigContext.Provider>
  );
}
