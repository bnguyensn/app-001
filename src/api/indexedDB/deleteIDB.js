export default function deleteIDB() {
    return new Promise((resolve, reject) => {
        console.log('Initialising database deletion...');

        const req = window.indexedDB.deleteDatabase('todoDB');

        req.onerror = (e) => {
            reject(Error(`Error deleting database: ${e}`));
        };

        req.onsuccess = () => {
            console.log('Successfully deleted database.');
            resolve();
        };
    })
}
