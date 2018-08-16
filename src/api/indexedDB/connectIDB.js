export default function connectIDB() {
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
                    reject(Error(`Error initialising database: ${eOnUpgradeNeeded.target.errorCode}`));
                };

                db.oncomplete = () => {
                    console.log('Successfully initialised empty database.');
                };

                // ********** Define initial data **********
                const initialTodos = [
                    {id: 'todo1', title: 'Groceries'},
                ];

                const initialTodoListItems = [
                    {todoId: 'todo1', description: 'Apple', done: true},
                    {todoId: 'todo1', description: 'Banana', done: true},
                    {todoId: 'todo1', description: 'Coconut', done: true},
                ];

                // ********** Create object stores **********
                // Note: db.createObjectStore() can only be called within a versionchange transaction
                // Also note: both of the below db.createObjectStore() share the same transaction
                const todosObjStore = db.createObjectStore('todos', {keyPath: 'id'});
                const todoListItemsObjStore = db.createObjectStore('todoListItems', {autoIncrement: true});

                todosObjStore.onerror = (eCreateObjStore) => {
                    reject(Error(`Error creating todosObjStore: ${eCreateObjStore.target.errorCode}`));
                };
                todoListItemsObjStore.onerror = (eCreateObjStore) => {
                    reject(Error(`Error creating todoListItemsObjStore: ${eCreateObjStore.target.errorCode}`));
                };

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
