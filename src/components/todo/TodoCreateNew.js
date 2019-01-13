// @flow

import * as React from 'react';
import TodoCreateNewTDLI from './TodoCreateNewTDLI';
import TextEdit from './TextEdit';
import OptionsPanel from './OptionsPanel';
import type { TDLIData } from './TodoTypes';

import { elChildOfClass } from '../../utils/classes';

import { addTodo, addTodoListItem } from '../../api/indexedDB/addItemsIDB';

type TodoCreateNewProps = {
  logger: (msg: string) => void,
  dbSync: () => Promise<string>,
  reset: () => void,
};

type TodoCreateNewStates = {
  tdColor: string,
  tdliIds: string[],
};

export default class TodoCreateNew extends React.PureComponent<
  TodoCreateNewProps,
  TodoCreateNewStates,
> {
  tdTitle: string;
  tdliData: { [key: string]: TDLIData };
  fakeTdliIdsCount: number;
  forceResetNoDataSave: boolean; // See method resetNoDataSave()

  constructor(props: TodoCreateNewProps) {
    super(props);
    this.tdTitle = '';
    this.tdliData = {};
    this.fakeTdliIdsCount = 0;
    this.forceResetNoDataSave = false;

    const firstTdliId = this.getNewKey();
    this.tdliData[firstTdliId] = {
      done: false,
      desc: '',
    };

    this.state = {
      tdColor: '#EEEEEE',
      tdliIds: [firstTdliId],
    };
  }

  /** ********** LIFECYCLE *********** **/

  async componentWillUnmount() {
    const { logger, dbSync } = this.props;

    if (!this.forceResetNoDataSave) {
      const res = await this.saveTdToDB();
      if (logger) {
        if (res instanceof Error) {
          logger(res);
        } else {
          logger(res.msg);
        }
      }

      if (Object.entries(res.data).length !== 0 || res instanceof Error) {
        const resDbSync = await dbSync();
        if (logger) {
          logger(resDbSync);
        }
      }
    }
  }

  /** ********** DATABASE *********** **/

  /**
   * Save all data in To-do Create New to database
   * */
  saveTdToDB = async () => {
    try {
      if (this.checkNoChanges()) {
        return {
          msg: '',
          data: {},
        };
      }

      const { tdliIds, tdColor } = this.state;

      if (this.checkEmptyTdliValues()) {
        if (this.checkEmptyTdTitle()) {
          // No TD and TDLI data

          return {
            msg: '',
            data: {},
          };
        }

        // TD data exists, but no TDLI

        const tdToAdd = {
          title: this.tdTitle,
          color: tdColor,
        };
        const addedtdId = (await addTodo(tdToAdd)).data;

        return {
          msg: `Added todo #${addedtdId}`,
          data: {
            tdId: addedtdId,
            tdliIds: null,
          },
        };
      }

      // TDLI data exists, doesn't matter whether TD data exists

      const tdToAdd = {
        title: this.tdTitle,
        color: tdColor,
      };
      const addedTdId = (await addTodo(tdToAdd)).data;

      const tdlisToAdd = tdliIds.reduce((res, tdliId, index) => {
        if (index < tdliIds.length - 1) {
          const tdliToAdd = {
            todoId: addedTdId,
            done: this.tdliData[tdliId].done,
            description: this.tdliData[tdliId].desc,
          };
          res.push(tdliToAdd);
        }
        return res;
      }, []);
      const addedTdliIds = (await addTodoListItem(tdlisToAdd)).data;

      return {
        msg: `Added todo #${addedTdId} and todoListItems #[${addedTdliIds}]`,
        data: {
          tdId: addedTdId,
          tdliIds: addedTdliIds,
        },
      };
    } catch (e) {
      return e;
    }
  };

  /** ********** FUNCTIONALITY *********** **/

  handleTdTitleInput = (tdId: string, newValue: string, textEditEl: Node) => {};

  handleTdTitleBlur = (tdId: string, newValue: string, textEditEl: Node) => {
    this.tdTitle = newValue;
  };

  handleTdColorChange = (tdId: string, newValue: string) => {
    this.setState({
      tdColor: newValue,
    });
  };

  handleTdliDoneChange = (tdliId: string, newValue: boolean) => {
    this.tdliData[tdliId].done = newValue;
  };

  handleTdliDescInput = (
    tdliId: string,
    newValue: string,
    textEditEl: Node,
  ) => {
    // Add new TDLI if applicable
    const tdliEl = textEditEl.parentNode;
    if (tdliEl && this.isTdliLastItem(tdliEl)) {
      this.addNewTdli();
    }
  };

  handleTdliDescBlur = (tdliId: string, newValue: string, textEditEl: Node) => {
    this.tdliData[tdliId].desc = newValue;
  };

  handleSelfBlur = (e: SyntheticFocusEvent<>) => {
    e.stopPropagation();

    const { reset } = this.props;

    if (
      !e.relatedTarget ||
      !elChildOfClass(e.relatedTarget, 'todo-create-new')
    ) {
      reset();
    }
  };

  /** ********** MISC. *********** **/

  resetNoDataSave = () => {
    const { reset } = this.props;

    this.forceResetNoDataSave = true;
    reset();
  };

  getNewKey = (): string => {
    const key = `key${this.fakeTdliIdsCount}`;
    this.fakeTdliIdsCount += 1;
    return key;
  };

  addNewTdli = () => {
    const newtdliId = this.getNewKey();
    this.tdliData[newtdliId] = {
      done: false,
      desc: '',
    };
    this.setState(prevState => ({
      tdliIds: [...prevState.tdliIds, newtdliId],
    }));
  };

  isTdliLastItem = (tdliEl: Node) => {
    if (tdliEl && tdliEl.parentNode) {
      return tdliEl.parentNode.lastChild === tdliEl;
    }
    return false;
  };

  checkEmptyTdTitle = () => this.tdTitle === '';

  checkEmptyTdliValues = () => {
    const { tdliIds } = this.state;
    return tdliIds.every(tdliId => this.tdliData[tdliId].desc === '');
  };

  /**
   * Empty title and empty To-do List Item descriptions
   * */
  checkNoChanges = () => {
    const { tdliIds } = this.state;
    return this.checkEmptyTdTitle() && tdliIds.length <= 1;
  };

  /** ********** RENDER *********** **/

  render() {
    const { tdliIds, tdColor } = this.state;

    const tdlis = tdliIds.map((tdliId, index) => {
      const tdliDone = this.tdliData[tdliId].done;
      const tdliDesc = this.tdliData[tdliId].desc;

      return (
        <TodoCreateNewTDLI
          key={tdliId}
          tdliId={tdliId}
          tdliDone={tdliDone}
          tdliDesc={tdliDesc}
          handleTdliDoneChange={this.handleTdliDoneChange}
          handleTdliDescInput={this.handleTdliDescInput}
          handleTdliDescBlur={this.handleTdliDescBlur}
          lastItem={index === tdliIds.length - 1}
        />
      );
    });

    return (
      <div
        className="todo-create-new"
        style={{ backgroundColor: tdColor }}
        role="menuitem"
        tabIndex={0}
        onBlur={this.handleSelfBlur}
      >
        <TextEdit
          className="todo-edit-title"
          id=""
          handleInput={this.handleTdTitleInput}
          handleBlur={this.handleTdTitleBlur}
        />
        <ul className="todo-edit-list-items">{tdlis}</ul>
        <OptionsPanel
          tdId=""
          removeTodo={this.resetNoDataSave}
          changeColor={this.handleTdColorChange}
        />
      </div>
    );
  }
}
