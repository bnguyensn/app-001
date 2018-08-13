function initDB() {
    return new Promise((resolve, reject) => {
        if (window.indexedDB) {
            const req = window.indexedDB.open('todoDB', 1);

            req.onerror = (e) => {
                reject(Error(`Something went wrong with IndexedDB: ${e.target.errorCode}`));
            };

            req.onupgradeneeded = (e) => {
                const db = e.target.result;

                const todos = [
                    {
                        id: 'todo1',
                        title: 'Groceries',
                        list: [
                            {
                                id: 'todo1-item1',
                                description: 'Apple',
                                done: true,
                            },
                        ],
                    },
                ];

                const objStore = db.createObjectStore();
            };

            req.onsuccess = (e) => {

            };
        } else {
            reject(Error('IndexedDB is not supported in this browser.'));
        }
    })
}
