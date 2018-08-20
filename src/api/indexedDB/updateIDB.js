import {connectObjStore} from './connectIDB';

/**
 * @pram updateObj:
 *      updateObj keys / values = keys / values corresponding to the objectStore
 *      keys / values that will be updated
 * */
async function updateItem(objStoreName, updateObj) {
    return new Promise(async (resolve, reject) => {
        const objStore = await connectObjStore([objStoreName], 'readwrite');

        if (objStore instanceof Error) {
            reject(objStore);
        }

        console.log(`Attempting to update item(s) in objStore ${objStoreName}...`);

        const updateEntries = Object.entries(updateObj);
        const updatedItems = [];
        let processedCount = 0;

        updateEntries.forEach((entry) => {
            const key = entry[0];
            const updatedValue = entry[1];

            const req = objStore.put(updatedValue, key);

            req.onerror = () => {
                processedCount += 1;
                console.log(`Oops, could not update item ${entry}: ${req.error}`);

                if (processedCount === updateEntries.length) {
                    if (updatedItems.length === 0) {
                        reject(Error('Could not update any item(s).'));
                    } else {
                        resolve({
                            msg: `Successfully updated ${updatedItems.length} item(s) to database.`,
                            data: updatedItems,
                        });
                    }
                }
            };

            req.onsuccess = () => {
                updatedItems.push(req.result);

                processedCount += 1;
                console.log(`Successfully updated item ${entry}`);

                if (processedCount === updateEntries.length) {
                    resolve({
                        msg: `Successfully added ${updatedItems.length} item(s) to database.`,
                        data: updatedItems,
                    });
                }
            };
        });
    })
}

export {
    updateItem,
}
