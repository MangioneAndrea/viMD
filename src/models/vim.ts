import { createStore, produce } from 'solid-js/store';
import * as Cursor from './cursor';
import * as Buffer from './buffer';

type modes = 'normal' | 'visual' | 'insert' | 'visual line';

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
    mode: 'normal',
    symbolBuffer: '',
    cursor: {
        x: 0,
        y: 0,
        preferredX: 0
    },
    macro: null,
    registers: new Map()
});

export const vimState = vim;

const NAVIGATION_COMMAND = {
    h: (vim: Vim) => Cursor.left(vim, 1),
    j: (vim: Vim) => Cursor.down(vim, 1),
    k: (vim: Vim) => Cursor.up(vim, 1),
    l: (vim: Vim) => Cursor.right(vim, 1),
    0: (vim: Vim) => Cursor.start(vim),
    $: (vim: Vim) => Cursor.end(vim)
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

const commands: { [mode in modes]: { [command: string]: Function } } = {
    normal: {
        ...NAVIGATION_COMMAND,
        v: (vim: Vim) => {
            vim.mode = 'visual';
        },
        V: (vim: Vim) => (vim.mode = 'visual line'),
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
        V: (vim: Vim) => (vim.mode = 'visual line'),
        y: (vim: Vim) => {
            vim.mode = 'normal';
        }
    },
    'visual line': {
        ...NAVIGATION_COMMAND,
        v: (vim: Vim) => (vim.mode = 'visual'),
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
