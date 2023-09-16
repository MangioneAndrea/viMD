import { Vim } from './vim';

type History = {
    currentIndex: number;
    entries: Array<{
        text: string;
    }>;
};

export type Type = {
    text: string;
    selectionStart: number;
    selectionEnd: number;
    history: History;
};
export const default_buffer = () => ({
    text: 
`# Welcome to viMD

use the classic vim motions to write the markdown


To use the system clipboard, you can use \`ctrl + p\`, it is equivalent to the more common \`'+p\`

# More about the program

This is not a fork of vim or such. This projects just reuses a subset of vim motions.

## Issues

Found any issue? Feel free to create a ticket or submit a pr to \`https://github.com/MangioneAndrea/viMD\`
`,
    mode: 'normal',
    symbolBuffer: [],
    selectionStart: 0,
    selectionEnd: 0,
    cursor: {
        x: 0,
        y: 0,
        preferredX: 0
    },
    macro: null,
    registers: new Map(),
    history: {
        currentIndex: 0,
        entries: [
            {
                text: 'hi\nhello -\n asdas   ^\n \n '
            }
        ]
    }
});

export function new_line(vim: Vim, at: number) {
    let lines = getLines(vim);
    lines.splice(at, 0, ' ');
    vim.buffer.text = lines.join('');
    store_status(vim);
}

export function delete_line(vim: Vim, at: number) {
    let lines = getLines(vim);
    let res = lines.splice(at, 1);
    vim.buffer.text = lines.join('');
    store_status(vim);
    return res[0];
}

export function current_line(vim: Vim) {
    return getLines(vim)[vim.cursor.y];
}

function store_status(vim: Vim) {
    vim.buffer.history.currentIndex++;
    vim.buffer.history.entries.splice(
        vim.buffer.history.currentIndex,
        Infinity,
        {
            text: vim.buffer.text
        }
    );
}

export function history_backwards(vim: Vim) {
    vim.buffer.history.currentIndex = Math.max(
        0,
        vim.buffer.history.currentIndex - 1
    );
    vim.buffer.text =
        vim.buffer.history.entries[vim.buffer.history.currentIndex].text;
}
export function history_forwards(vim: Vim) {
    vim.buffer.history.currentIndex = Math.min(
        vim.buffer.history.entries.length - 1,
        vim.buffer.history.currentIndex + 1
    );
    vim.buffer.text =
        vim.buffer.history.entries[vim.buffer.history.currentIndex].text;
}

export function delete_lines(vim: Vim, a: number, b: number) {
    let from = Math.min(a, b);
    let count = Math.max(a, b) - from + 1;

    let lines = getLines(vim);
    let res = lines.splice(from, count);
    vim.buffer.text = lines.join('');
    store_status(vim);
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
    store_status(vim);
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
        vim.symbolBuffer.join() +
        lines[vim.cursor.y].slice(vim.cursor.x);
    vim.buffer.text = lines.join('');
    vim.symbolBuffer = [];
    store_status(vim);
}

export function write(vim: Vim, text: string) {
    let lines = getLines(vim);
    lines[vim.cursor.y] =
        lines[vim.cursor.y].slice(0, vim.cursor.x) +
        text +
        lines[vim.cursor.y].slice(vim.cursor.x);
    vim.buffer.text = lines.join('');
    store_status(vim);
}
