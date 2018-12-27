// @flow

// $FlowFixMe
import React, { useState, useEffect, useLayoutEffect } from 'react';
import Field from './Field';
import { PlayButton } from './Button';
import gameConfig from '../../data/typings/game-conf';
import sampleData from '../../data/typings/sample';
import './game.css';
import { InputBlock, TextBlock } from './Blocks';

export const ConfigContext = React.createContext(gameConfig);

const TEXT_REGEX = /[a-z]/i;

export default function Game() {
  /** ********** AUTOMATIC BACKGROUND PROGRESS ********** **/

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

  const [texts, setTexts] = useState(
    sampleData.map(d => ({
      id: d.id,
      text: d.text,
    })),
  );

  const [fieldWidth, setFieldWidth] = useState(0);
  useLayoutEffect(
    () => {
      const fieldRect = document.getElementById('field');
      if (fieldRect) {
        setFieldWidth(fieldRect.getBoundingClientRect().width);
      }
    },
    [window.innerWidth],
  );

  const [textPos, setTextPos] = useState(
    sampleData.map(d => {
      return {
        id: d.id,
        posX: d.posX,
        posY: d.posY,
      };
    }),
  );
  const moveBlocksDown = () => {
    setTextPos(
      textPos.map(pos => ({
        ...pos,
        posY: pos.posY + 1,
      })),
    );
  };

  useEffect(() => {
    if (playing && !throttling) {
      updateTick();
      moveBlocksDown();
      updateThrottling();
    }
  });

  /** ********** USER INTERACTIONS ********** **/

  const [inputText, setInputText] = useState('');
  const [matchedTexts, setMatchedTexts] = useState(
    sampleData.map(d => ({ id: d.id, text: '' })),
  );

  const updateInputText = (e: SyntheticKeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      // Reset game states
      setInputText('');
      setMatchedTexts(sampleData.map(d => ({ id: d.id, text: '' })));
    } else if (e.key.length === 1 && TEXT_REGEX.test(e.key)) {
      const newInputText = inputText + e.key.toLowerCase();
      setInputText(newInputText);
      setMatchedTexts(
        matchedTexts.map((matchedText, i) =>
          newInputText === texts[i].text.slice(0, newInputText.length)
            ? { id: matchedText.id, text: newInputText }
            : { id: matchedText.id, text: '' },
        ),
      );
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

  /** ********** RENDER ********** **/

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
          {texts.map((text, i) => (
            <TextBlock
              key={text.id}
              text={text.text}
              textMatched={matchedTexts[i].text}
              textUnmatched={text.text.slice(
                matchedTexts[i].text.length,
                text.text.length,
              )}
              posX={textPos[i].posX * fieldWidth}
              posY={textPos[i].posY}
            />
          ))}
          <InputBlock text={inputText} />
        </Field>
      </div>
    </ConfigContext.Provider>
  );
}
