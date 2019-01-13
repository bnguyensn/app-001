// @flow

import * as React from 'react';

import MaterialIcon from './MaterialIcon';
import Checkbox from './Checkbox';
import TextEdit from './TextEdit';

type TDLIProps = {
  tdliId: string,
  tdliDone: boolean,
  tdliDesc: string,
  handleTdliDoneChange: (tdliId: string, newValue: boolean) => void,
  handleTdliDescInput: (
    tdliId: string,
    newValue: string,
    textEditEl: Node,
  ) => void,
  handleTdliDescBlur: (
    tdliId: string,
    newValue: string,
    textEditEl: Node,
  ) => void,
  lastItem: boolean,
};

export default function TodoCreateNewTDLI(props: TDLIProps) {
  const {
    tdliId,
    tdliDone,
    tdliDesc,
    handleTdliDoneChange,
    handleTdliDescInput,
    handleTdliDescBlur,
    lastItem,
  } = props;

  return (
    <li className="todo-edit-list-item">
      {!lastItem ? (
        <MaterialIcon
          className="todo-edit-list-item-dragger md-dark"
          icon="drag_indicator"
        />
      ) : (
        <div style={{ width: '1rem', height: '1rem' }} />
      )}
      <div className="todo-edit-list-item-checkbox">
        <Checkbox
          fakeTdliId={tdliId}
          checked={tdliDone}
          handleChange={handleTdliDoneChange}
        />
      </div>
      <TextEdit
        id={tdliId}
        className="todo-edit-list-item-description"
        initText={tdliDesc}
        handleInput={handleTdliDescInput}
        handleBlur={handleTdliDescBlur}
      />
      {!lastItem ? (
        <MaterialIcon
          className="todo-edit-list-item-deleter md-dark"
          icon="cancel"
        />
      ) : (
        <div style={{ width: '1rem', height: '1rem' }} />
      )}
    </li>
  );
}
