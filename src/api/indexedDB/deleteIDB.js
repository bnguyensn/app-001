export default function deleteIDB() {
    return new Promise((resolve, reject) => {
        console.log('Initialising database deletion...');

        const req = window.indexedDB.deleteDatabase('todoDB');

        req.onerror = () => {
            reject(Error(`Error deleting database: ${req.error}`));
        };

        req.onsuccess = () => {
            console.log('Successfully deleted database.');
            resolve();
        };
    })
}
