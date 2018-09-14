// @flow

import * as React from 'react';
import Checkbox from './Checkbox';
import TextEdit from './TextEdit';
import MaterialIcon from './MaterialIcon';

import {addTodo, addTodoListItem} from '../api/indexedDB/addItemsIDB';
import OptionsPanel from './OptionsPanel';

type TDLIProps = {
    tdliId: string,
    tdliDone: boolean,
    tdliDesc: string,
    handleTdliDoneChange: (tdliId: string, newValue: boolean) => void,
    handleTdliDescInput: (tdliId: string, newValue: string, textEditEl: Node) => void,
    lastItem: boolean,
};

function TDLI(props: TDLIProps) {
    const {
        tdliId, tdliDone, tdliDesc,
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
                <Checkbox fakeTdliId={tdliId}
                          checked={tdliDone}
                          handleChange={handleTdliDoneChange} />
            </div>
            <TextEdit id={tdliId}
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
    tdliIds: string[],
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

        const initialTdliId = this.getNewKey();
        this.tdliValues[initialTdliId] = {
            done: false,
            desc: '',
        };

        this.state = {
            tdColor: '#EEEEEE',
            tdliIds: [initialTdliId],
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

    handleTdTitleInput = (tdId: string, newValue: string, textEditEl: Node) => {
        this.tdTitle = newValue;
    };

    handleTdColorChange = (tdId: string, newValue: string) => {
        this.setState({
            tdColor: newValue,
        });
    };

    handleTdliDoneChange = (tdliId: string, newValue: boolean) => {
        this.tdliValues[tdliId].done = newValue;
    };

    handleTdliDescInput = (tdliId: string, newValue: string, textEditEl: Node) => {
        this.tdliValues[tdliId].desc = newValue;

        // Add new TDLI if applicable
        const tdliEl = textEditEl.parentNode;
        if (tdliEl && this.isTdliLastItem(tdliEl)) {
            this.addNewTdli();
        }
    };

    addNewTdli = () => {
        const newtdliId = this.getNewKey();
        this.tdliValues[newtdliId] = {
            done: false,
            desc: '',
        };
        this.setState(prevState => ({
            tdliIds: [...prevState.tdliIds, newtdliId],
        }));
    };

    checkEmptyTdTitle = () => this.tdTitle === '';

    checkEmptyTdliValues = () => {
        const {tdliIds} = this.state;
        return tdliIds.every(tdliId => this.tdliValues[tdliId].desc === '');
    };

    checkNoChanges = () => {
        const {tdliIds} = this.state;
        return this.checkEmptyTdTitle() && tdliIds.length <= 1
    };

    saveTdToDB = async () => {
        try {
            if (this.checkNoChanges()) {
                return {
                    msg: '',
                    data: {},
                }
            }

            const {tdliIds, tdColor} = this.state;

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
                const addedtdId = (await addTodo(tdToAdd)).data;

                return {
                    msg: `Added todo #${addedtdId}`,
                    data: {
                        tdId: addedtdId,
                        tdliIds: null,
                    },
                }
            }

            // TDLI data exists, doesn't matter whether TD data exists

            const tdToAdd = {
                title: this.tdTitle,
                color: tdColor,
            };
            const addedtdId = (await addTodo(tdToAdd)).data;

            const tdlisToAdd = tdliIds.reduce((res, tdliId, index) => {
                if (index < tdliIds.length - 1) {
                    const tdliToAdd = {
                        todoId: addedtdId,
                        done: this.tdliValues[tdliId].done,
                        description: this.tdliValues[tdliId].desc,
                    };
                    res.push(tdliToAdd);
                }
                return res
            }, []);
            const addedtdliIds = (await addTodoListItem(tdlisToAdd)).data;

            return {
                msg: `Added todo #${addedtdId} and todoListItems #[${addedtdliIds}]`,
                data: {
                    tdId: addedtdId,
                    tdliIds: addedtdliIds,
                },
            }
        } catch (e) {
            return e
        }
    };

    render() {
        const {tdliIds, tdColor} = this.state;

        const tdlis = tdliIds.map((tdliId, index) => {
            const tdliDone = this.tdliValues[tdliId].done;
            const tdliDesc = this.tdliValues[tdliId].desc;

            console.log(`Rendering TDLI: tdliDesc = ${tdliDesc}`);

            return (
                <TDLI key={tdliId}
                      tdliId={tdliId}
                      tdliDone={tdliDone}
                      tdliDesc={tdliDesc}
                      handleTdliDoneChange={this.handleTdliDoneChange}
                      handleTdliDescInput={this.handleTdliDescInput}
                      lastItem={index === tdliIds.length - 1} />
            )
        });

        return (
            <div className="todo-create-new"
                 style={{backgroundColor: tdColor}}>
                <TextEdit className="todo-edit-title"
                          id="tdcnTitle"
                          handleInput={this.handleTdTitleInput} />
                <ul className="todo-edit-list-items">
                    {tdlis}
                </ul>
                <OptionsPanel tdId=""
                              removeTodo={this.resetSelf}
                              changeColor={this.handleTdColorChange} />
            </div>
        )
    }
}
