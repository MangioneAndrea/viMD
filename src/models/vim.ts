import { createStore, produce } from 'solid-js/store';
import * as Cursor from './cursor';
import * as Buffer from './buffer';

type modes = 'normal' | 'visual' | 'insert' | 'visual line';
type selection = { x: number; y: number };

export type Vim = {
    buffer: Buffer.Type;
    cursor: Cursor.Type;
    mode: modes;
    symbolBuffer: string;
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

const MODES_SWITCH = {
    v: (vim: Vim) => {
        vim.mode = 'visual';
    },
    V: (vim: Vim) => (vim.mode = 'visual line')
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
const commands: { [mode in modes]: { [command: string]: Function } } = {
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
            let lines = getLines(vim);
            lines[vim.cursorLine] =
                lines[vim.cursorLine].slice(0, vim.cursorColumn) +
                lines[vim.cursorLine].slice(vim.cursorColumn + 1);
            vim.text = lines.join('');
        },
        dd: (vim: Vim) => {
            const line = Buffer.delete_line(vim, vim.cursor.y);
            vim.registers.set('"', line);
        },
        yy: (vim: Vim) => {
            vim.registers.set('"', Buffer.current_line(vim));
        },
        p: (vim: Vim) => {
            const text = vim.registers.get('"') || '';
            Buffer.write(vim, text);
        },
        P: (vim: Vim) => {
            const text = vim.registers.get('"') || '';
            Buffer.write(vim, text);
        },
        u: (vim: Vim) => {}
    },
    visual: {
        ...NAVIGATION_COMMAND,
        v: (vim: Vim) => (vim.mode = 'normal'),
        V: startVisualLineMode,
        y: (vim: Vim) => {
            vim.mode = 'normal';
        }
    },
    'visual line': {
        ...NAVIGATION_COMMAND,
        v: startVisualMode,
        V: (vim: Vim) => (vim.mode = 'normal'),
        y: (vim: Vim) => {
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
            vim.symbolBuffer += symbol;

            if (symbol === 'Escape') {
                vim.symbolBuffer = '';
                if (vim.mode === 'insert') {
                    Cursor.up(vim);
                }
                vim.mode = 'normal';
            }
            if (!commands[vim.mode][vim.symbolBuffer] && vim.mode !== 'insert')
                return;

            let fn = commands[vim.mode][vim.symbolBuffer];
            if (fn) {
                fn(vim);
                vim.symbolBuffer = '';
                return;
            }

            if (vim.mode === 'insert') {
                Buffer.writeBuffer(vim);
                Cursor.right(vim);
            }
            vim.symbolBuffer = '';
        })
    );
    console.log('done');
};

const [vim, setVim] = createStore<Vim>({
    buffer: Buffer.default_buffer(),
    mode: 'normal',
    symbolBuffer: '',
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
