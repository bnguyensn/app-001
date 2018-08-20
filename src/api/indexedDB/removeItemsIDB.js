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
        // Only delete if indexName / indexKey exists

    } catch (e) {

    }
}

/** ********** API LEVEL 2 (PUBLIC) ********** */

async function removeTodo(todoId) {
    try {
        // todoId should be a number
        const sanitizedTodoId = sanitizeNumber(todoId);
        await removeItem('todos', sanitizedTodoId);
    } catch (e) {
        throw e
    }
}

async function removeTodoListItem(todoListItemId) {
    try {
        // todoListItemId should be a number
        const sanitizedTodoListItemId = sanitizeNumber(todoListItemId);
        await removeItem('todosListItems', sanitizedTodoListItemId);
    } catch (e) {
        throw e
    }
}



/** ********** EXPORTS ********** */

export {
    removeTodo,
    removeTodoListItem,
}
