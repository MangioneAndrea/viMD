import { createStore, produce } from 'solid-js/store';
import * as cursor from './cursor';
import * as buffer from './buffer';
import * as motions from './cursor_motions';

type modes = 'normal' | 'visual' | 'insert' | 'visual line';
type selection = { x: number; y: number };

export type Vim = {
    buffer:  buffer.Buffer;
    inputDigester:  motions.InputDigester;
    cursor: cursor.Type;
    mode: modes;
    symbolbuffer: string[];
    macro: string | null;
    selectionStart: selection;
    selectionEnd: selection;
    registers: Map<string, string>;
};

const NAVIGATION_COMMAND = {
    h: (vim: Vim) => {
        cursor.left(vim, 1);
        vim.selectionEnd = { ...vim.cursor };
    },
    j: (vim: Vim) => {
        cursor.down(vim, 1);
        vim.selectionEnd = { ...vim.cursor };
    },
    k: (vim: Vim) => {
        cursor.up(vim, 1);
        vim.selectionEnd = { ...vim.cursor };
    },
    l: (vim: Vim) => {
        cursor.right(vim, 1);
        vim.selectionEnd = { ...vim.cursor };
    },
    0: (vim: Vim) => {
        cursor.start(vim);
        vim.selectionEnd = { ...vim.cursor };
    },
    $: (vim: Vim) => {
        cursor.end(vim);
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
            cursor.right_inclusive(vim, 1);
            vim.mode = 'insert';
        },
        o: (vim: Vim) => {
            buffer.new_line(vim, vim.cursor.y + 1);
            cursor.down(vim);
            vim.mode = 'insert';
        },
        O: (vim: Vim) => {
            buffer.new_line(vim, vim.cursor.y); 
            vim.mode = 'insert';
        },
        x: (vim: Vim) => {
            buffer.delete_from_to(vim, vim.cursor, vim.cursor);
            vim.mode = 'normal';
        },
        d: {
            d: (vim: Vim) => {
                const line = buffer.delete_line(vim, vim.cursor.y);
                vim.registers.set('"', line);
            },
            j: (vim: Vim) => {
                const line = buffer.delete_lines(
                    vim,
                    vim.cursor.y,
                    vim.cursor.y + 1
                );
                vim.registers.set('"', line[0]);
            },
            k: (vim: Vim) => {
                const line = buffer.delete_lines(
                    vim,
                    vim.cursor.y - 1,
                    vim.cursor.y
                );
                cursor.up(vim, 1);
                vim.registers.set('"', line[0]);
            }
        },
        y: {
            y: (vim: Vim) => {
                vim.registers.set('"', buffer.current_line(vim));
            },
            j: (vim: Vim) => {
                vim.registers.set(
                    '"',
                    buffer.getLines(vim)
                        .slice(vim.cursor.y, vim.cursor.y + 2)
                        .join('')
                );
            },
            k: (vim: Vim) => {
                vim.registers.set(
                    '"',
                    buffer.getLines(vim)
                        .slice(vim.cursor.y - 1, vim.cursor.y + 1)
                        .join('')
                );
            }
        },
        p: (vim: Vim) => {
            const text = vim.registers.get('"') || '';
            buffer.write(vim, text);
        },
        P: (vim: Vim) => {
            const text = vim.registers.get('"') || '';
            buffer.write(vim, text);
        },
        u: (vim: Vim) => {
            buffer.history_backwards(vim);
        },
        r: (vim: Vim) => {
            buffer.history_forwards(vim);
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
            buffer.delete_from_to(vim, vim.selectionStart, vim.selectionEnd);
            cursor.go_to(vim, vim.selectionStart);
            vim.mode = 'normal';
        },
        d: (vim: Vim) => {
            buffer.delete_from_to(vim, vim.selectionStart, vim.selectionEnd);
            cursor.go_to(vim, vim.selectionStart);
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
            buffer.delete_lines(vim, vim.selectionStart.y, vim.selectionEnd.y);
            cursor.go_to(vim, vim.selectionStart);
            vim.mode = 'normal';
        },
        d: (vim: Vim) => {
            buffer.delete_lines(vim, vim.selectionStart.y, vim.selectionEnd.y);
            cursor.go_to(vim, vim.selectionStart);
            vim.mode = 'normal';
        }
    },
    insert: {
        Enter: (vim: Vim) => {
            buffer.write(vim, '\n');
            cursor.down(vim);
            cursor.left(vim, Infinity);
        },
        Backspace: (vim: Vim) => {}
    }
};

export const enterSymbol = (symbol: string) => {
    setVim(
        produce((vim) => {
            if (['Shift'].includes(symbol)) return;
            vim.symbolbuffer.push(symbol);

            if (symbol === 'Escape') {
                vim.symbolbuffer = [];
                if (vim.mode === 'insert') {
                    cursor.left(vim);
                }
                vim.mode = 'normal';
            }

            let pointedCommand: any = commands[vim.mode];
            for (let partial of vim.symbolbuffer) {
                pointedCommand = pointedCommand[partial];
            }
            if (!pointedCommand && vim.mode !== 'insert') {
                vim.symbolbuffer = [];
                return;
            }

            if (typeof pointedCommand === 'function') {
                pointedCommand(vim);
                vim.symbolbuffer = [];
                return;
            }

            if (vim.mode === 'insert') {
                if (symbol.length === 1) {
                    buffer.writebuffer(vim);
                    cursor.right_inclusive(vim);
                }
                vim.symbolbuffer = [];
            }
        })
    );
};

const [vim, setVim] = createStore<Vim>({
    buffer: new buffer.Buffer(),
    inputDigester: new motions.InputDigester(),
    mode: 'normal',
    symbolbuffer: [],
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
