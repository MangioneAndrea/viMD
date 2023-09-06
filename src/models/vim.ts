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
	macro: string | null;
	registers: Map<string, string>
}
const [vim, setVim] = createStore<Vim>({
	text: "hi\nhello -\n asdas   ^\n \n ",
	mode: "normal",
	symbolBuffer: "",
	selectionStart: 0,
	selectionEnd: 0,
	cursorLine: 0,
	cursorColumn: 0,
	macro: null,
	registers: new Map(),
})

export const vimState = vim;


const NAVIGATION_COMMAND = {
	h: (vim: Vim) => setCursorColumn(vim, vim.cursorColumn - 1),
	j: (vim: Vim) => setCursorLine(vim, vim.cursorLine + 1),
	k: (vim: Vim) => setCursorLine(vim, vim.cursorLine - 1),
	l: (vim: Vim) => setCursorColumn(vim, vim.cursorColumn + 1),
}


const MODES_SWITCH = {
	v: (vim: Vim) => {
		vim.mode = "visual"
	},
	V: (vim: Vim) => vim.mode = "visual line"
}

const MACRO = {
	q: (vim: Vim) => {
		if (vim.macro) {
			vim.macro = null
		}
	}
}

const commands: { [mode in modes]: { [command: string]: Function } } = {
	normal: {
		...NAVIGATION_COMMAND,
		v: (vim: Vim) => { vim.mode = "visual"; },
		V: (vim: Vim) => vim.mode = "visual line",
		i: (vim: Vim) => vim.mode = "insert",
		o: (vim: Vim) => {
			let lines = getLines(vim);
			lines.splice(vim.cursorLine + 1, 0, " ");
			vim.text = lines.join("");
			setCursorLine(vim, vim.cursorLine + 1);
			vim.mode = "insert";
		},
		O: (vim: Vim) => {
			let lines = getLines(vim);
			lines.splice(vim.cursorLine, 0, " ");
			vim.text = lines.join("");
			vim.mode = "insert";
		},
		a: (vim: Vim) => {
			setCursorColumn(vim, vim.cursorColumn + 1)
			vim.mode = "insert"
		},
		x: (vim: Vim) => {
			let lines = getLines(vim);
			lines[vim.cursorLine] = lines[vim.cursorLine].slice(0, vim.cursorColumn) + lines[vim.cursorLine].slice(vim.cursorColumn + 1);
			vim.text = lines.join("");
		},
		dd: (vim: Vim) => {
			let lines = getLines(vim);
			let line = lines.splice(vim.cursorLine, 1)[0];
			vim.registers.set('"', line)
			vim.text = lines.join("");
		},
		yy: (vim: Vim) => {
			vim.registers.set('"', getLines(vim)[vim.cursorLine])
		},
		p: (vim: Vim) => {
			const lines = getLines(vim)
			lines.splice(vim.cursorLine + 1, 0, vim.registers.get('"') || "");
			vim.text = lines.join("");
			setCursorLine(vim, vim.cursorLine + 1);
		},
		P: (vim: Vim) => {
			const lines = getLines(vim)
			lines.splice(vim.cursorLine, 0, vim.registers.get('"') || "");
			vim.text = lines.join("");
		}
	},
	visual: {
		...NAVIGATION_COMMAND,
		v: (vim: Vim) => vim.mode = "normal",
		V: (vim: Vim) => vim.mode = "visual line",
		y: (vim: Vim) => {
			vim.mode = "normal"
		}
	},
	"visual line": {
		...NAVIGATION_COMMAND,
		v: (vim: Vim) => vim.mode = "visual",
		V: (vim: Vim) => vim.mode = "normal",
		y: (vim: Vim) => {
			vim.mode = "normal"
		}
	},
	insert: {
	}
}



export function getLines(vim: Vim) {
	return vim.text.split("\n").map((str, idx, all) => idx < all.length - 1 ? str + "\n" : str)
}

export function setCursorLine(vim: Vim, to: number) {
	vim.cursorLine = Math.max(0, Math.min(to, getLines(vim).length - 1));
	setCursorColumn(vim, vim.cursorColumn); // wrong, but at least not out of buffer
}
export function setCursorColumn(vim: Vim, to: number) {
	let line = getLines(vim)[vim.cursorLine];
	if (line !== undefined)
		vim.cursorColumn = Math.max(0, Math.min(to, line.length - 1));
}


export const enterSymbol = (symbol: string) => setVim(produce(vim => {
	if (["Shift"].includes(symbol)) return;
	vim.symbolBuffer += symbol;

	if (symbol === "Escape") {
		vim.symbolBuffer = ""
		if (vim.mode === "insert") {
			setCursorColumn(vim, vim.cursorColumn - 1)
		}
		vim.mode = "normal"
	}
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
		vim.text = lines.join("");
		vim.symbolBuffer = "";
		setCursorColumn(vim, vim.cursorColumn + 1);
	}
	vim.symbolBuffer = "";
}))

