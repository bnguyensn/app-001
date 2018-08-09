import * as React from 'react';

export default class TodoCreateNew extends React.PureComponent {
    render() {
        const {todo} = this.props;

        return (
            <div className="todo-create-new-container">
                Create new to-do list.
            </div>
        )
    }
}
