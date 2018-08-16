import connectIDB from './connectIDB';

async function getTodo(todoId) {
    const db = await connectIDB();

    return new Promise((resolve, reject) => {
        if (db instanceof Error) {
            reject(db);
        }

        // No errors connecting to database. Set up the query transaction
        console.log(`Attempting to read todoId#${todoId}...`);

        const trans = db.transaction(['todos'], 'readonly');
        const objStore = trans.objectStore('todos');
        const req = objStore.get(todoId);

        req.onerror = () => {
            reject(Error(`Error getting todoId#${todoId}: ${req.error}`));
        };

        req.onsuccess = () => {
            resolve(req.result);
        };
    })
}

function getTodoListItem() {

}

export {
    getTodo,
    getTodoListItem,
}
