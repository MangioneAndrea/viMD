import operators from './operators';
import word_motions from './word_motions';
import left_right_motions from './left_right_motions';
import up_down_motions from './up_down_motions';

// TODO: sort, and search by binary search
const ANY_ACTION = [
    ...Object.keys(operators),
    ...Object.keys(word_motions),
    ...Object.keys(left_right_motions),
    ...Object.keys(up_down_motions)
].sort();

export class InputDigester {
    //                              eg.  10   f   a
    //                              eg.       d   3w
    //                                  count
    //                                    | operator
    //                                    |   | parameter
    //                                    v   v   v
    buffers: [string, string, string] = ['', '', ''];
    buffer_pointer = 0;

    digest(symbol: string) {
        // Escape all non-valid
        if (['Shift'].includes(symbol)) return null;

        if (this.buffer_pointer === 0) {
            if (symbol.match(/[0-9]/)) {
                this.buffers[0] = this.buffers[0] + symbol;
            } else {
                this.buffers[1] = symbol;
                this.buffer_pointer = 1;

                const command = this.is_command_ready();
                if (command && InputDigester.is_param_required(command)) {
                    this.buffer_pointer++;
                }
            }
        } else if (this.buffer_pointer === 1) {
            // if command requires parameter
            this.buffers[0] = this.buffers[0] + symbol;
            const command = this.is_command_ready();
            if (command && InputDigester.is_param_required(command)) {
                this.buffer_pointer++;
            }
        }
    }

    is_command_ready(): boolean {
        return ANY_ACTION.includes(this.buffers[1]);
    }

    static is_param_required(c: any) {
        return typeof c === 'object';
    }
}
