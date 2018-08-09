export default async function getTodos() {
    // return JSON.parse(await import('../data/sampleUserData.json'));
    return import('../data/sampleUserData.json')
}
