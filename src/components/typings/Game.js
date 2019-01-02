// @flow

// $FlowFixMe
import React, { useState, useEffect, useLayoutEffect } from 'react';
import Field from './components/Field';
import { PlayButton } from './components/Button';
import { InputBlock, TextBlock } from './components/Blocks';
import gameConfig from '../../data/typings/game-conf';
import sampleData from '../../data/typings/sample';
import wordsData from '../../data/typings/words-1';
import './game.css';
import Panel from './components/Panel';

export const ConfigContext = React.createContext(gameConfig);

const TEXT_REGEX = /[a-z]/i;

function getNewText(): string {
  return wordsData[Math.floor(Math.random() * wordsData.length)];
}

export default function Game() {
  /** ********** AUTOMATIC BACKGROUND PROGRESS ********** **/

  /** ***** Runner ***** **/

  const [playing, setPlaying] = useState(true);
  const playOrPauseGame = () => {
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

  /** ***** Layout ***** **/

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

  /** ***** Run logic ***** **/

  useEffect(() => {
    if (playing && !throttling) {
      updateTick();
      moveBlocksDown();
      updateThrottling();
    }
  });

  /** ********** KEEPING SCORES ********** **/

  const [score, setScore] = useState(0);

  /** ********** USER INTERACTIONS ********** **/

  const [texts, setTexts] = useState(
    sampleData.map(d => ({
      id: d.id,
      text: d.text,
      matchedText: '',
    })),
  );

  const [inputText, setInputText] = useState('');

  /** ***** Interaction logic ***** **/

  /* LOGIC
  1. User keyboard input when game is NOT paused

  -- Case 'Escape' key
  2. Play / Pause game

  -- Case 'Enter' key
  2. Reset textInput and all highlights

  -- Case alphabet keys
  2. Compare current textInput with all existing text boxes. Only compare up to
     textInput's length
  3. If content and length both match, register the text box as scored
     3.1 The scored text is removed
     3.2 A new text replaces the scored text
  4. If only content matches, highlight applicable text boxes
   */

  const updateInputText = (e: SyntheticKeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') {
      playOrPauseGame();
    } else if (playing) {
      if (e.key === 'Enter') {
        // Reset
        setInputText('');
        setTexts(
          texts.map(text => ({
            ...text,
            matchedText: '',
          })),
        );
      } else if (e.key.length === 1 && TEXT_REGEX.test(e.key)) {
        const newInputText = inputText + e.key.toLowerCase();

        // Update input bar
        setInputText(newInputText);

        // Update text boxes
        setTexts(
          texts.map((text, i) => {
            if (newInputText === text.text.slice(0, newInputText.length)) {
              if (newInputText.length === text.text.length) {
                // A score!
                setScore(score + text.text.length);

                // Reset inputText
                setInputText('');

                // Reset posY of the scored text
                setTextPos(
                  textPos.map((tPos, tPosIndex) => ({
                    ...tPos,
                    posY: tPosIndex === i ? 0 : tPos.posY,
                  })),
                );

                // Replace scored text with new text
                return {
                  id: i,
                  text: getNewText(),
                  matchedText: '',
                };
              } else {
                // Highlight text boxes
                return {
                  ...text,
                  matchedText: newInputText,
                };
              }
            } else {
              // Reset
              return {
                ...text,
                matchedText: '',
              };
            }
          }),
        );
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', updateInputText);

    return () => {
      window.removeEventListener('keydown', updateInputText);
    };
  });

  /** ********** RENDER ********** **/

  return (
    <ConfigContext.Provider value={gameConfig}>
      <div className="game">
        <Panel score={score} fps={tick} wpm={0} />
        <PlayButton action={playOrPauseGame} playing={playing} />
        <Field tick={tick} textBlocksData={sampleData}>
          {texts.map((text, i) => (
            <TextBlock
              key={text.id}
              text={text.text}
              textMatched={text.matchedText}
              textUnmatched={text.text.slice(
                text.matchedText.length,
                text.text.length,
              )}
              posX={textPos[i].posX * fieldWidth}
              posY={textPos[i].posY}
            />
          ))}
        </Field>
        <InputBlock text={inputText} />
      </div>
    </ConfigContext.Provider>
  );
}
