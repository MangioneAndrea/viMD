import { Vim } from './vim';

type History = {
    previous?: History;
    next?: History;
    text: string;
};

export type Type = {
    text: string;
    selectionStart: number;
    selectionEnd: number;
    history?: History;
};
export const default_buffer = () => ({
    text: 'hi\nhello -\n asdas   ^\n \n ',
    mode: 'normal',
    symbolBuffer: '',
    selectionStart: 0,
    selectionEnd: 0,
    cursor: {
        x: 0,
        y: 0,
        preferredX: 0
    },
    macro: null,
    registers: new Map()
});

export function new_line(vim: Vim, at: number) {
    let lines = getLines(vim);
    lines.splice(at, 0, ' ');
    vim.buffer.text = lines.join('');
}

export function delete_line(vim: Vim, at: number) {
    let lines = getLines(vim);
    let res = lines.splice(at, 1);
    vim.buffer.text = lines.join('');
    return res[0];
}

export function current_line(vim: Vim) {
    return getLines(vim)[vim.cursor.y];
}

function storeStatus(vim: Vim) {
    vim.buffer.history = {
        text: vim.buffer.text,
        previous: vim.buffer.history
    };
}

export function getLines(vim: Vim) {
    return vim.buffer.text
        .split('\n')
        .map((str, idx, all) => (idx < all.length - 1 ? str + '\n' : str));
}

export function writeBuffer(vim: Vim) {
    let lines = getLines(vim);
    lines[vim.cursor.y] =
        lines[vim.cursor.y].slice(0, vim.cursor.x) +
        vim.symbolBuffer +
        lines[vim.cursor.y].slice(vim.cursor.x);
    vim.buffer.text = lines.join('');
    vim.symbolBuffer = '';
}

export function write(vim: Vim, text: string) {
    let lines = getLines(vim);
    lines[vim.cursor.y] =
        lines[vim.cursor.y].slice(0, vim.cursor.x) +
        text +
        lines[vim.cursor.y].slice(vim.cursor.x);
    vim.buffer.text = lines.join('');
}
