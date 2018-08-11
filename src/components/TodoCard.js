import * as React from 'react';
import TodoListItem from './TodoListItem';

function NoListItem() {
    return (
        <div>There doesn&#39;t seem to be anything here.</div>
    )
}

export default class TodoCard extends React.PureComponent {
    constructor(props) {
        super(props);
        const {todoId, todo} = props;
        const {title, list} = todo;
        this.todoId = todoId;
        this.title = title;
        this.listEntries = list !== undefined ? Object.entries(list) : [];
    }

    componentDidMount() {
        this.addNewListItem('', false);
    }

    addNewListItem = (description, done) => {
        const newListEntryId = `${this.todoId}-item${this.listEntries.length + 1}`;
        this.listEntries.push([newListEntryId, {description, done}]);
        this.forceUpdate();
    };

    render() {
        const listItems = this.listEntries.map((listEntry, i) => {
            const entryId = listEntry[0];
            const entryData = listEntry[1];

            return (
                <TodoListItem key={entryId}
                              todoId={this.todoId} listItemId={entryId}
                              listItem={entryData}
                              addNewListItem={i === this.listEntries.length - 1 ? this.addNewListItem : false} />
            )
        });

        return (
            <div className="todo-card-container">
                <section className="todo-card-title">{this.title}</section>
                <ul className="todo-list-items">{listItems.length > 0 ? listItems : <NoListItem />}</ul>
            </div>
        )
    }
}
