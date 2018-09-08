// @flow

import * as React from 'react';
import Checkbox from './Checkbox';
import TextEdit from './TextEdit';
import MaterialIcon from './MaterialIcon';

import {addTodo, addTodoListItem} from '../api/indexedDB/addItemsIDB';
import OptionsPanel from './OptionsPanel';

type TDLIProps = {
    tdliKey: string,
    tdliDone: boolean,
    tdliDesc: string,
    handleTdliDoneChange: (tdliKey: string, newValue: boolean) => void,
    handleTdliDescInput: (tdliKey: string, newValue: string, textEditEl: Node) => void,
    lastItem: boolean,
};

function TDLI(props: TDLIProps) {
    const {
        tdliKey, tdliDone, tdliDesc,
        handleTdliDoneChange, handleTdliDescInput,
        lastItem,
    } = props;

    return (
        <li className="todo-edit-list-item">
            {!lastItem
                ? (
                    <MaterialIcon className="todo-edit-list-item-dragger md-dark"
                                  icon="drag_indicator" />
                )
                : <div style={{width: '1rem', height: '1rem'}} />
            }
            <div className="todo-edit-list-item-checkbox">
                <Checkbox elKey={tdliKey}
                          checked={tdliDone}
                          handleChange={handleTdliDoneChange} />
            </div>
            <TextEdit textEditKey={tdliKey}
                      className="todo-edit-list-item-description"
                      initText={tdliDesc}
                      handleInput={handleTdliDescInput} />
            {!lastItem
                ? (
                    <MaterialIcon className="todo-edit-list-item-deleter md-dark"
                                  icon="cancel" />)
                : <div style={{width: '1rem', height: '1rem'}} />
            }
        </li>
    )
}

type TodoCreateNewProps = {
    logger?: (msg: string) => void,
    dbSync: () => Promise<string>,
    reset: () => void,
};

type TodoCreateNewStates = {
    tdColor: string,
    tdliKeys: string[],
};

export default class TodoCreateNew extends React.PureComponent<TodoCreateNewProps, TodoCreateNewStates> {
    tdTitle: string;
    tdliValues: {};  // Structure: {tdliKeyX: {done: x, desc: x}, ...}
    keysCount: number;
    forceResetNoSave: boolean;  // See method resetSelf()

    constructor(props: TodoCreateNewProps) {
        super(props);
        this.tdTitle = '';
        this.tdliValues = {};
        this.keysCount = 0;
        this.forceResetNoSave = false;

        const initialTdliKey = this.getNewKey();
        this.tdliValues[initialTdliKey] = {
            done: false,
            desc: '',
        };

        this.state = {
            tdColor: '#EEEEEE',
            tdliKeys: [initialTdliKey],
        };
    }

    async componentWillUnmount() {
        const {logger, dbSync} = this.props;

        if (!this.forceResetNoSave) {
            const resAddNewData = await this.saveTdToDB();
            if (logger) {
                if (resAddNewData instanceof Error) {
                    logger(resAddNewData);
                } else {
                    logger(resAddNewData.msg);
                }
            }

            if (Object.entries(resAddNewData.data).length !== 0
                || resAddNewData instanceof Error) {
                const resDbSync = await dbSync();
                if (logger) {
                    logger(resDbSync);
                }
            }
        }
    }

    resetSelf = () => {
        const {reset} = this.props;

        this.forceResetNoSave = true;
        reset();
    };

    getNewKey = (): string => {
        const key = `key${this.keysCount}`;
        this.keysCount += 1;
        return key
    };

    isTdliLastItem = (tdliEl: Node) => {
        if (tdliEl && tdliEl.parentNode) {
            return tdliEl.parentNode.lastChild === tdliEl
        }
        return false
    };

    handleTdTitleInput = (key: string, newValue: string, textEditEl: Node) => {
        this.tdTitle = newValue;
    };

    handleTdColorChange = (key: string, newValue: string) => {
        this.setState({
            tdColor: newValue,
        });
    };

    handleTdliDoneChange = (tdliKey: string, newValue: boolean) => {
        this.tdliValues[tdliKey].done = newValue;
    };

    handleTdliDescInput = (tdliKey: string, newValue: string, textEditEl: Node) => {
        this.tdliValues[tdliKey].desc = newValue;

        // Add new TDLI if applicable
        const tdliEl = textEditEl.parentNode;
        if (tdliEl && this.isTdliLastItem(tdliEl)) {
            this.addNewTdli();
        }
    };

    addNewTdli = () => {
        const newTdliKey = this.getNewKey();
        this.tdliValues[newTdliKey] = {
            done: false,
            desc: '',
        };
        this.setState(prevState => ({
            tdliKeys: [...prevState.tdliKeys, newTdliKey],
        }));
    };

    checkEmptyTdTitle = () => this.tdTitle === '';

    checkEmptyTdliValues = () => {
        const {tdliKeys} = this.state;
        return tdliKeys.every(tdliKey => this.tdliValues[tdliKey].desc === '');
    };

    checkNoChanges = () => {
        const {tdliKeys} = this.state;
        return this.checkEmptyTdTitle() && tdliKeys.length <= 1
    };

    saveTdToDB = async () => {
        try {
            if (this.checkNoChanges()) {
                return {
                    msg: '',
                    data: {},
                }
            }

            const {tdliKeys, tdColor} = this.state;

            if (this.checkEmptyTdliValues()) {
                if (this.checkEmptyTdTitle()) {
                    // No TD and TDLI data

                    return {
                        msg: '',
                        data: {},
                    }
                }

                // TD data exists, but no TDLI

                const tdToAdd = {
                    title: this.tdTitle,
                    color: tdColor,
                };
                const addedTdKey = (await addTodo(tdToAdd)).data;

                return {
                    msg: `Added todo #${addedTdKey}`,
                    data: {
                        tdKey: addedTdKey,
                        tdliKeys: null,
                    },
                }
            }

            // TDLI data exists, doesn't matter whether TD data exists

            const tdToAdd = {
                title: this.tdTitle,
                color: tdColor,
            };
            const addedTdKey = (await addTodo(tdToAdd)).data;

            const tdlisToAdd = tdliKeys.reduce((res, tdliKey, index) => {
                if (index < tdliKeys.length - 1) {
                    const tdliToAdd = {
                        todoId: addedTdKey,
                        done: this.tdliValues[tdliKey].done,
                        description: this.tdliValues[tdliKey].desc,
                    };
                    res.push(tdliToAdd);
                }
                return res
            }, []);
            const addedTdliKeys = (await addTodoListItem(tdlisToAdd)).data;

            return {
                msg: `Added todo #${addedTdKey} and todoListItems #[${addedTdliKeys}]`,
                data: {
                    tdKey: addedTdKey,
                    tdliKeys: addedTdliKeys,
                },
            }
        } catch (e) {
            return e
        }
    };

    render() {
        const {tdliKeys, tdColor} = this.state;

        const tdlis = tdliKeys.map((tdliKey, index) => {
            const tdliDone = this.tdliValues[tdliKey].done;
            const tdliDesc = this.tdliValues[tdliKey].desc;

            return (
                <TDLI key={tdliKey}
                      tdliKey={tdliKey}
                      tdliDone={tdliDone}
                      tdliDesc={tdliDesc}
                      handleTdliDoneChange={this.handleTdliDoneChange}
                      handleTdliDescInput={this.handleTdliDescInput}
                      lastItem={index === tdliKeys.length - 1} />
            )
        });

        return (
            <div className="todo-create-new"
                 style={{backgroundColor: tdColor}}>
                <TextEdit className="todo-edit-title"
                          textEditKey="tdcnTitle"
                          handleInput={this.handleTdTitleInput} />
                <ul className="todo-edit-list-items">
                    {tdlis}
                </ul>
                <OptionsPanel todoId=""
                              removeTodo={this.resetSelf}
                              changeColor={this.handleTdColorChange} />
            </div>
        )
    }
}
