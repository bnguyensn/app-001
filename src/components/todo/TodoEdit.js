// @flow

import * as React from 'react';
import TodoEditTDLI from './TodoEditTDLI';
import TextEdit from './TextEdit';
import OptionsPanel from './OptionsPanel';
import type { TodoData, TDLIData } from './TodoTypes';

import { putTodo, putTodoListItem } from '../../api/indexedDB/addItemsIDB';

import './css/todo-edit.css';

/** ********** TO-DO EDIT ********** **
 * Each To-do Card has its own To-do Edit window
 */

type tdliDataPropsType = { [key: string]: { done: boolean, desc: string } }; // key = real tdli database key

export type TodoEditProps = {
  hidden: boolean,
  tdId: string,
  tdTitle: string,
  tdColor: string,
  tdliData: tdliDataPropsType, // key = real tdli database key
  handleSelfRemoval?: () => void,

  // After editing finishes, we save data to the database
  handleFinishEditing: (todoData: TodoData) => void,
};

type TodoEditStates = {
  // Nothing here for now...
};

export default class TodoEdit extends React.PureComponent<
  TodoEditProps,
  TodoEditStates,
> {
  tdTitle: string;
  tdColor: string;
  tdliData: { [key: string]: { tdliId: string, done: boolean, desc: string } }; // key = fake tdli key
  fakeTdliIdsCount: number;

  constructor(props: TodoEditProps) {
    super(props);
    this.tdTitle = props.tdTitle;
    this.tdColor = props.tdColor;
    this.tdliData = {};
    this.fakeTdliIdsCount = 0;

    // Initialise this.tdliData with props data
    const tdliIds = Object.keys(props.tdliData);
    tdliIds.forEach(tdliId => {
      const { done, desc } = props.tdliData[tdliId];
      const fakeTdliId = this.getNewFakeTdliId();

      this.tdliData[fakeTdliId] = { tdliId, done, desc };
    });
  }

  componentDidUpdate(
    prevProps: TodoEditProps,
    prevState: TodoEditStates,
    snapshot: any,
  ) {
    const { tdColor, tdliData } = this.props;
    const { tdColor: prevTdColor } = prevProps;

    // ********** UNCONTROLLED TD COLOR ********** //

    if (tdColor !== prevTdColor) {
      this.tdColor = tdColor;
    }

    // ********** UNCONTROLLED TDLI DATA ********** //

    // Reset this.tdliData
    this.resetTdliData();

    // Align this.tdliData with props data
    const tdliIds = Object.keys(tdliData);
    tdliIds.forEach(tdliId => {
      const { done, desc } = tdliData[tdliId];
      const fakeTdliId = this.getNewFakeTdliId();

      this.tdliData[fakeTdliId] = { tdliId, done, desc };
    });

    // Add the empty "create new" TDLI
    this.tdliData[this.getNewFakeTdliId()] = {
      tdliId: '',
      done: false,
      desc: '',
    };
  }

  /** ********** MISC. ********** **/

  getNewFakeTdliId = (): string => {
    const key = `key${this.fakeTdliIdsCount}`;
    this.fakeTdliIdsCount += 1;
    return key;
  };

  addNewTdli = () => {
    const newTdliKey = this.getNewFakeTdliId();
    this.tdliData[newTdliKey] = {
      tdliId: '',
      done: false,
      desc: '',
    };

    this.forceUpdate();
  };

  isTdliLastItem = (tdliEl: Node) => {
    if (tdliEl && tdliEl.parentNode) {
      return tdliEl.parentNode.lastChild === tdliEl;
    }
    return false;
  };

  resetTdliData = () => {
    this.tdliData = {};
    this.fakeTdliIdsCount = 0;
  };

  /** ********** INPUT HANDLING ********** **
   * All contenteditable elements are uncontrolled
   * */

  handleTdTitleInput = (tdId: string, newValue: string, textEditEl: Node) => {
    this.tdTitle = newValue;
  };

  handleColorChange = (tdId: string, newValue: string) => {
    this.tdColor = newValue;
    this.forceUpdate();
  };

  handleTdliDoneChange = (fakeTdliId: string, newValue: boolean) => {
    this.tdliData[fakeTdliId].done = newValue;
  };

  handleTdliDescInput = (
    fakeTdliId: string,
    newValue: string,
    textEditEl: Node,
  ) => {
    this.tdliData[fakeTdliId].desc = newValue;

    // Add new TDLI if applicable
    const tdliEl = textEditEl.parentNode;
    if (tdliEl && this.isTdliLastItem(tdliEl)) {
      this.addNewTdli();
    }
  };

  /** ********** FINISH EDITING ********** **/

  getCurrentData = (): TodoData => {
    const { tdId } = this.props;
    const fakeTdliIds = Object.keys(this.tdliData);

    const tdliIds = [];
    const tdliData = {};
    fakeTdliIds.forEach((fakeTdliId, index) => {
      if (index < fakeTdliIds.length - 1) {
        const { tdliId, done, desc } = this.tdliData[fakeTdliId];

        tdliIds.push(tdliId);
        tdliData[tdliId] = {};
        tdliData[tdliId].done = done;
        tdliData[tdliId].desc = desc;
      }
    });

    return {
      tdId,
      tdTitle: this.tdTitle,
      tdColor: this.tdColor,
      tdliIds,
      tdliData,
    };
  };

  handleFinishEditing = () => {
    const { handleFinishEditing } = this.props;
    handleFinishEditing(this.getCurrentData());
  };

  /** ********** SELF-REMOVAL ********** **/

  /**
   * Happens when the 'Delete' button in the Options Panel is clicked
   * */
  handleSelfRemoval = () => {
    const { handleSelfRemoval } = this.props;
    if (handleSelfRemoval) {
      handleSelfRemoval();
    }
  };

  /** ********** RENDER ********** **/

  render() {
    const { hidden, tdId, tdTitle } = this.props;
    const fakeTdliIds = Object.keys(this.tdliData);

    const hiddenCls = hidden ? 'hidden' : '';

    // Generate TDLI elements
    const tdlis = fakeTdliIds.map((fakeTdliId, index) => {
      const { done, desc } = this.tdliData[fakeTdliId];

      return (
        <TodoEditTDLI
          key={fakeTdliId}
          fakeTdliId={fakeTdliId}
          tdliDone={done}
          tdliDesc={desc}
          handleTdliDoneChange={this.handleTdliDoneChange}
          handleTdliDescInput={this.handleTdliDescInput}
          lastItem={index === fakeTdliIds.length - 1}
        />
      );
    });

    return (
      <div
        className={`todo-edit ${hiddenCls}`}
        style={{ backgroundColor: this.tdColor, visibility: 'visible' }}
      >
        <TextEdit
          id={tdId}
          className="todo-edit-title"
          initText={tdTitle}
          handleInput={this.handleTdTitleInput}
        />
        <ul className="todo-edit-list-items">{tdlis}</ul>
        <OptionsPanel
          tdId={tdId}
          removeTodo={this.handleSelfRemoval}
          changeColor={this.handleColorChange}
          close={this.handleFinishEditing}
        />
      </div>
    );
  }
}
