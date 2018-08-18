import {connectObjStore, createTransaction, promisifyRequest} from './connectIDB';
import {itemExist} from './readIDB';
import {inputValid, sanitizeInput} from './inputValid';

/** ********** API LEVEL 1 (PRIVATE) ********** */

function removeItem1(objStoreName, key) {
    return new Promise(async (resolve, reject) => {
        const objStore = inputValid(key)
            ? await connectObjStore(objStoreName, 'readwrite')
            : Error('Database key should be a number.');

        if (objStore instanceof Error) {
            reject(objStore);
        }

        // Only remove item if key exists
        if (await itemExist(objStoreName, key)) {
            console.log('Attempting to delete item...');

            const req = objStore.delete(key);
            req.onerror = () => {
                reject(Error(`Error deleting item ${key}: ${req.error}`));
            };
            req.onsuccess = () => {
                console.log(`Successfully deleted key ${key} in objStore ${objStoreName}`);
                resolve(req.result);
            }
        } else {
            reject(Error(`Could not delete key ${key} in objStore ${objStoreName}`
            + ' because it does not exist.'));
        }
    })
}

async function removeItem(objStoreName, key) {
    try {
        // Only delete key if it exists
        if (await itemExist(objStoreName, key)) {
            const trans = await createTransaction(objStoreName, 'readwrite');
            const objStore = trans.objectStore(objStoreName);
            return await promisifyRequest(objStore.delete(sanitizeInput(key)));
        }
        console.log('key does not exist.');
        return Error('Key does not exist.');
    } catch (e) {
        throw e
    }
}

/** ********** API LEVEL 2 (PUBLIC) ********** */

async function removeTodo(todoId) {
    const res = inputValid(todoId)
        ? await removeItem('todos', Number(todoId))
        : Error('Database key should be a number');

    return new Promise((resolve, reject) => {
        if (res instanceof Error) {
            reject(res);
        } else {
            resolve(res);
        }
    })
}

async function removeTodoListItem(todoListItemId) {
    const res = inputValid(todoListItemId)
        ? await removeItem('todoListItems', Number(todoListItemId))
        : Error('Database key should be a number');

    return new Promise((resolve, reject) => {
        if (res instanceof Error) {
            reject(res);
        } else {
            resolve(res);
        }
    })
}

/** ********** EXPORTS ********** */

export {
    removeTodo,
    removeTodoListItem,
}
