import {connectObjStore, createTransaction, promisifyRequest} from './connectIDB';
import {inputValid, sanitizeInput} from './inputValid';

/** ********** API LEVEL 1 (PRIVATE) ********** */

async function itemExist(objStoreName, key) {
    try {
        const sanitizedKey = sanitizeInput(key);

        const trans = await createTransaction(objStoreName, 'readonly');
        const objStore = trans.objectStore(objStoreName);

        const res = await promisifyRequest(objStore.getKey(sanitizedKey));

        return res !== undefined

        /*return new Promise((resolve, reject) => {
            const req = objStore.getKey(sanitizedKey);
            req.onerror = () => {
                reject(Error(`Error getting key: ${req.error}`));
            };
            req.onsuccess = () => {
                console.log('itemExist request succeeded.');
                resolve(req.result !== undefined);
            }
        })*/
    } catch (e) {
        throw e
    }
}

/**
 * @return Promise - Resolve: Promise contains an array of items pulled from database
 *                   Reject: Promise contains an Error object
 * */
async function getItemsIndex(objStoreName, indexName, indexKey) {
    const objStore = await connectObjStore(objStoreName, 'readonly');

    return new Promise((resolve, reject) => {
        if (objStore instanceof Error) {
            reject(objStore);
        }

        const index = objStore.index(indexName);
        const req = index.openCursor(indexKey);
        let count = 0;
        const res = [];

        req.onerror = () => {
            reject(Error(`Error opening cursor when getting items via index: ${req.error}`));
        };

        req.onsuccess = () => {
            const cursor = req.result;

            if (cursor) {
                res.push(cursor.value);
                count += 1;
                cursor.continue();
            } else {
                console.log(`All ${count} cursor item(s) have been iterated through.`);
                resolve(res);
            }
        };
    })
}

/**
 * @return Promise - Resolve: Promise contains the item pulled from database
 *                   Reject: Promise contains an Error object
 * */
async function getItem(objStoreName, key) {
    const objStore = await connectObjStore(objStoreName, 'readonly');

    return new Promise((resolve, reject) => {
        if (objStore instanceof Error) {
            reject(objStore);
        }

        const req = objStore.get(key);

        req.onerror = () => {
            reject(Error(`Request error when getting item: ${req.error}`));
        };

        req.onsuccess = () => {
            resolve(req.result);
        };
    })
}

/** ********** API LEVEL 2 (PUBLIC) ********** */

async function getTodo(todoId) {
    const todo = inputValid(todoId)
        ? await getItem('todos', Number(todoId))
        : Error('Database key should be a number.');

    return new Promise((resolve, reject) => {
        if (todo instanceof Error) {
            reject(todo);
        }

        resolve(todo);
    })
}

async function getTodoListItems(todoId) {
    const todoListItems = inputValid(todoId)
        ? await getItemsIndex('todoListItems', 'todoId', Number(todoId))
        : Error('Database key should be a number');

    return new Promise((resolve, reject) => {
        if (todoListItems instanceof Error) {
            reject(todoListItems);
        }

        resolve(todoListItems);
    })
}

/** ********** EXPORTS ********** */

export {
    itemExist,
    getTodo,
    getTodoListItems,
}
