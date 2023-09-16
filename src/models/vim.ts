import { createStore, produce } from 'solid-js/store';
import * as Cursor from './cursor';
import * as Buffer from './buffer';

type modes = 'normal' | 'visual' | 'insert' | 'visual line';
type selection = { x: number; y: number };

export type Vim = {
    buffer: Buffer.Type;
    cursor: Cursor.Type;
    mode: modes;
    symbolBuffer: string[];
    macro: string | null;
    selectionStart: selection;
    selectionEnd: selection;
    registers: Map<string, string>;
};

const NAVIGATION_COMMAND = {
    h: (vim: Vim) => {
        Cursor.left(vim, 1);
        vim.selectionEnd = { ...vim.cursor };
    },
    j: (vim: Vim) => {
        Cursor.down(vim, 1);
        vim.selectionEnd = { ...vim.cursor };
    },
    k: (vim: Vim) => {
        Cursor.up(vim, 1);
        vim.selectionEnd = { ...vim.cursor };
    },
    l: (vim: Vim) => {
        Cursor.right(vim, 1);
        vim.selectionEnd = { ...vim.cursor };
    },
    0: (vim: Vim) => {
        Cursor.start(vim);
        vim.selectionEnd = { ...vim.cursor };
    },
    $: (vim: Vim) => {
        Cursor.end(vim);
        vim.selectionEnd = { ...vim.cursor };
    }
};

const MACRO = {
    q: (vim: Vim) => {
        if (vim.macro) {
            vim.macro = null;
        }
    }
};

const startVisualMode = (vim: Vim) => {
    vim.mode = 'visual';
    vim.selectionStart = { ...vim.cursor };
    vim.selectionEnd = { ...vim.cursor };
};
const startVisualLineMode = (vim: Vim) => {
    vim.mode = 'visual line';
    vim.selectionStart = { ...vim.cursor };
    vim.selectionEnd = { ...vim.cursor };
};

type Command = { [command: string]: Function | Command };

const commands: { [mode in modes]: Command } = {
    normal: {
        ...NAVIGATION_COMMAND,
        v: startVisualMode,
        V: startVisualLineMode,
        i: (vim: Vim) => {
            vim.mode = 'insert';
        },
        a: (vim: Vim) => {
            Cursor.right(vim, 1);
            vim.mode = 'insert';
        },
        o: (vim: Vim) => {
            Buffer.new_line(vim, vim.cursor.y + 1);
            Cursor.down(vim);
            vim.mode = 'insert';
        },
        O: (vim: Vim) => {
            Buffer.new_line(vim, vim.cursor.y);
            vim.mode = 'insert';
        },
        x: (vim: Vim) => {
            Buffer.delete_from_to(vim, vim.cursor, vim.cursor);
            vim.mode = 'normal';
        },
        d: { 
	    d: (vim: Vim) => {
        	const line = Buffer.delete_line(vim, vim.cursor.y);
        	vim.registers.set('"', line);
            }, 
	    j: (vim: Vim)=>{
        	const line = Buffer.delete_lines(vim, vim.cursor.y, vim.cursor.y +1);
        	vim.registers.set('"', line[0]);
	    },
	    k: (vim: Vim)=>{
        	const line = Buffer.delete_lines(vim, vim.cursor.y -1, vim.cursor.y);
		Cursor.up(vim, 1);
        	vim.registers.set('"', line[0]);
	    }
	},
        y: {
	    y: (vim: Vim) => {
        	vim.registers.set('"', Buffer.current_line(vim));
	    },
	    j: (vim: Vim)=>{
        	vim.registers.set('"', Buffer.getLines(vim).slice(vim.cursor.y, vim.cursor.y + 2).join(""));
	    },
	    k: (vim: Vim)=>{
        	vim.registers.set('"', Buffer.getLines(vim).slice(vim.cursor.y -1 , vim.cursor.y + 1).join(""));
	    }
        },
        p: (vim: Vim) => {
            const text = vim.registers.get('"') || '';
            Buffer.write(vim, text);
        },
        P: (vim: Vim) => {
            const text = vim.registers.get('"') || '';
            Buffer.write(vim, text);
        },
        u: (vim: Vim) => {
            Buffer.history_backwards(vim);
        },
        r: (vim: Vim) => {
            Buffer.history_forwards(vim);
        }
    },
    visual: {
        ...NAVIGATION_COMMAND,
        v: (vim: Vim) => (vim.mode = 'normal'),
        V: startVisualLineMode,
        y: (vim: Vim) => {
            vim.mode = 'normal';
        },
        x: (vim: Vim) => {
            Buffer.delete_from_to(vim, vim.selectionStart, vim.selectionEnd);
            Cursor.go_to(vim, vim.selectionStart);
            vim.mode = 'normal';
        },
        d: (vim: Vim) => {
            Buffer.delete_from_to(vim, vim.selectionStart, vim.selectionEnd);
            Cursor.go_to(vim, vim.selectionStart);
            vim.mode = 'normal';
        }
    },
    'visual line': {
        ...NAVIGATION_COMMAND,
        v: startVisualMode,
        V: (vim: Vim) => (vim.mode = 'normal'),
        y: (vim: Vim) => {
            vim.mode = 'normal';
        },
        x: (vim: Vim) => {
            Buffer.delete_lines(vim, vim.selectionStart.y, vim.selectionEnd.y);
            Cursor.go_to(vim, vim.selectionStart);
            vim.mode = 'normal';
        },
        d: (vim: Vim) => {
            console.log(vim.selectionStart.y, vim.selectionEnd.y);
            Buffer.delete_lines(vim, vim.selectionStart.y, vim.selectionEnd.y);
            Cursor.go_to(vim, vim.selectionStart);
            vim.mode = 'normal';
        }
    },
    insert: {
        Enter: (vim: Vim) => {
            Buffer.write(vim, '\n');
            Cursor.down(vim);
            Cursor.left(vim, Infinity);
        },
        Backspace: (vim: Vim) => {}
    }
};

export const enterSymbol = (symbol: string) => {
    setVim(
        produce((vim) => {
            if (['Shift'].includes(symbol)) return;
            vim.symbolBuffer.push(symbol);

            if (symbol === 'Escape') {
                vim.symbolBuffer = [];
                if (vim.mode === 'insert') {
                    Cursor.left(vim);
                }
                vim.mode = 'normal';
            }

	    let pointedCommand: any = commands[vim.mode];
	    for(let partial of vim.symbolBuffer){
		    pointedCommand = pointedCommand[partial];
	    }
            if (!pointedCommand && vim.mode !== 'insert'){
            	vim.symbolBuffer = [];
                return;
	    }

            if (typeof pointedCommand === "function") {
                pointedCommand(vim);
                vim.symbolBuffer = [];
                return;
            }

            if (vim.mode === 'insert') {
                Buffer.writeBuffer(vim);
                Cursor.right(vim);
		vim.symbolBuffer = [];
            }
        })
    );
    console.log('done');
};

const [vim, setVim] = createStore<Vim>({
    buffer: Buffer.default_buffer(),
    mode: 'normal',
    symbolBuffer: [],
    cursor: {
        x: 0,
        y: 0,
        preferredX: 0
    },
    macro: null,
    registers: new Map(),
    selectionStart: {
        x: 0,
        y: 0
    },
    selectionEnd: {
        x: 0,
        y: 0
    }
});

export const vimState = vim;
