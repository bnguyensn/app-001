export default async function initData() {
    if (localStorage.length === 0) {
        const sampleData = await import('../data/sampleUserData.json');
        try {
            // First time initialising data
            localStorage.setItem('username', sampleData.username);
            localStorage.setItem('todos', JSON.stringify(sampleData.todos));
            return 1
        } catch (e) {
            // Local storage is disabled
            console.log('Local storage is disabled.');
            return 2
        }
    } else {
        // Data already exists, no need to initalise
        return 0
    }
}
