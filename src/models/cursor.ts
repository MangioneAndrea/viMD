import * as Buffer from "./buffer";
import { Vim } from "./vim";

export type Type = {
	x: number;
	y: number;
	preferredX: number;
};

export function up(vim: Vim, amount: number = 1) {
	setCursorLine(vim, vim.cursor.y - amount);
}
export function down(vim: Vim, amount: number = 1) {
	setCursorLine(vim, vim.cursor.y + amount);
}
export function left(vim: Vim, amount: number = 1) {
	setCursorColumn(vim, vim.cursor.x - amount);
}
export function right(vim: Vim, amount: number = 1) {
	setCursorColumn(vim, vim.cursor.x + amount);
}

export function setCursorLine(vim: Vim, to: number) {
	vim.cursor.y = Math.max(
		0,
		Math.min(to, Buffer.getLines(vim).length - 1)
	);
	setCursorColumn(vim, vim.cursor.x); // wrong, but at least not out of buffer
}
export function setCursorColumn(vim: Vim, to: number) {
	let line = Buffer.getLines(vim)[vim.cursor.y];
	if (line !== undefined)
		vim.cursor.x = Math.max(0, Math.min(to, line.length - 2));
}
