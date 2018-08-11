import * as React from 'react';

export default class TodoListItem extends React.PureComponent {
    constructor(props) {
        super(props);
        const {todoId, listItemId, listItem} = this.props;
        this.todoId = todoId;
        this.listItemId = listItemId;
        this.state = {
            description: listItem.description,
            done: listItem.done,
        };
    }

    handleBoxCheck = () => {
        this.setState(prevState => ({done: !prevState.done}));
    };

    handleInputUpdate = (e) => {
        const {addNewListItem} = this.props;
        const {description} = this.state;
        const curText = e.currentTarget.textContent;

        if (addNewListItem && description === '') {
            addNewListItem('', false);
        }

        this.setState({
            description: curText,
        });
    };

    render() {
        const {description, done} = this.state;

        return (
            <li className="todo-list-item">
                <input className="todo-list-item-checkbox"
                       type="checkbox" checked={done} name={description}
                       onChange={this.handleBoxCheck} />
                <div className="todo-list-item-description"
                     placeholder="List item"
                     onInput={this.handleInputUpdate}
                     contentEditable>
                    {description}
                </div>
            </li>
        )
    }
}
