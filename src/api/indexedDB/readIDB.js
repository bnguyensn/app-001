import {createTransaction, promisifyRequest} from './connectIDB';
import {sanitizeNumber} from './inputValidation';

/** ********** API LEVEL 1 (PRIVATE) ********** */

async function itemExist(objStoreName, key) {
    try {
        const trans = await createTransaction(objStoreName, 'readonly');
        const objStore = trans.objectStore(objStoreName);

        return await promisifyRequest(objStore.getKey(key)) !== undefined;
    } catch (e) {
        throw e
    }
}

async function getItem(objStoreName, key) {
    try {
        const trans = await createTransaction(objStoreName, 'readonly');
        const objStore = trans.objectStore(objStoreName);

        return await promisifyRequest(objStore.get(key));
    } catch (e) {
        throw e
    }
}

async function getAllItems(objStoreName, key, count) {
    try {
        const trans = await createTransaction(objStoreName, 'readonly');
        const objStore = trans.objectStore(objStoreName);

        return await promisifyRequest(objStore.getAll(key, count));
    } catch (e) {
        throw e
    }
}

async function getAllKeys(objStoreName, key, count) {
    try {
        const trans = await createTransaction(objStoreName, 'readonly');
        const objStore = trans.objectStore(objStoreName);

        return await promisifyRequest(objStore.getAllKeys(key, count));
    } catch (e) {
        throw e
    }
}

async function getItemsByIndex(objStoreName, indexName, indexKey, returnMode = 'all') {
    try {
        const trans = await createTransaction(objStoreName, 'readonly');
        const objStore = trans.objectStore(objStoreName);
        const index = objStore.index(indexName);

        const req = index.openCursor(indexKey);

        return new Promise((resolve, reject) => {
            let count = 0;
            const res = [];

            req.onerror = () => {
                reject(req.error);
            };
            req.onsuccess = () => {
                const cursor = req.result;

                if (cursor) {
                    count += 1;
                    console.log(`Found item #${count}: [${cursor.primaryKey}, ${JSON.stringify(cursor.value)}].`);
                    switch (returnMode) {
                        case 'keysonly':
                            res.push(cursor.primaryKey);
                            break;
                        case 'valuesonly':
                            res.push(cursor.value);
                            break;
                        default:
                            res.push([cursor.primaryKey, cursor.value]);
                    }
                    cursor.continue();
                } else {
                    resolve(res);
                    console.log(`All ${count} cursor item(s) have been found.`);
                    console.log(`Returning: ${res}`);
                }
            };
        })
    } catch (e) {
        throw e
    }
}

/** ********** API LEVEL 2 (PUBLIC) ********** */

async function getTodo(todoId) {
    try {
        // todoId should be a number
        return await getItem('todos', sanitizeNumber(todoId))
    } catch (e) {
        throw e
    }
}

async function getAllTodos() {
    try {
        return await getAllItems('todos')
    } catch (e) {
        throw e
    }
}

async function getAllTodoKeys() {
    try {
        return await getAllKeys('todos')
    } catch (e) {
        throw e
    }
}

async function getTodoListItem(todoListItemId) {
    try {
        // todoListItemId should be a number
        return await getItem('todoListItems', sanitizeNumber(todoListItemId))
    } catch (e) {
        throw e
    }
}

/**
 * Get all todoListItems associated with a given todoId, along with their keys
 * Depending on returnMode, the returned array will contain different things:
 *      - returnMode all (default): return array of array with sub-array structure [key, value]
 *      - returnMode keysonly: return array of keys
 *      - returnMode valuesonly: return array of values
 * */
async function getAllTodoListItems(todoId, returnMode = 'all') {
    try {
        // todoId should be a number
        return await getItemsByIndex('todoListItems', 'todoId', sanitizeNumber(todoId), returnMode)
    } catch (e) {
        throw e
    }
}

/** ********** EXPORTS ********** */

export {
    itemExist,
    getTodo,
    getAllTodos,
    getAllTodoKeys,
    getTodoListItem,
    getAllTodoListItems,
}
