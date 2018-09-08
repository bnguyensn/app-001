// @flow

import * as React from 'react';
import TextEdit from './TextEdit';
import OptionsPanel from './OptionsPanel';
import MaterialIcon from './MaterialIcon';
import Checkbox from './Checkbox';

import './css/todo-edit.css';

/** ********** TO-DO EDIT LIST ITEM BUTTON ********** **/

function TDLIButton(props: {}) {
    return (
        <MaterialIcon role="button" tabIndex={0} {...props} />
    )
}

/** ********** TO-DO EDIT LIST ITEM ********** **/

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
    tdliKeys: string[],  // Real database keys
    tdliValues: {},  // Structure: {tdliKeyX: {done: x, desc: x}, ...},
    handleRemoveTodo?: () => void,
    handleTodoUnmount?: () => void,
};

type TodoEditStates = {
    tdColorState: string,
    tdliKeysState: string[],  // Fake instance keys
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
            tdliKeysState: Object.keys(this.tdliValues),
        };
    }

    componentWillUnmount() {
        const {handleTodoUnmount} = this.props;
        if (handleTodoUnmount) {
            handleTodoUnmount();
        } else {
            console.log('TodoEdit unmounted but no side effects happened'
                + ' because a handleTodoUnmount() prop was not passed.');
        }
    }

    /** ********** SELF-DESTRUCT ********** **/

    handleRemoveTodo = () => {
        const {handleRemoveTodo} = this.props;
        if (handleRemoveTodo) {
            handleRemoveTodo();
        } else {
            console.log('TodoEdit remove button was clicked but nothing'
                + ' happened because a handleRemoveTodo() prop was not passed.');
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
            done: false,
            desc: '',
        };
        this.setState(prevState => ({
            tdliKeysState: [...prevState.tdliKeysState, newTdliKey],
        }));
    };

    /** ********** INPUT HANDLING ********** **
     * All todoListItem inputs are uncontrolled. This is because contenteditable
     * elements are uncontrolled as a design default (for ease of interaction
     * with React), and other inputs followed suit for data storage consistency.
     * */

    handleTdTitleInput = (key: string, newValue: string, textEditEl: Node) => {
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

    /** ********** RENDER ********** **/

    render() {
        const {tdKey, tdTitle} = this.props;
        const {tdColorState, tdliKeysState} = this.state;

        console.log(`TodoEdit's tdliValues: ${JSON.stringify(this.tdliValues)}`);

        // Generate TDLIs
        const tdlis = tdliKeysState.map((fakeTdliKey, index) => {
            const {tdliKey, done, desc} = this.tdliValues[fakeTdliKey];

            return (
                <TDLI key={fakeTdliKey}
                      tdliKey={tdliKey}
                      tdliDone={done}
                      tdliDesc={desc}
                      handleTdliDoneChange={this.handleTdliDoneChange}
                      handleTdliDescInput={this.handleTdliDescInput}
                      lastItem={index === tdliKeysState.length - 1} />
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
                              removeTodo={this.handleRemoveTodo}
                              changeColor={this.handleChangeColor} />
            </div>
        )
    }
}
