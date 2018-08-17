import connectIDB from './connectIDB';

/** ********** API LEVEL 1 (PRIVATE) ********** */

/**
 * Main read query
 * @return Promise - Resolve: Promise contains an instance of IDBObjectStore
 *                   Reject: Promise contains an Error object
 * */
async function read(objStoreName, query) {
    const db = await connectIDB();

    return new Promise((resolve, reject) => {
        if (db instanceof Error) {
            reject(db);
        }

        // No errors connecting to database. Set up the query transaction
        console.log(`Attempting to read item(s) with key/index ${query} from objStore ${objStoreName}...`);

        const trans = db.transaction([objStoreName], 'readonly');
        const objStore = trans.objectStore(objStoreName);

        trans.onerror = () => {
            reject(Error(`Transaction error when getting item(s): ${trans.error}`));
        };

        resolve(objStore);
    })
}

/**
 * @return Promise - Resolve: Promise contains an array of items pulled from database
 *                   Reject: Promise contains an Error object
 * */
async function getItemsIndex(objStoreName, indexName, indexKey) {
    const objStore = await read(objStoreName, indexName);

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
    const objStore = await read(objStoreName, key);

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
    const todo = getItem('todos', todoId);

    return new Promise((resolve, reject) => {
        if (todo instanceof Error) {
            reject(todo);
        }

        resolve(todo);
    })
}

async function getTodoListItems(todoId) {
    const todoListItems = getItemsIndex('todoListItems', 'todoId', todoId);

    return new Promise((resolve, reject) => {
        if (todoListItems instanceof Error) {
            reject(todoListItems);
        }

        resolve(todoListItems);
    })
}

/** ********** EXPORTS ********** */

export {
    getTodo,
    getTodoListItems,
}
