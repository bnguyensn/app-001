import {connectObjStore} from './connectIDB';
import {sanitizeNumber} from './inputValidation';

/** ********** API LEVEL 1 (PRIVATE) ********** */

/**
 * @param objStoreName - Name of the IDBObjectStore that the item will be added into
 * @param item - Could be an array of values or just a value
 * @param [put] - Use IDBObjectStore.put() instead of IDBObjectStore.add()
 * @param [putKey] - Optional key parameter if IDBObjectStore.put() is used
 * @return Promise - Resolve: Promise contains an object:
 *                            - msg: Success message
 *                            - data: Array containing added items' primary keys
 *                            if an array of item was added, or just a single
 *                            primary key
 *                   Reject: Promise contains an Error object
 * */
async function add(objStoreName, item, put = false, putKey = undefined) {
    return new Promise(async (resolve, reject) => {
        const objStore = await connectObjStore([objStoreName], 'readwrite');

        if (objStore instanceof Error) {
            reject(objStore);
        }

        console.log(`Attempting to add/put item(s) to objStore ${objStoreName}...`);

        if (Array.isArray(item)) {
            const addedItems = [];
            let processedCount = 0;

            item.forEach((it, index) => {
                const req = put ? objStore.put(it, putKey[index]) : objStore.add(it);

                req.onerror = () => {
                    processedCount += 1;
                    console.log(`Oops, could not add/put item ${it}: ${req.error}`);
                    if (processedCount === item.length) {
                        if (addedItems.length === 0) {
                            reject(Error('Could not add/put any item to database.'));
                        } else {
                            resolve({
                                msg: `Successfully added/put ${addedItems.length} item(s) to database.`,
                                data: addedItems,
                            });
                        }
                    }
                };

                req.onsuccess = () => {
                    // req.result = key of the successfully added item
                    addedItems.push(req.result);

                    processedCount += 1;
                    console.log(`Successfully added/put item ${it}`);

                    if (processedCount === item.length) {
                        resolve({
                            msg: `Successfully added/put ${addedItems.length} item(s) to database.`,
                            data: addedItems,
                        });
                    }
                }
            });
        } else {
            const req = put ? objStore.put(item, putKey) : objStore.add(item);

            req.onerror = () => {
                reject(Error(`Could not add/put item to database: ${req.error}`));
            };

            req.onsuccess = () => {
                resolve({
                    msg: 'Successfully added/put item to database',
                    data: req.result,
                });
            };
        }
    })
}

/** ********** API LEVEL 2 (PUBLIC) ********** */

/**
 * Could add a single or an array of todos
 * @param {Object} todo - Could be a todo object or an array of todo objects
 * @return The added todo's primary key, or an array of them
 * */
async function addTodo(todo) {
    try {
        // Make sure the item(s) being added is/are in conformity with our database
        const itemToAdd = Array.isArray(todo)
            ? todo.map(td => ({
                title: td.title,
                color: td.color,
            }))
            : {
                title: todo.title,
                color: todo.color,
            };

        return await add('todos', itemToAdd)
    } catch (e) {
        throw e
    }
}

/**
 * Could put a single or an array of todos
 * @param {Object} todo - Could be a todo object or an array of todo objects
 * @param {string} putKey - If this is passed, the put() function will update
 * the database record at key putKey. Otherwise a new record is added
 * */
async function putTodo(todo, putKey = undefined) {
    try {
        // Make sure the item(s) being added is/are in conformity with our database
        let itemToAdd;

        if (Array.isArray(todo)) {
            itemToAdd = todo.map(td => ({
                title: td.title,
                color: td.color,
            }));
        } else {
            itemToAdd = {
                title: todo.title,
                color: todo.color,
            };
        }
        return await add('todos', itemToAdd, true, putKey)
    } catch (e) {
        throw e
    }
}

/**
 * Could add a single or an array of todoListItem
 * @return The added todoListItem's primary key, or an array of them
 * */
async function addTodoListItem(todoListItem) {
    try {
        // Make sure the item(s) being added is/are in conformity with our database
        let itemToAdd;

        if (Array.isArray(todoListItem) && todoListItem.length === 0) {
            return Error('Error: attempting to add an empty array of todoListItems')
        }

        if (Array.isArray(todoListItem) && todoListItem.length > 0) {
            itemToAdd = todoListItem.map(tdli => ({
                todoId: sanitizeNumber(tdli.todoId),
                description: tdli.description,
                done: tdli.done,
            }));
        } else {
            itemToAdd = {
                todoId: sanitizeNumber(todoListItem.todoId),
                description: todoListItem.description,
                done: todoListItem.done,
            };
        }

        return await add('todoListItems', itemToAdd)
    } catch (e) {
        throw e
    }
}

/**
 * Could put a single or an array of todoListItem
 * */
async function putTodoListItem(todoListItem, putKey) {
    try {
        // Make sure the item(s) being added is/are in conformity with our database
        const itemToAdd = Array.isArray(todoListItem)
            ? todoListItem.map(tdli => ({
                todoId: sanitizeNumber(tdli.todoId),
                description: tdli.description,
                done: tdli.done,
            }))
            : {
                todoId: sanitizeNumber(todoListItem.todoId),
                description: todoListItem.description,
                done: todoListItem.done,
            };

        return await add('todoListItems', itemToAdd, true, sanitizeNumber(putKey))
    } catch (e) {
        throw e
    }
}

/** ********** EXPORTS ********** */

export {
    addTodo,
    addTodoListItem,
    putTodo,
    putTodoListItem,
}
