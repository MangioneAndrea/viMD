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

export function delete_lines(vim: Vim, a: number, b: number) {
    let from = Math.min(a, b);
    let count = Math.max(a, b) - from;

    let lines = getLines(vim);
    let res = lines.splice(from, count);
    vim.buffer.text = lines.join('');
    return res;
}
export function delete_from_to(
    vim: Vim,
    a: { x: number; y: number },
    b: { x: number; y: number }
) {
    let top: { x: number; y: number };
    let bottom: { x: number; y: number };

    if (a.y > b.y) {
        top = b;
        bottom = a;
    } else if (a.y < b.y) {
        top = a;
        bottom = b;
    } else if (a.x < b.x) {
        top = a;
        bottom = b;
    } else {
        top = b;
        bottom = a;
    }

    const lines = getLines(vim)
        .map((line, idx) => {
            if (idx !== top.y && idx !== bottom.y) return line;

            if (top.y === bottom.y) {
                return line.slice(0, top.x) + line.slice(bottom.x + 1);
            } else if (idx === top.y) {
                return line.slice(0, top.x);
            } else {
                return line.slice(bottom.x + 1);
            }
        })
        .filter((_, idx) => idx <= top.y || idx >= bottom.y);
    vim.buffer.text = lines.join('');
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
