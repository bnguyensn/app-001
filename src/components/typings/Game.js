// @flow

import * as React from 'react';
import Field from './Field';
import sampleData from '../../data/typings/sample';
import gameConfig from '../../data/typings/game-conf';
import './game.css';

export const ConfigContext = React.createContext(gameConfig);

export default function Game() {
  return (
    <div className="game">
      <ConfigContext.Provider value={gameConfig}>
        <Field textBlocksData={sampleData} />
      </ConfigContext.Provider>
    </div>
  );
}
