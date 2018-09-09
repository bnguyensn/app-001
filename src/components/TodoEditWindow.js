// @flow

import * as React from 'react';
import TodoEdit from './TodoEdit';
import type {TodoEditProps} from './TodoEdit';
import ClickableDiv from '../utils/ClickableDiv';

/** ********** TO-DO EDIT WINDOW BACKDROP ********** **/

type BackdropProps = {
    todoEditProps: TodoEditProps,
    stopEdit: (todoEditProps: TodoEditProps) => void,
    hidden: boolean,
    children?: React.Node;
};

function Backdrop(props: BackdropProps) {
    const {todoEditProps, stopEdit, hidden, children} = props;

    const hiddenCls = hidden ? 'hidden' : '';

    const click = (e: SyntheticEvent<>) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) {
            stopEdit(todoEditProps);
        }
    };

    return (
        <ClickableDiv className={`todo-edit-window-backdrop ${hiddenCls}`}
                      handleClick={click}>
            {children}
        </ClickableDiv>
    )
}

/** ********** TO-DO EDIT WINDOW ********** **/

type TodoEditWindowProps = {
    todoEditProps: TodoEditProps,
    handleTodoEditUnmounting: () => Promise<>,
    handleRemoveTodo: (todoId: string) => Promise<string>,
    stopEdit: (todoEditProps: TodoEditProps) => void,
    hidden: boolean,
};

type TodoEditWindowStates = {};

export default class TodoEditWindow extends React.PureComponent<TodoEditWindowProps, TodoEditWindowStates> {
    constructor(props: TodoEditWindowProps) {
        super(props);
        console.log('');
    }

    handleTodoEditSelfRemoval = () => {
        const {todoEditProps, handleRemoveTodo, stopEdit} = this.props;
        const {tdKey} = todoEditProps;

        if (handleRemoveTodo) {
            handleRemoveTodo(tdKey);
        }

        stopEdit(todoEditProps);
    };

    render() {
        const {todoEditProps, handleTodoEditUnmounting, stopEdit, hidden} = this.props;
        const {tdKey, tdTitle, tdColor, tdliKeys, tdliValues} = todoEditProps;
        console.log(`TodoEditWindow re-rendered!`);
        console.log(`todoEditProps of TodoEditWindow: ${JSON.stringify(todoEditProps)}`);

        const hiddenCls = hidden ? 'hidden' : '';

        return (
            <Backdrop todoEditProps={todoEditProps}
                      stopEdit={stopEdit}
                      hidden={hidden}>
                <div className={`todo-edit-window ${hiddenCls}`}>
                    <TodoEdit tdKey={tdKey}
                              tdTitle={tdTitle}
                              tdColor={tdColor}
                              tdliKeys={tdliKeys}
                              tdliValues={tdliValues}
                              handleSelfRemoval={this.handleTodoEditSelfRemoval}
                              handleUnmounting={handleTodoEditUnmounting} />
                </div>
            </Backdrop>
        )
    }
}
