import {connectObjStore} from './connectIDB';
import {sanitizeNumber} from "./inputValidation";

/** ********** API LEVEL 1 (PRIVATE) ********** */

/**
 * @param objStoreName - Name of the IDBObjectStore that the item will be added into
 * @param item - Could be an array of values or just a value
 * @return Promise - Resolve: Promise contains an object:
 *                            - msg: Success message
 *                            - data: If item is an array and if there are some array values
 *                                    that could not be added to database, this will be an
 *                                    array containing these "failed" values. Otherwise this
 *                                    will be null
 *                   Reject: Promise contains an Error object
 * */
async function add(objStoreName, item) {
    return new Promise(async (resolve, reject) => {
        const objStore = await connectObjStore([objStoreName], 'readwrite');

        if (objStore instanceof Error) {
            reject(objStore);
        }

        console.log(`Attempting to add item(s) to objStore ${objStoreName}...`);

        if (Array.isArray(item)) {
            const addedItems = [];
            let processedCount = 0;

            item.forEach((it) => {
                const req = objStore.add(it);

                req.onerror = () => {
                    processedCount += 1;
                    console.log(`Oops, could not add item ${it}: ${req.error}`);
                    if (processedCount === item.length) {
                        if (addedItems.length === 0) {
                            reject(Error('Could not add any item to database.'));
                        } else {
                            resolve({
                                msg: `Successfully added ${addedItems.length} item(s) to database.`,
                                data: addedItems,
                            });
                        }
                    }
                };

                req.onsuccess = () => {
                    // req.result = key of the successfully added item
                    addedItems.push(req.result);

                    processedCount += 1;
                    console.log(`Successfully added item ${it}`);

                    if (processedCount === item.length) {
                        resolve({
                            msg: `Successfully added ${addedItems.length} item(s) to database.`,
                            data: addedItems,
                        });
                    }
                }
            });
        } else {
            const req = objStore.add(item);

            req.onerror = () => {
                reject(Error(`Could not add item to database: ${req.error}`));
            };

            req.onsuccess = () => {
                resolve({
                    msg: 'Successfully added item to database',
                    data: req.result,
                });
            };
        }
    })
}

/** ********** API LEVEL 2 (PUBLIC) ********** */

/**
 * Could add a single or an array of todo
 * */
async function addTodo(todo) {
    try {
        // Make sure the item(s) being added is/are in conformity with our database
        const itemToAdd = Array.isArray(todo)
            ? todo.map(td => ({title: td.title}))
            : {title: todo.title};

        return await add('todos', itemToAdd)
    } catch (e) {
        throw e
    }
}

/**
 * Could add a single or an array of todoListItem
 * */
async function addTodoListItem(todoListItem) {
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

        return await add('todoListItems', itemToAdd)
    } catch (e) {
        throw e
    }
}

/** ********** EXPORTS ********** */

export {
    addTodo,
    addTodoListItem,
}
