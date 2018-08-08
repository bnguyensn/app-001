import * as React from 'react';
import TodoList from './TodoList';

export default class TodoCard extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            todos: [],
        };
    }

    render() {
        const {title, todos} = this.state;

        return (
            <div className="todo-card-container">
                <section className="todo-card-title">
                    <span>{title}</span>
                </section>
                <TodoList todos={todos} />
            </div>
        )
    }
}
