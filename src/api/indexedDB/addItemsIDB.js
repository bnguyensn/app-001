import {connectObjStore} from './connectIDB';

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
    const objStore = await connectObjStore([objStoreName], 'readwrite');

    return new Promise((resolve, reject) => {
        if (objStore instanceof Error) {
            reject(objStore);
        }

        console.log(`Attempting to add item(s) to objStore ${objStoreName}...`);

        if (Array.isArray(item)) {
            const failedItems = [];
            let processedCount = 0;

            item.forEach((it) => {
                const req = objStore.add(it);

                req.onerror = () => {
                    processedCount += 1;
                    console.log(`Oops, could not add item ${it}: ${req.error}`);
                    failedItems.push(it);

                    if (processedCount === item.length) {
                        reject(Error('Could not add any item to database.'));
                    }
                };

                req.onsuccess = () => {
                    processedCount += 1;
                    console.log(`Successfully added item ${it}`);

                    if (processedCount === item.length) {
                        const resMsg = failedItems.length === 0
                            ? 'Successfully added all items to database'
                            : `${failedItems.length} item(s) could not be added to database,
                             which have been passed to resolve's data.`;
                        resolve({
                            msg: resMsg,
                            data: failedItems.length === 0 ? null : failedItems,
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
                    data: null,
                });
            };
        }
    })
}

/** ********** API LEVEL 2 (PUBLIC) ********** */

async function addTodo(title = '') {
    const res = await add('todos', {title});

    return new Promise((resolve, reject) => {
        if (res instanceof Error) {
            reject(res);
        } else {
            resolve(res);
        }
    })
}

async function addTodos(todos) {

}

/** ********** EXPORTS ********** */

export {
    addTodo,
    addTodos,
}
