// @flow

import * as React from 'react';
import TextEdit from './TextEdit';
import OptionsPanel from './OptionsPanel';
import MaterialIcon from './MaterialIcon';
import Checkbox from './Checkbox';

import {putTodo, putTodoListItem} from '../api/indexedDB/addItemsIDB';

import './css/todo-edit.css';

/** ********** TO-DO EDIT LIST ITEM BUTTON ********** **/

function TDLIButton(props: {}) {
    return (
        <MaterialIcon role="button" tabIndex={0} {...props} />
    )
}

/** ********** TO-DO EDIT LIST ITEM ********** **/

/**
 * These props do not change throughout the life of this component.
 * When the user finishes editing, the component is unmounted via a change in
 * the "key" prop, and is created anew when needed again.
 * These props can be compared to the current "states" of the component to check
 * whether modifications occurred and database update requests are needed.
 * */
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
        tdliKey,
        tdliDone,
        tdliDesc,
        handleTdliDoneChange,
        handleTdliDescInput,
        lastItem,
    } = props;

    return (
        <li className="todo-edit-list-item">
            {!lastItem
                ? (
                    <TDLIButton className="todo-edit-list-item-dragger md-dark"
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
                    <TDLIButton className="todo-edit-list-item-deleter md-dark"
                                icon="cancel" />)
                : <div style={{width: '1rem', height: '1rem'}} />
            }
        </li>
    )
}

/** ********** TO-DO EDIT ********** **/

export type TodoEditProps = {
    tdKey: string,
    tdTitle: string,
    tdColor: string,
    tdliKeys: string[],  // Real database TDLI keys
    tdliValues: {},  // Structure: {tdliKeyX: {done: x, desc: x}, ...}
    handleSelfRemoval?: () => void,
    handleUnmounting?: () => void,
};

type TodoEditStates = {
    tdColorState: string,
    fakeTdliKeys: string[],  // Fake TDLI keys
};

export default class TodoEdit extends React.PureComponent<TodoEditProps, TodoEditStates> {
    tdTitle: string;
    tdliValues: {};  // Structure: {fakeTdliKeyX: {tdliKey: x, done: x, desc: x}, ...}
    keysCount: number;

    constructor(props: TodoEditProps) {
        super(props);
        this.tdTitle = props.tdTitle;
        this.tdliValues = {};
        this.keysCount = 0;

        // Initialise tdliValues with data received from props
        props.tdliKeys.forEach((tdliKey) => {
            const {done, desc} = props.tdliValues[tdliKey];
            const fakeTdliKey = this.getNewKey();

            this.tdliValues[fakeTdliKey] = {tdliKey, done, desc};
        });

        // Add the empty "create new" TDLI
        this.tdliValues[this.getNewKey()] = {
            tdliKey: '',
            done: false,
            desc: '',
        };

        // Update state
        this.state = {
            tdColorState: props.tdColor,
            fakeTdliKeys: Object.keys(this.tdliValues),
        };
    }

    /** ********** UNMOUNTING ********** **/

    async componentWillUnmount() {
        const {tdKey, handleUnmounting} = this.props;

        if (tdKey) {
            const res = await this.saveToDB();

            if (res.length > 0) {
                console.log(`Data successfully updated. Res: ${res.toString()}`);
                if (handleUnmounting) {
                    handleUnmounting();
                    console.log('Side-effects actioned.')
                } else {
                    console.log('No further side-effects.');
                }
            } else {
                console.log('Nothing updated.');
            }
        }
    }

    /** ********** SELF-REMOVAL ********** **/

    handleSelfRemoval = () => {
        const {handleSelfRemoval} = this.props;
        if (handleSelfRemoval) {
            handleSelfRemoval();
        } else {
            console.log('TodoEdit remove button was clicked but nothing'
                + ' happened because a handleSelfRemoval() prop was not passed.');
        }
    };

    /** ********** DOM HELPERS ********** **/

    isTdliLastItem = (tdliEl: Node) => {
        if (tdliEl && tdliEl.parentNode) {
            return tdliEl.parentNode.lastChild === tdliEl
        }
        return false
    };

    getNewKey = (): string => {
        const key = `key${this.keysCount}`;
        this.keysCount += 1;
        return key
    };

    addNewTdli = () => {
        const newTdliKey = this.getNewKey();
        this.tdliValues[newTdliKey] = {
            // TODO: there's no tdliKey here
            done: false,
            desc: '',
        };
        this.setState(prevState => ({
            fakeTdliKeys: [...prevState.fakeTdliKeys, newTdliKey],
        }));
    };

    /** ********** INPUT HANDLING ********** **
     * All todoListItem inputs are uncontrolled. This is because contenteditable
     * elements are uncontrolled as a design default (for ease of interaction
     * with React), and other inputs followed suit for data storage consistency.
     * */

    handleTdTitleInput = (key: string, newValue: string, textEditEl: Node) => {
        console.log('tdTitleInput');

        this.tdTitle = newValue;
    };

    handleChangeColor = (key: string, newValue: string) => {
        this.setState({
            tdColorState: newValue,
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

    /** ********** FINISH EDITING ********** **/

    dataModified = (): boolean => {
        const {
            tdTitle: ogTdTitle,
            tdColor: ogTdColor,
            tdliKeys: ogTdliKeys,  // Note that this is an array of *actual* database TDLI keys
            tdliValues: ogTdliValues,  // Structure: {tdliKeyX: {done: x, desc: x}, ...}
        } = this.props;
        const {tdColorState, fakeTdliKeys} = this.state;

        if (ogTdTitle !== this.tdTitle) {
            return true
        }

        if (ogTdColor !== tdColorState) {
            return true
        }

        if (ogTdliKeys.length !== fakeTdliKeys.length) {
            return true
        }

        return fakeTdliKeys.some((fakeTdliKey) => {
            const {tdliKey} = this.tdliValues[fakeTdliKey];

            const tdliDoneChanged = ogTdliValues[tdliKey].done !== this.tdliValues[fakeTdliKey].done;
            const tdliDescChanged = ogTdliValues[tdliKey].done !== this.tdliValues[fakeTdliKey].desc;

            return tdliDoneChanged && tdliDescChanged
        });
    };

    tdModified = (): boolean => {
        const {
            tdTitle: ogTdTitle,
            tdColor: ogTdColor,
        } = this.props;
        const {tdColorState} = this.state;

        return this.tdTitle !== ogTdTitle || tdColorState !== ogTdColor
    };

    getModifiedTdlis = (): {} => {
        const {
            tdKey,
            tdliValues: ogTdliValues,  // Structure: {tdliKeyX: {done: x, desc: x}, ...}
        } = this.props;
        const {fakeTdliKeys} = this.state;

        if (Object.entries(ogTdliValues).length > 0) {
            const updatedTdliValues = {};
            fakeTdliKeys.forEach((fakeTdliKey, index) => {
                if (index < fakeTdliKeys.length - 1) {
                    const {tdliKey, done, desc} = this.tdliValues[fakeTdliKey];
                    console.log(`this.tdliValues: ${this.tdliValues}`);
                    console.log(`tdliKey: ${tdliKey}`);

                    const {done: ogDone, desc: ogDesc} = ogTdliValues[tdliKey];

                    if (done !== ogDone || desc !== ogDesc) {
                        updatedTdliValues[tdliKey] = {todoId: tdKey, done, description: desc};
                    }
                }
            });

            return updatedTdliValues
        }

        return {}
    };

    saveToDB = async (): Promise<[]> => {
        const {tdKey} = this.props;
        const {tdColorState} = this.state;

        try {
            const promises = [];

            if (this.tdModified()) {
                const modifiedTdPromise = putTodo({
                    title: this.tdTitle,
                    color: tdColorState,
                }, tdKey);

                promises.push(modifiedTdPromise);
            } else {
                console.log('td data did not change');
            }

            const modifiedTdlis = this.getModifiedTdlis();
            const modifiedTdlisKeys = Object.keys(modifiedTdlis);
            if (modifiedTdlisKeys.length > 0) {
                modifiedTdlisKeys.forEach((modifiedTdliKey) => {
                    const modifiedTdli = modifiedTdlis[modifiedTdliKey];

                    console.log(`modifiedTdli: ${JSON.stringify(modifiedTdli)}`);
                    console.log(`modifiedTdliKey: ${JSON.stringify(modifiedTdliKey)}`);

                    const modifiedTdliPromise = putTodoListItem(modifiedTdli, modifiedTdliKey);

                    promises.push(modifiedTdliPromise);
                });
            } else {
                console.log('tdlis data did not change');
            }

            return Promise.all(promises)
        } catch (e) {
            throw e
        }
    };

    /** ********** RENDER ********** **/

    render() {
        const {tdKey, tdTitle} = this.props;
        const {tdColorState, fakeTdliKeys} = this.state;

        console.log(`TodoEdit's tdliValues: ${JSON.stringify(this.tdliValues)}`);

        // Generate TDLIs
        const tdlis = fakeTdliKeys.map((fakeTdliKey, index) => {
            const {tdliKey, done, desc} = this.tdliValues[fakeTdliKey];

            return (
                <TDLI key={fakeTdliKey}
                      tdliKey={fakeTdliKey}
                      tdliDone={done}
                      tdliDesc={desc}
                      handleTdliDoneChange={this.handleTdliDoneChange}
                      handleTdliDescInput={this.handleTdliDescInput}
                      lastItem={index === fakeTdliKeys.length - 1} />
            )
        });

        return (
            <div className="todo-edit"
                 style={{backgroundColor: tdColorState}}>
                <TextEdit className="todo-edit-title"
                          textEditKey={tdKey}
                          initText={tdTitle}
                          handleInput={this.handleTdTitleInput} />
                <ul className="todo-edit-list-items">
                    {tdlis}
                </ul>
                <OptionsPanel todoId=""
                              removeTodo={this.handleSelfRemoval}
                              changeColor={this.handleChangeColor} />
            </div>
        )
    }
}
