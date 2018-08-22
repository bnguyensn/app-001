import * as React from 'react';
import TodoEdit from './TodoEdit';

export default class TodoCreateNew extends React.PureComponent {
    render() {
        return (
            <div className="todo-create-new">
                <TodoEdit />
            </div>
        )
    }
}
