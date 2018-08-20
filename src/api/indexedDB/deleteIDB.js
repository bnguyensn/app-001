import {promisifyRequest} from "./connectIDB";

export default async function deleteIDB() {
    try {
        console.log('Initialising database deletion...');
        await promisifyRequest(window.indexedDB.deleteDatabase('todoDB'));
        console.log('Successfully deleted database.');
    } catch (e) {
        throw e
    }
}
