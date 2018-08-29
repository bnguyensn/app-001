// @flow

import * as React from 'react';
import TodoListItemEdit from './TodoListItemEdit';
import {getTodo, getAllTodoListItems} from '../api/indexedDB/readIDB';
import MaterialIcon from './MaterialIcon';

type DBKeyData = {
    todoId: ?string,
    todoListItemIds: ?(string[]),
};

type DBValueData = {
    tdTitle: string,
    tdliData: {},
};

type TodoEditProps = {
    dbKeyData: DBKeyData,
    dbValueData: DBValueData,
    handleTdTitleUpdate: (todoId: ?string, newValue: string) => void,
    handleTdliDoneUpdate: (todoListItemId: ?string, newValue: boolean) => void,
    handleTdliDescUpdate: (todoListItemId: ?string, newValue: string) => void,
};

/**
 * The title element is uncontrolled because React does not work well
 * with contenteditable. See https://github.com/facebook/react/issues/2047.
 * Alternatively, one can use https://draftjs.org.
 * */
export default class TodoEdit extends React.PureComponent<TodoEditProps, {}> {
    titleEl: { current: null | HTMLDivElement };
    keysCount: number;

    static defaultProps = {
        dbKeyData: {todoId: undefined, todoListItemId: undefined},
        dbValueData: {tdliDone: false, tdliDesc: ''},
    };

    constructor(props: TodoEditProps) {
        super(props);
        this.titleEl = React.createRef();
        this.keysCount = 0;
    }

    componentDidMount() {
        const {dbKeyData, dbValueData, handleTdliDoneUpdate, handleTdliDescUpdate} = this.props;
        const {todoId, todoListItemIds} = dbKeyData;
        const {tdTitle, tdliData} = dbValueData;

        if (this.titleEl.current) {
            this.titleEl.current.textContent += tdTitle;
        }

        const dbTdliEls = todoListItemIds.map((todoListItemId) => {
            const dbKeyDataToPass = {todoId, todoListItemId};
            const dbValueDataToPass = {
                tdliDone: tdliData[todoListItemId].done,
                tdliDesc: tdliData[todoListItemId].desc,
            };
            return (
                <TodoListItemEdit key={this.getNewKey()}
                                  dbKeyData={dbKeyDataToPass}
                                  dbValueData={dbValueDataToPass}
                                  handleTdliDoneUpdate={handleTdliDoneUpdate}
                                  handleTdliDescUpdate={handleTdliDescUpdate} />
            )
        });

        dbTdliEls.push(
            <TodoListItemEdit key={this.getNewKey()}
                              handleTdliDoneUpdate={handleTdliDoneUpdate}
                              handleTdliDescUpdate={handleTdliDescUpdate} />,
        );
    }

    // Can't use database primary keys of todoListItems as key because we have a
    // blank <TodoListItem /> in todoListItems. Thus we generate unique keys
    // based on a global counter (global = with respect to this <TodoEdit />
    // instance.
    getNewKey = () => {
        const key = `key${this.keysCount}`;
        this.keysCount += 1;
        return key
    };

    getTdTitle = () => {
        if (this.titleEl.current) {
            return this.titleEl.current.textContent
        }
        return ''
    };

    handleTdTitleUpdate = () => {
        const {dbKeyData, handleTdTitleUpdate} = this.props;
        const {todoId} = dbKeyData;

        handleTdTitleUpdate(todoId, this.getTdTitle());
    };

    render() {
        return (
            <div className="todo-edit">
                <div className="todo-edit-title"
                     placeholder="Title"
                     contentEditable
                     onInput={this.handleTdTitleUpdate}
                     ref={this.titleEl} />
                <ul className="todo-list-items">
                    {todoListItems.length > 0 ? todoListItems : null}
                </ul>
                <div className="todo-card-options-panel">
                    <MaterialIcon className="todo-card-options-panel-btn md-dark"
                                  icon="delete" />
                    <MaterialIcon className="todo-card-options-panel-btn md-dark"
                                  icon="color_lens" />
                </div>
            </div>
        )
    }
}
