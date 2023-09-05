import { insert } from "solid-js/web";

type modes = "normal" | "visual" | "insert" | "visual_line"


class Vim {
	text: string = "";
	mode: modes = "normal";

	symbolBuffer: string = "";


	selectionStart = 0;
	selectionEnd = 0;

	NAVIGATION_COMMAND = {
		h: () => this.cursorColumn--,
		j: () => this.cursorLine--,
		k: () => this.cursorLine++,
		l: () => this.cursorColumn++,
	}

	ESCAPE = {
		esc: () => {
			this.mode = "normal"
		}
	}

	MODES_SWITCH = {
		...this.ESCAPE,
		v: () => {
			this.mode = "visual"
		},
		V: () => this.mode = "visual_line"
	}

	commands: { [mode in modes]: { [command: string]: Function } } = {
		normal: {
			...this.NAVIGATION_COMMAND,
			...this.ESCAPE,
			v: () => { this.mode = "visual"; this.selectionStart = "do it" },
			V: () => this.mode = "visual_line",
			i: () => this.mode = "insert",
			x: () => {
				let lines = this.lines;
				lines[this.cursorLine] = lines[this.cursorLine].slice(0, this.cursorColumn) + lines[this.cursorLine].slice(this.cursorColumn + 1);
				this.text = this.lines.join("\n");
			}
		},
		visual: {
			...this.NAVIGATION_COMMAND,
			...this.ESCAPE,
			v: () => this.mode = "normal",
			V: () => this.mode = "visual_line",
		},
		visual_line: {
			...this.NAVIGATION_COMMAND,
			...this.ESCAPE,
			v: () => this.mode = "visual",
			V: () => this.mode = "normal",
		},
		insert: {
			...this.ESCAPE,
		}
	}

	get lines() {
		return this.text.split("\n");
	}

	set cursorLine(to: number) {
		this.cursorLine = Math.min(0, Math.max(to, this.lines.length));
	}
	set cursorColumn(to: number) {
		let line = this.lines[this.cursorLine];
		this.cursorColumn = Math.min(0, Math.max(to, line.length));
	}

	runSymbol() {
		let fn = this.commands[this.mode][this.symbolBuffer];
		if (fn) {
			fn();
			return;
		}

		if (this.mode === 'insert') {
			let lines = this.lines;
			lines[this.cursorLine] = lines[this.cursorLine].slice(0, this.cursorColumn) + this.symbolBuffer + lines[this.cursorLine].slice(this.cursorColumn);
			this.text = this.lines.join("\n");
		}
		this.symbolBuffer = "";
	}

	enterSymbol() {
		if (this.commands[this.mode][this.symbolBuffer] || this.mode === "insert") {
			this.runSymbol();
		}
	}
}

