import { createStore, produce } from "solid-js/store";
import * as Cursor from "./cursor";
import * as Buffer from "./buffer";

type modes = "normal" | "visual" | "insert" | "visual line";

export type Vim = {
	buffer: Buffer.Type;
	cursor: Cursor.Type;
	mode: modes;
	symbolBuffer: string;
	macro: string | null;
	registers: Map<string, string>;
};
const [vim, setVim] = createStore<Vim>({
	buffer: Buffer.default_buffer(),
	mode: "normal",
	symbolBuffer: "",
	cursor: {
		x: 0,
		y: 0,
		preferredX: 0,
	},
	macro: null,
	registers: new Map(),
});

export const vimState = vim;

const NAVIGATION_COMMAND = {
	h: (vim: Vim) => Cursor.left(vim, 1),
	j: (vim: Vim) => Cursor.down(vim, 1),
	k: (vim: Vim) => Cursor.up(vim, 1),
	l: (vim: Vim) => Cursor.right(vim, 1),
};

const MODES_SWITCH = {
	v: (vim: Vim) => {
		vim.mode = "visual";
	},
	V: (vim: Vim) => (vim.mode = "visual line"),
};

const MACRO = {
	q: (vim: Vim) => {
		if (vim.macro) {
			vim.macro = null;
		}
	},
};

const commands: { [mode in modes]: { [command: string]: Function } } = {
	normal: {
		...NAVIGATION_COMMAND,
		v: (vim: Vim) => {
			vim.mode = "visual";
		},
		V: (vim: Vim) => (vim.mode = "visual line"),
		i: (vim: Vim) => {
			storeStatus(vim);
			vim.mode = "insert";
		},
		a: (vim: Vim) => {
			storeStatus(vim);
			Cursor.right(vim, 1);
			vim.mode = "insert";
		},
		o: (vim: Vim) => {
			Buffer.new_line(vim, vim.cursor.y + 1);
			Cursor.down(vim);
			vim.mode = "insert";
		},
		O: (vim: Vim) => {
			Buffer.new_line(vim, vim.cursor.y);
			vim.mode = "insert";
		},
		x: (vim: Vim) => {
			storeStatus(vim);
			storeStatus(vim);
			let lines = getLines(vim);
			lines[vim.cursorLine] =
				lines[vim.cursorLine].slice(
					0,
					vim.cursorColumn
				) +
				lines[vim.cursorLine].slice(
					vim.cursorColumn + 1
				);
			vim.text = lines.join("");
		},
		dd: (vim: Vim) => {
			storeStatus(vim);
			let lines = getLines(vim);
			let line = lines.splice(vim.cursorLine, 1)[0];
			vim.registers.set('"', line);
			vim.text = lines.join("");
		},
		yy: (vim: Vim) => {
			storeStatus(vim);
			vim.registers.set('"', getLines(vim)[vim.cursorLine]);
		},
		p: (vim: Vim) => {
			storeStatus(vim);
			const lines = getLines(vim);
			lines.splice(
				vim.cursorLine + 1,
				0,
				vim.registers.get('"') || ""
			);
			vim.text = lines.join("");
			setCursorLine(vim, vim.cursorLine + 1);
		},
		P: (vim: Vim) => {
			storeStatus(vim);
			const lines = getLines(vim);
			lines.splice(
				vim.cursorLine,
				0,
				vim.registers.get('"') || ""
			);
			vim.text = lines.join("");
		},
		u: (vim: Vim) => {
			if (vim.history) {
				vim.text = vim.history.text;
				vim.history = vim.history.previous;
			}
		},
	},
	visual: {
		...NAVIGATION_COMMAND,
		v: (vim: Vim) => (vim.mode = "normal"),
		V: (vim: Vim) => (vim.mode = "visual line"),
		y: (vim: Vim) => {
			vim.mode = "normal";
		},
	},
	"visual line": {
		...NAVIGATION_COMMAND,
		v: (vim: Vim) => (vim.mode = "visual"),
		V: (vim: Vim) => (vim.mode = "normal"),
		y: (vim: Vim) => {
			vim.mode = "normal";
		},
	},
	insert: {
		Enter: (vim: Vim) => {
			let lines = getLines(vim);
			lines[vim.cursorLine] =
				lines[vim.cursorLine].slice(
					0,
					vim.cursorColumn
				) +
				"\n" +
				lines[vim.cursorLine].slice(vim.cursorColumn);
			vim.text = lines.join("");
			vim.symbolBuffer = "";
			setCursorLine(vim, vim.cursorLine + 1);
			setCursorColumn(vim, 0);
		},
	},
};

export const enterSymbol = (symbol: string) => {
	setVim(
		produce((vim) => {
			if (["Shift"].includes(symbol)) return;
			vim.symbolBuffer += symbol;

			if (symbol === "Escape") {
				vim.symbolBuffer = "";
				if (vim.mode === "insert") {
					Cursor.up(vim);
				}
				vim.mode = "normal";
			}
			if (
				!commands[vim.mode][vim.symbolBuffer] &&
				vim.mode !== "insert"
			)
				return;

			let fn = commands[vim.mode][vim.symbolBuffer];
			if (fn) {
				fn(vim);
				vim.symbolBuffer = "";
				return;
			}

			if (vim.mode === "insert") {
				Buffer.writeBuffer(vim);
				Cursor.down(vim);
			}
			vim.symbolBuffer = "";
		})
	);
	console.log("done");
};
