function connectIDB() {
    return new Promise((resolve, reject) => {
        console.log('Attempting to connect to database...');

        if (window.indexedDB) {
            // indexedDB.open() returns an IDBOpenDBRequest object immediately
            // and performs other operations asynchronously
            const req = window.indexedDB.open('todoDB', 1);

            req.onerror = () => {
                reject(Error(`Error connecting to database: ${req.error}`));
            };

            req.onsuccess = () => {
                console.log('Successfully connected to database.');
                resolve(req.result);
            };

            // Fire when the database has not been created before or a new version is being opened
            req.onupgradeneeded = (e) => {
                const db = e.target.result;

                db.onerror = (eOnUpgradeNeeded) => {
                    reject(Error(`Error initialising database: ${eOnUpgradeNeeded}`));
                };

                db.oncomplete = () => {
                    console.log('Successfully initialised empty database.');
                };

                // ********** Define initial data **********
                const initialTodos = [
                    {title: 'Groceries'},
                ];

                const initialTodoListItems = [
                    {todoId: 1, description: 'Apple', done: true},
                    {todoId: 1, description: 'Banana', done: true},
                    {todoId: 1, description: 'Coconut', done: true},
                ];

                // ********** Create object stores **********
                // Note: db.createObjectStore() can only be called within a versionchange transaction
                // Also note: both of the below db.createObjectStore() share the same transaction
                const todosObjStore = db.createObjectStore('todos', {autoIncrement: true});
                const todoListItemsObjStore = db.createObjectStore('todoListItems', {autoIncrement: true});

                // ********** Define object stores' data types **********
                // objStore.createIndex() creates a new field / column for each database record
                // IndexedDB use the structured clone algorithm to serialise stored objects
                todosObjStore.createIndex('title', 'title', {unique: false});
                todoListItemsObjStore.createIndex('todoId', 'todoId', {unique: false});
                todoListItemsObjStore.createIndex('description', 'description', {unique: false});
                todoListItemsObjStore.createIndex('done', 'done', {unique: false});

                // ********** Store initial data **********
                initialTodos.forEach((todo) => {todosObjStore.add(todo)});
                initialTodoListItems.forEach((todoListItem) => {todoListItemsObjStore.add(todoListItem)});
                console.log('Successfully added initial data to todosObjStore and todoListItemsObjStore.');
            };
        } else {
            reject(Error('IndexedDB is not supported in this browser.'));
        }
    })
}

async function connectObjStore(objStoreName, transType) {
    const db = await connectIDB();

    return new Promise((resolve, reject) => {
        if (db instanceof Error) {
            reject(db);
        }

        const trans = db.transaction([objStoreName], transType);
        trans.onerror = () => {
            reject(Error(`Transaction error when trying to open objStore ${objStoreName}: ${trans.error}`));
        };
        trans.oncomplete = () => {
            console.log(`Successfully completed ${transType} transaction.`);
        };

        resolve(trans.objectStore(objStoreName));
    })
}

async function createTransaction(objStoreName, transType) {
    try {
        const db = await connectIDB();

        const trans = db.transaction([objStoreName], transType);
        trans.onerror = () => {
            throw Error(`${transType} transaction error: ${trans.error}`)
        };
        trans.oncomplete = () => {
            console.log(`Successfully completed ${transType} transaction.`);
        };

        return trans
    } catch (e) {
        throw e
    }
}

function promisifyRequest(req) {
    return new Promise((resolve, reject) => {
        req.onerror = () => {
            reject(req.error);
        };
        req.onsuccess = () => {
            resolve(req.result);
        };
    })
}

/** ********** EXPORTS ********** */

export {
    connectIDB,
    connectObjStore,
    createTransaction,
    promisifyRequest,
}
