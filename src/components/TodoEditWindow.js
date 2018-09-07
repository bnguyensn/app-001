// @flow

import * as React from 'react';
import TextEdit from './TextEdit';
import OptionsPanel from './OptionsPanel';
import MaterialIcon from './MaterialIcon';
import Checkbox from './Checkbox';

/** ********** LIST ITEM ********** **/

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

/** ********** EDIT WINDOW ********** **/

export type TodoEditData = {
    tdKey: string,
    tdTitle: string,
    tdColor: string,
    tdliValues: {},  // Structure: {realTdliKeyX: {done: x, desc: x}, ...}
    hidden: boolean,
};

type TodoEditProps = {
    tdKey: string,
    defaultTdTitle: string,
    defaultTdColor: string,
    defaultTdliValues: {},  // Structure: {realTdliKeyX: {done: x, desc: x}, ...}
    hidden: boolean,
    stopEdit: () => void,
};

type TodoEditStates = {
    tdColor: string,
    tdliKeys: string[],
};

export default class TodoEditWindow extends React.PureComponent<TodoEditProps, TodoEditStates> {
    tdTitle: string;
    tdliValues: {};  // Structure: {fakeTdliKeyX: {tdliKey: x, done: x, desc: x}, ...}
    keysCount: number;

    constructor(props: TodoEditProps) {
        super(props);
        this.tdTitle = props.tdTitle;
        this.tdliValues = {};
        this.keysCount = 0;

        // Initialise tdliValues with existing database data
        const defaultTdliKeys = Object.keys(props.defaultTdliValues);
        defaultTdliKeys.forEach((tdliKey) => {
            const {done, desc} = props.defaultTdliValues[tdliKey];
            const fakeTdliKey = this.getNewKey();

            this.tdliValues[fakeTdliKey] = {tdliKey, done, desc};
        });

        // Add the empty "create new" TDLI
        const fakeTdliKey = `key${this.keysCount}`;
        this.tdliValues[fakeTdliKey] = {
            tdliKey: '',
            done: false,
            desc: '',
        };
        this.keysCount += 1;

        // Update state
        this.state = {
            tdColor: props.tdColor,
            tdliKeys: Object.keys(this.tdliValues),
        };
    }

    updateSelf = () => {

    };

    toggleSelf = () => {

    };

    resetSelf = () => {

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
            done: false,
            desc: '',
        };
        this.setState(prevState => ({
            tdliKeys: [...prevState.tdliKeys, newTdliKey],
        }));
    };

    handleTodoEditClick = (e: SyntheticKeyboardEvent<>) => {
        e.stopPropagation();
    };

    /** ********** INPUT HANDLING ********** **
     * All todoListItem inputs are uncontrolled. This is because contenteditable
     * elements are uncontrolled as a design default (for ease of interaction
     * with React), and other inputs followed suit for data storage consistency.
     * */

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

    /** ********** DATABASE INTERACTIONS ********** **/

    saveTdToDB = () => {

    };

    /** ********** RENDER ********** **/

    render() {
        const {tdKey, hidden, stopEdit} = this.props;
        const {tdColor, tdliKeys} = this.state;

        // Generate TDLIs
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
            <div className={`todo-edit-lightbox-bkg ${hidden ? 'hidden' : ''}`}
                 onClick={stopEdit}>
                <div className={`todo-edit ${hidden ? 'hidden' : ''}`}
                     style={{backgroundColor: tdColor}}
                     onClick={this.handleTodoEditClick}>
                    <TextEdit className="todo-edit-title"
                              textEditKey={tdKey}
                              handleInput={this.handleTdTitleInput} />
                    <ul className="todo-edit-list-items">
                        {tdlis}
                    </ul>
                    <OptionsPanel todoId=""
                                  removeTodo={this.resetSelf}
                                  changeColor={this.handleTdColorChange} />
                </div>
            </div>
        )
    }
}
