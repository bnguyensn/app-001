import * as React from 'react';
import TodoCreateNew from './TodoCreateNew';
import TodoCard from './TodoCard';
import './css/todo-components.css';
import {connectIDB} from '../api/indexedDB/connectIDB';
import deleteIDB from '../api/indexedDB/deleteIDB';
import {itemExist, getTodo, getAllTodos, getAllTodoKeys, getTodoListItems} from '../api/indexedDB/readIDB';
import {addTodo, addTodoListItem} from '../api/indexedDB/addItemsIDB';
import {removeTodo, removeTodoListItem} from '../api/indexedDB/removeItemsIDB';

function EmptyBoard() {
    return (
        <div>There doesn&#39;t seem to be anything here.</div>
    )
}

export default class TodoBoard extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            todoKeys: [],
        };
    }

    async componentDidMount() {
        try {
            const allTodoKeys = await getAllTodoKeys();

            this.setState(prevState => ({
                todoKeys: [...prevState.todoKeys, ...allTodoKeys],
            }));
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        const {todoKeys} = this.state;

        console.log(`TodoBoard's todoKeys: ${todoKeys}`);

        const todoCards = todoKeys.length > 0
            ? todoKeys.map(todoKey => <TodoCard key={todoKey} todoId={todoKey} />)
            : [];

        return (
            <div className="todo-board-container">
                <div className="todo-board-title">{`${this.username}'s to-do tracker`}</div>
                <TodoCreateNew />
                <div className="todo-cards-container">
                    {todoCards.length > 0
                        ? todoCards
                        : <EmptyBoard />
                    }
                </div>
            </div>
        )
    }
}

/* DEBUG TodoBoard*/
/*export default class TodoBoard extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            todoId: '',
        };
    }

    async componentDidMount() {
        const db = await connectIDB();
        // this.username = readUsername();
        // this.todos = readTodos();
        // this.forceUpdate();
    }

    initDB = async () => {
        const db = await connectIDB();
    };

    deleteDB = async () => {
        await deleteIDB();
    };

    getTodo = async () => {
        const {todoId} = this.state;

        const resTodo = await getTodo(todoId);

        if (resTodo instanceof Error) {
            console.log(`
    Error
    when
    querying
    todoId
#${todoId}
: ${resTodo}
`);
        } else if (resTodo === undefined) {
            console.log(`
    Nothing
    found
    after
    successfully
    querying
    todoId
#${todoId}
.`);
        } else {
            console.log(`
    Result
    after
    successfully
    querying
    todoId
#${todoId}
:
    title =
    ${JSON.stringify(resTodo)}
.`);
        }
    };

    getAllTodos = async () => {
        const resTodos = await getAllTodos();

        if (resTodos instanceof Error) {
            console.log(`
    Error
    when
    querying
    all
    todos:
    ${resTodos}
`);
        } else {
            console.log(`
    All
    todos:
    ${JSON.stringify(resTodos)}
`);
        }
    };

    getTodoListItems = async () => {
        const {todoId} = this.state;

        const resTodoListItems = await getTodoListItems(todoId);

        if (resTodoListItems instanceof Error) {
            console.log(`
    Error
    when
    querying
    todoId
#${todoId}
: ${resTodoListItems}
`);
        } else if (resTodoListItems === undefined || resTodoListItems.length < 1) {
            console.log(`
    Nothing
    found
    after
    successfully
    querying
    todoId
#${todoId}
.`);
        } else {
            console.log(`
    Result
    after
    successfully
    querying
    todoId
#${todoId}
:
    title =
    ${JSON.stringify(resTodoListItems)}
.`);
        }
    };

    addTodo = async () => {
        const res = await addTodo({title: ''});

        if (res instanceof Error) {
            console.log(`
    Error
    when
    adding
    todo:
    ${res}
`);
        } else {
            console.log('Successfully added todo.');
        }
    };

    removeTodo = async () => {
        const {todoId} = this.state;
        const res = await removeTodo(todoId);
        console.log(res);
    };

    addTodoListItem = async () => {
        const res = await addTodoListItem({todoId: 1, description: '', done: false});
        console.log(JSON.stringify(res));
    };

    checkTodoExist = async () => {
        const {todoId} = this.state;

        try {
            const exist = await itemExist('todos', todoId);
            console.log(`
    Item
    exists
?: ${exist}
`);
        } catch (e) {
            console.log(`
    Final
    error:
    ${e}
`);
        }
    };

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    };

    render() {
        const {todoId} = this.state;

        return (
            <div>
                <button type="button" onClick={this.initDB}>CREATE</button>
                <button type="button" onClick={this.deleteDB}>DELETE</button>
                <br />
                <button type="button" onClick={this.getTodo}>GET todos</button>
                <button type="button" onClick={this.getAllTodos}>GET ALL todos</button>
                <button type="button" onClick={this.getTodoListItems}>GET todoListItems</button>
                <input type="text" name="todoId" placeholder="todoId"
                       value={todoId}
                       onChange={this.handleInputChange} />
                <br />
                <button type="button" onClick={this.addTodo}>ADD todos</button>
                <button type="button" onClick={this.addTodoListItem}>ADD todoListItem</button>
                <button type="button" onClick={this.removeTodo}>REMOVE todos</button>
                <br />
                <button type="button" onClick={this.checkTodoExist}>CHECK todos exist</button>
            </div>
        )
    }
}*/
