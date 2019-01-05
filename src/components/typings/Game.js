// @flow

// $FlowFixMe
import React, { useState, useEffect, useLayoutEffect } from 'react';
import Field from './components/Field';
import Panel from './components/Panel';
import { PlayButton } from './components/Button';
import { InputBlock, TextBlock } from './components/Blocks';
import randIntBtw from '../../utils/randIntBtw';
import gameConfig from '../../data/typings/game-conf';
import sampleData from '../../data/typings/sample';
import wordsData from '../../data/typings/words-1';
import './game.css';

export const ConfigContext = React.createContext(gameConfig);

const TEXT_REGEX = /[a-z']/i;

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

  /** ********** KEEPING SCORES ********** **/

  const [score, setScore] = useState(0);

  /** ***** Layout ***** **/

  const [fieldWidth, setFieldWidth] = useState();
  const [fieldHeight, setFieldHeight] = useState();
  useLayoutEffect(
    () => {
      const fieldRect = document.getElementById('field');
      if (fieldRect) {
        setFieldWidth(fieldRect.getBoundingClientRect().width);
        setFieldHeight(fieldRect.getBoundingClientRect().height);
      }
    },
    [window.innerWidth],
  );

  const [texts, setTexts] = useState(
    sampleData.map(d => ({
      id: d.id,
      text: d.text,
      matchedText: '',
    })),
  );

  const [textPos, setTextPos] = useState(
    sampleData.map(d => ({
      id: d.id,
      posX: d.posX,
      posY: d.posY,
    })),
  );

  const moveBlocksDown = () => {
    // Create an array to hold potential new texts (which happen when a text
    // reaches the end without being cleared
    const newTexts = [];

    // Update text positions
    setTextPos(
      textPos.map((pos, i) => {
        if (pos.posY >= fieldHeight) {
          newTexts.push(i);
          return {
            ...pos,
            posY: 0,
          };
        }
        return { ...pos, posY: pos.posY + 1 };
      }),
    );

    // Create new texts if applicable
    // Also update score
    if (newTexts.length > 0) {
      const penalty = newTexts.reduce(
        (acc, cur) => acc + texts[cur].text.length,
        0,
      );

      setScore(score - penalty);

      setTexts(
        texts.map((text, i) => {
          if (newTexts.includes(i)) {
            return {
              id: text.id,
              text: getNewText(),
              matchedText: '',
            };
          }
          return {
            ...text,
          };
        }),
      );
    }
  };

  /** ***** Run logic ***** **/

  useEffect(() => {
    if (playing && !throttling) {
      updateTick();
      moveBlocksDown();
      updateThrottling();
    }
  });

  /** ********** USER INTERACTIONS ********** **/

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
                    posX:
                      tPosIndex === i ? randIntBtw(90, 10) / 100 : tPos.posX,
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
