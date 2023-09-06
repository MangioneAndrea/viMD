import { createStore, produce } from "solid-js/store";

type modes = "normal" | "visual" | "insert" | "visual line"

type Vim = {
	text: string,
	mode: modes,
	symbolBuffer: string,
	selectionStart: number,
	selectionEnd: number,
	cursorLine: number,
	cursorColumn: number
}
const [vim, setVim] = createStore<Vim>({
	text: "hi\nhello -\n asdas   ^\n \n ",
	mode: "normal",
	symbolBuffer: "",
	selectionStart: 0,
	selectionEnd: 0,
	cursorLine: 0,
	cursorColumn: 0
})

export const vimState = vim;


const NAVIGATION_COMMAND = {
	h: (vim: Vim) => setCursorColumn(vim, vim.cursorColumn - 1),
	j: (vim: Vim) => setCursorLine(vim, vim.cursorLine + 1),
	k: (vim: Vim) => setCursorLine(vim, vim.cursorLine - 1),
	l: (vim: Vim) => setCursorColumn(vim, vim.cursorColumn + 1),
}

const ESCAPE = {
	Escape: (vim: Vim) => {
		vim.mode = "normal"
	}
}

const MODES_SWITCH = {
	...ESCAPE,
	v: (vim: Vim) => {
		vim.mode = "visual"
	},
	V: (vim: Vim) => vim.mode = "visual line"
}

const commands: { [mode in modes]: { [command: string]: Function } } = {
	normal: {
		...NAVIGATION_COMMAND,
		...ESCAPE,
		v: (vim: Vim) => { vim.mode = "visual"; },
		V: (vim: Vim) => vim.mode = "visual line",
		i: (vim: Vim) => vim.mode = "insert",
		x: (vim: Vim) => {
			let lines = getLines(vim);
			lines[vim.cursorLine] = lines[vim.cursorLine].slice(0, vim.cursorColumn) + lines[vim.cursorLine].slice(vim.cursorColumn + 1);
			vim.text = lines.join("\n");
		}
	},
	visual: {
		...NAVIGATION_COMMAND,
		...ESCAPE,
		v: (vim: Vim) => vim.mode = "normal",
		V: (vim: Vim) => vim.mode = "visual line",
	},
	"visual line": {
		...NAVIGATION_COMMAND,
		...ESCAPE,
		v: (vim: Vim) => vim.mode = "visual",
		V: (vim: Vim) => vim.mode = "normal",
	},
	insert: {
		...ESCAPE,
	}
}



export function getLines(vim: Vim) {
	return vim.text.split("\n");
}

export function setCursorLine(vim: Vim, to: number) {
	vim.cursorLine = Math.max(0, Math.min(to, getLines(vim).length - 1));
}
export function setCursorColumn(vim: Vim, to: number) {
	let line = getLines(vim)[vim.cursorLine];
	if (line !== undefined)
		vim.cursorColumn = Math.max(0, Math.min(to, line.length - 1));
}


export const enterSymbol = (symbol: string) => setVim(produce(vim => {
	if (["Shift"].includes(symbol)) return;
	vim.symbolBuffer += symbol;

	if (!commands[vim.mode][vim.symbolBuffer] && vim.mode !== "insert") return
	let fn = commands[vim.mode][vim.symbolBuffer];
	if (fn) {
		fn(vim);
		vim.symbolBuffer = "";
		return;
	}

	if (vim.mode === 'insert') {
		let lines = getLines(vim);
		lines[vim.cursorLine] = lines[vim.cursorLine].slice(0, vim.cursorColumn) + vim.symbolBuffer + lines[vim.cursorLine].slice(vim.cursorColumn);
		vim.text = lines.join("\n");
		vim.symbolBuffer = "";
	}
	vim.symbolBuffer = "";
}))

