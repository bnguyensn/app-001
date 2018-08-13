export function readUsername() {
    return localStorage.getItem('username');
}

export function readTodos() {
    return JSON.parse(localStorage.getItem('todos'));
}
