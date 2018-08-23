import * as React from 'react';
import TodoEdit from './TodoEdit';

export default class TodoCreateNew extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            todoId: undefined,
        }
    }

    // Occur when there are edits in the <TodoCreateNew /> box and user clicks
    // outside of the box
    addNewTodo = () => {
        // Add data to database

        // Update the DOM (add a new <TodoCard />)

        // Reset <TodoCreateNew /> to a blank <TodoEdit />
    };

    render() {
        const {todoId} = this.state;

        return (
            <div className="todo-create-new">
                <TodoEdit todoId={todoId} />
            </div>
        )
    }
}
