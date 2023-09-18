import * as Buffer from './buffer';
import { Vim } from './vim';

export type Type = {
    x: number;
    y: number;
    preferredX: number;
};

export function up(vim: Vim, amount: number = 1) {
    vim.cursor.x = vim.cursor.preferredX;
    set_cursor_line(vim, vim.cursor.y - amount);
}
export function down(vim: Vim, amount: number = 1) {
    vim.cursor.x = vim.cursor.preferredX;
    set_cursor_line(vim, vim.cursor.y + amount);
}
export function left(vim: Vim, amount: number = 1) {
    set_cursor_column(vim, vim.cursor.x - amount);
    vim.cursor.preferredX = vim.cursor.x;
}
export function right(vim: Vim, amount: number = 1) {
    set_cursor_column(vim, vim.cursor.x + amount);
    vim.cursor.preferredX = vim.cursor.x;
}

export function right_inclusive(vim: Vim, amount: number = 1) {
    set_cursor_column(vim, vim.cursor.x + amount, true);
    vim.cursor.preferredX = vim.cursor.x;
}

export function start(vim: Vim) {
    vim.cursor.preferredX = 0;
    set_cursor_column(vim, 0);
}
export function end(vim: Vim) {
    vim.cursor.preferredX = Infinity;
    set_cursor_column(vim, Infinity);
}

export function set_cursor_line(vim: Vim, to: number) {
    vim.cursor.y = Math.max(0, Math.min(to, Buffer.getLines(vim).length - 1));
    set_cursor_column(vim, vim.cursor.x);
}
export function set_cursor_column(
    vim: Vim,
    to: number,
    include_last: boolean = false
) {
    let line = Buffer.getLines(vim)[vim.cursor.y];
    if (line !== undefined) {
        vim.cursor.x = Math.max(
            0,
            Math.min(to, line.length - (2 - Number(include_last)))
        );
    }
}

export function go_to(vim: Vim, to: { x: number; y: number }) {
    set_cursor_line(vim, to.y);
    set_cursor_column(vim, to.x);
}
