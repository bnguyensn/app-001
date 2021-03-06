// @flow

import * as React from 'react';
import TodoCardTDLI from './TodoCardTDLI';
import OptionsPanel from './OptionsPanel';
import TodoEdit from './TodoEdit';
import type { TodoData, TDLIData } from './TodoTypes';

import { getTodo, getAllTodoListItems } from '../../api/indexedDB/readIDB';
import { putTodo, putTodoListItem } from '../../api/indexedDB/addItemsIDB';

/** ********** TO-DO CARD (EMPTY CONTENT) ********** **/

function EmptyCard() {
  return <li>There doesn&#39;t seem to be anything here.</li>;
}

/** ********** TO-DO CARD ********** **/

type TodoCardProps = {
  tdId: string,
  logNewMsg: (msg: string) => void,
  handleSelfRemoval: (todoId: string) => Promise<string>,
};

type TodoCardStates = {
  tdTitle: string,
  tdColor: string,
  tdliIds: string[], // Need this to ensure tdlis are in the correct order
  tdliData: { [key: string]: TDLIData }, // key = tdli database key
  editing: boolean, // While editing, To-do Card is hidden and To-do Edit is visible
};

export default class TodoCard extends React.PureComponent<
  TodoCardProps,
  TodoCardStates,
> {
  constructor(props: TodoCardProps) {
    super(props);
    this.state = {
      tdTitle: '',
      tdColor: '#EEEEEE',
      tdliIds: [],
      tdliData: {},
      editing: false,
    };
  }

  componentDidMount() {
    this.syncWithDb();
  }

  /** ********** DATABASE METHODS ********** **/

  /**
   * Update the whole To-do Card to match database data
   * */
  syncWithDb = async () => {
    const { tdId, logNewMsg } = this.props;

    try {
      // Fetch to-do data and todoListItem data from database
      const tdDataPromise = getTodo(tdId);
      const tdliDataPromise = getAllTodoListItems(tdId, 'all');
      const tdDataRes = await tdDataPromise;
      const tdliDataRes = await tdliDataPromise;

      // Prepare state data that will match database data
      const tdliIds = [];
      const tdliValuesArr = [];
      tdliDataRes.forEach(tdliData => {
        tdliIds.push(tdliData[0]);
        tdliValuesArr.push(tdliData[1]);
      });
      const tdliData = {};
      tdliIds.forEach((tdliKey, index) => {
        tdliData[tdliKey] = {};
        tdliData[tdliKey].done = tdliValuesArr[index].done;
        tdliData[tdliKey].desc = tdliValuesArr[index].description;
      });

      // Log
      logNewMsg(`To-do Card #${tdId} initialised.`);

      // Update state
      this.setState({
        tdTitle: tdDataRes.title,
        tdColor: tdDataRes.color,
        tdliIds,
        tdliData,
      });
    } catch (e) {
      logNewMsg(e);
    }
  };

  /**
   * Update database with current To-do Card data
   * */
  syncToDB = async (tdData: TodoData) => {
    const { logNewMsg } = this.props;
    const { tdId, tdTitle, tdColor, tdliIds, tdliData } = tdData;

    console.log(`Passed tdData: ${JSON.stringify(tdData)}`);

    try {
      // Prepare database data
      const tdObj = {
        title: tdTitle,
        color: tdColor,
      };
      const tdliObj = tdliIds.map(tdliId => ({
        todoId: tdId,
        description: tdliData[tdliId].desc,
        done: tdliData[tdliId].done,
      }));

      console.log(`tdObj: ${JSON.stringify(tdObj)}`);
      console.log(`tdliObj: ${JSON.stringify(tdliObj)}`);

      // Database put operation
      const tdDataPromise = putTodo(tdObj, tdId);
      const tdliDataPromise = putTodoListItem(tdliObj, tdliIds);
      const res = await Promise.all([tdDataPromise, tdliDataPromise]);

      // Log
      res.forEach((promiseRes, index) => {
        logNewMsg(
          `syncToDB() promise #${index} finished with result: ${JSON.stringify(
            promiseRes,
          )}`,
        );
      });

      // Re-sync with database?
      // this.syncWithDb();
    } catch (e) {
      logNewMsg(e);
    }
  };

  /** ********** DOM METHODS ********** **/

  /**
   * Update To-do Card data to whatever is passed from To-do Edit
   * */
  syncToTodoEdit = (tdData: TodoData) => {
    const { tdTitle, tdColor, tdliIds, tdliData } = tdData;

    // Update state
    this.setState({
      tdTitle,
      tdColor,
      tdliIds,
      tdliData,
    });
  };

  /**
   * Update To-do color in database as well as the DOM
   * */
  handleColorChange = async (tdId: string, newValue: string) => {
    const { logNewMsg } = this.props;
    const { tdTitle } = this.state;

    try {
      // Update state
      this.setState({
        tdColor: newValue,
      });

      // Prepare database data
      const newTdValues = {
        title: tdTitle,
        color: newValue,
      };

      // Database put operation
      await putTodo(newTdValues, tdId);

      // Log
      logNewMsg(`To-do Card #${tdId}'s color updated.`);
    } catch (e) {
      logNewMsg(e);
    }
  };

  /**
   * Update To-do List Item done status in database as well as the DOM
   * */
  handleTdliDoneChange = async (tdliId: string, newValue: boolean) => {
    const { tdId, logNewMsg } = this.props;
    const { tdliData } = this.state;
    const { desc: description } = tdliData[tdliId];

    console.log(`handleTdliDoneChange: description: ${description}`);

    try {
      // Prepare data to be put into database
      const newTdliValues = {
        todoId: tdId,
        done: newValue,
        description,
      };

      // Database put operation
      await putTodoListItem(newTdliValues, tdliId);

      // Log
      logNewMsg(
        `To-do List Item #${tdliId}'s done status (To-do #${tdId}) updated.`,
      );

      // Update state
      this.setState(prevState => ({
        tdliData: {
          ...prevState.tdliData,
          ...{ [tdliId]: { done: newValue, desc: description } },
        },
      }));
    } catch (e) {
      logNewMsg(e);
    }
  };

  /** ********** TO-DO EDIT ********** **/

  openTodoEdit = () => {
    this.setState({
      editing: true,
    });
  };

  closeTodoEdit = () => {
    this.setState({
      editing: false,
    });
  };

  finishEditing = (tdData: TodoData) => {
    this.closeTodoEdit();
    this.syncToTodoEdit(tdData);
    this.syncToDB(tdData);
  };

  handleTodoCardKeyPress = (e: SyntheticKeyboardEvent<>) => {
    if (e.key === 'Enter') {
      this.openTodoEdit();
    }
  };

  /** ********** MISC. ********** **/

  handleFocus = () => {
    const { tdId } = this.props;
    console.log(`To-do card ${tdId} is focused.`);
  };

  /** ********** RENDER ********** **/

  render() {
    const { tdId, handleSelfRemoval } = this.props;
    const { tdTitle, tdColor, tdliIds, tdliData, editing } = this.state;

    const todoCardHiddenCls = editing ? 'hidden-vis' : '';

    const tdlis = tdliIds.map(tdliKey => {
      const tdliDone = tdliData[tdliKey].done;
      const tdliDesc = tdliData[tdliKey].desc;

      return (
        <TodoCardTDLI
          key={tdliKey}
          tdliId={tdliKey}
          tdliDone={tdliDone}
          tdliDesc={tdliDesc}
          handleTdliDoneChange={this.handleTdliDoneChange}
        />
      );
    });

    return (
      <div
        className={`todo-card ${todoCardHiddenCls}`}
        role="button"
        tabIndex={0}
        style={{ backgroundColor: tdColor }}
        onClick={this.openTodoEdit}
        onKeyPress={this.handleTodoCardKeyPress}
        onFocus={this.handleFocus}
      >
        <div className="todo-card-title">{tdTitle}</div>
        <ul className="todo-card-list-items">
          {tdlis.length > 0 ? tdlis : <EmptyCard />}
        </ul>
        <OptionsPanel
          tdId={tdId}
          removeTodo={handleSelfRemoval}
          changeColor={this.handleColorChange}
        />
        <TodoEdit
          hidden={!editing}
          tdId={tdId}
          tdTitle={tdTitle}
          tdColor={tdColor}
          tdliData={tdliData}
          handleFinishEditing={this.finishEditing}
        />
      </div>
    );
  }
}
