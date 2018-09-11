// @flow

import * as React from 'react';
import MaterialIcon from './MaterialIcon';
import Checkbox from './Checkbox';
import TextEdit from './TextEdit';

/** ********** MISC. ********** **/

function TDLIButton(props: {}) {
    return (
        <MaterialIcon role="button" tabIndex={0} {...props} />
    )
}
/** ********** TO-DO EDIT LIST ITEM ********** **/

type TDLIProps = {
    fakeTdliId: string,
    tdliDone: boolean,
    tdliDesc: string,
    handleTdliDoneChange: (tdliId: string, newValue: boolean) => void,
    handleTdliDescInput: (tdliId: string, newValue: string, textEditEl: Node) => void,
    lastItem: boolean,
};

export default function TodoEditTDLI(props: TDLIProps) {
    const {
        tdliId,
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
                <Checkbox fakeTdliId={fakeTdliId}
                          checked={tdliDone}
                          handleChange={handleTdliDoneChange} />
            </div>
            <TextEdit id={fakeTdliId}
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
