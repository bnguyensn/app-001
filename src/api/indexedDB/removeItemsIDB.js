import {createTransaction, promisifyRequest} from './connectIDB';
import {itemExist} from './readIDB';
import {sanitizeNumber} from './inputValidation';

/** ********** API LEVEL 1 (PRIVATE) ********** */

async function removeItem(objStoreName, key) {
    try {
        // Only delete key if it exists
        if (await itemExist(objStoreName, key)) {
            const trans = await createTransaction(objStoreName, 'readwrite');
            const objStore = trans.objectStore(objStoreName);
            return await promisifyRequest(objStore.delete(key));
        }
        console.log('key does not exist.');
        return Error('Key does not exist.');
    } catch (e) {
        throw e
    }
}

async function removeItemByIndex(objStoreName, indexName, indexKey) {
    try {
        const trans = await createTransaction(objStoreName, 'readwrite');
        const objStore = trans.objectStore(objStoreName);
        const index = objStore.index(indexName);

        const req = index.openCursor(indexKey);

        return new Promise((resolve, reject) => {
            let count = 0;

            req.onerror = () => {
                reject(req.error);
            };
            req.onsuccess = () => {
                const cursor = req.result;

                if (cursor) {
                    count += 1;
                    console.log(`Found item #${count}: [${cursor.primaryKey}, ${JSON.stringify(cursor.value)}].`);

                    const delReq = cursor.delete();
                    delReq.onsuccess = () => {
                        console.log(`Successfully deleted item #${count}: id ${cursor.primaryKey}`);
                    };
                    delReq.onerror = () => {
                        console.log(`Could not delete item #${count}: id ${cursor.primaryKey}. Error: ${delReq.error}`);
                    };

                    cursor.continue();
                } else {
                    resolve('removeItemByIndex finished.');
                    console.log(`All ${count} cursor item(s) have been iterated through.`);
                }
            };
        })
    } catch (e) {
        throw e
    }
}

/** ********** API LEVEL 2 (PUBLIC) ********** */

async function removeTodo(todoId) {
    try {
        // todoId should be a number
        const sanitizedTodoId = sanitizeNumber(todoId);

        const tdPromise = removeItem('todos', sanitizedTodoId);
        const tdliPromise = removeItemByIndex('todoListItems', 'todoId', todoId);

        const tdRemoveRes = await tdPromise;
        const tdliRemoveRes = await tdliPromise;

        return {tdRemoveRes, tdliRemoveRes}
    } catch (e) {
        throw e
    }
}

async function removeTodoListItem(todoListItemId) {
    try {
        // todoListItemId should be a number
        const sanitizedTodoListItemId = sanitizeNumber(todoListItemId);
        await removeItem('todoListItems', sanitizedTodoListItemId);
    } catch (e) {
        throw e
    }
}



/** ********** EXPORTS ********** */

export {
    removeTodo,
    removeTodoListItem,
}
