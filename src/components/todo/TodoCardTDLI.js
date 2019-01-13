// @flow

import * as React from 'react';
import Checkbox from './Checkbox';

/** ********** TO-DO CARD LIST ITEM ********** **/

type TDLIProps = {
  tdliId: string, // Because there's no TDLI adding functionality in To-do Card, this can be the real tdli id
  tdliDone: boolean,
  tdliDesc: string,

  // This should be a database method, hence the Promise return
  // This is a database method because To-do Card talks to the database directly
  handleTdliDoneChange: (tdliId: string, newValue: boolean) => Promise<void>,
};

export default function TodoCardTDLI(props: TDLIProps) {
  const { tdliId, tdliDone, tdliDesc, handleTdliDoneChange } = props;

  return (
    <li className="todo-card-list-item">
      <div className="todo-card-list-item-checkbox">
        <Checkbox
          fakeTdliId={tdliId}
          checked={tdliDone}
          handleChange={handleTdliDoneChange}
        />
      </div>
      <div className="todo-card-list-item-description">{tdliDesc}</div>
    </li>
  );
}
