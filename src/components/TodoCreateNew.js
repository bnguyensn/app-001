// @flow

import * as React from 'react';
import Checkbox from './Checkbox';
import TextEdit from './TextEdit';

import {addTodo, addTodoListItem} from '../api/indexedDB/addItemsIDB';

type TDLIProps = {
    tdliKey: string,
    tdliDone: boolean,
    tdliDesc: string,
    handleTdliDoneChange: (tdliKey: string, newValue: boolean) => void,
    handleTdliDescInput: (tdliKey: string, newValue: string, textEditEl: Node) => void,
};

function TDLI(props: TDLIProps) {
    const {tdliKey, tdliDone, tdliDesc, handleTdliDoneChange, handleTdliDescInput} = props;

    return (
        <li className="todo-create-new-list-item">
            <div className="todo-create-new-list-item-checkbox">
                <Checkbox elKey={tdliKey}
                          checked={tdliDone}
                          handleChange={handleTdliDoneChange} />
            </div>
            <TextEdit elKey={tdliKey}
                      className="todo-create-new-list-item-description"
                      initText={tdliDesc}
                      handleInput={handleTdliDescInput} />
        </li>
    )
}

type TodoCreateNewProps = {
    logger?: (msg: string) => void,
    dbSync: () => Promise<string>,
};

type TodoCreateNewStates = {
    tdliKeys: string[],
};

export default class TodoCreateNew extends React.PureComponent<TodoCreateNewProps, TodoCreateNewStates> {
    tdTitle: string;
    tdliValues: {};  // Structure: {tdliKeyX: {done: x, desc: x}, ...}
    keysCount: number;

    constructor(props: TodoCreateNewProps) {
        super(props);
        this.tdTitle = '';
        this.tdliValues = {};
        this.keysCount = 0;

        const initialTdliKey = this.getNewKey();
        this.tdliValues[initialTdliKey] = {
            done: false,
            desc: '',
        };

        this.state = {
            tdliKeys: [initialTdliKey],
        };
    }

    async componentWillUnmount() {
        const {logger, dbSync} = this.props;

        const resAddNewData = await this.saveTdToDB();
        if (logger) {
            if (resAddNewData instanceof Error) {
                logger(resAddNewData);
            } else {
                logger(resAddNewData.msg);
            }
        }

        if (Object.entries(resAddNewData.data).length !== 0 || resAddNewData instanceof Error) {
            const resDbSync = await dbSync();
            if (logger) {
                logger(resDbSync);
            }
        }
    }

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

            const {tdliKeys} = this.state;

            if (this.checkEmptyTdliValues()) {
                if (this.checkEmptyTdTitle()) {
                    // No TD and TDLI data

                    return {
                        msg: '',
                        data: {},
                    }
                }

                // TD data exists, but no TDLI

                const tdToAdd = {title: this.tdTitle};
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

            const tdToAdd = {title: this.tdTitle};
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
        const {tdliKeys} = this.state;

        const tdlis = tdliKeys.map((tdliKey) => {
            const tdliDone = this.tdliValues[tdliKey].done;
            const tdliDesc = this.tdliValues[tdliKey].desc;

            return (
                <TDLI key={tdliKey}
                      tdliKey={tdliKey}
                      tdliDone={tdliDone}
                      tdliDesc={tdliDesc}
                      handleTdliDoneChange={this.handleTdliDoneChange}
                      handleTdliDescInput={this.handleTdliDescInput} />
            )
        });

        return (
            <div className="todo-create-new">
                <TextEdit className="todo-create-new-title"
                          elKey="tdcnTitle"
                          handleInput={this.handleTdTitleInput} />
                <ul className="todo-create-new-list-items">
                    {tdlis}
                </ul>
            </div>
        )
    }
}
