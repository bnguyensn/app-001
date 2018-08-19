import {connectObjStore, createTransaction, promisifyRequest, promisifyCursorRequest} from './connectIDB';
import {inputValid, sanitizeInput} from './inputValid';

/** ********** API LEVEL 1 (PRIVATE) ********** */

async function itemExist(objStoreName, key) {
    try {
        const sanitizedKey = sanitizeInput(key);

        const trans = await createTransaction(objStoreName, 'readonly');
        const objStore = trans.objectStore(objStoreName);

        const res = await promisifyRequest(objStore.getKey(sanitizedKey));

        return res !== undefined
    } catch (e) {
        throw e
    }
}

async function getItemsIndex(objStoreName, indexName, indexKey) {
    try {
        const trans = await createTransaction(objStoreName, 'readonly');
        const objStore = trans.objectStore(objStoreName);
        const index = objStore.index(indexName);

        return await promisifyCursorRequest(index.openCursor(indexKey));
    } catch (e) {
        throw e
    }


    /*const objStore = await connectObjStore(objStoreName, 'readonly');

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
    })*/
}


async function getItem(objStoreName, key) {
    try {
        const sanitizedKey = sanitizeInput(key);

        const trans = await createTransaction(objStoreName, 'readonly');
        const objStore = trans.objectStore(objStoreName);

        return await promisifyRequest(objStore.get(sanitizedKey));
    } catch (e) {
        throw e
    }
}

/** ********** API LEVEL 2 (PUBLIC) ********** */

async function getTodo(todoId) {
    try {
        return await getItem('todos', todoId)
    } catch (e) {
        throw e
    }
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
