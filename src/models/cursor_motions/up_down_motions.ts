const up_down_motions = {
    // [count] lines upward |linewise|.
    k: () => {},
    ArrowUp: () => {},
    // [count] lines downward |linewise|.
    j: () => {},
    ArrowDown: () => {},
    Enter: () => {},
    // [count] display lines upward.  |exclusive| motion.
    // Differs from 'k' when lines wrap, and when used with
    // an operator, because it's not linewise.
    gk: () => {},
    gArrowUp: () => {},
    // [count] display lines downward.  |exclusive| motion.
    // Differs from 'j' when lines wrap, and when used with
    // an operator, because it's not linewise.
    gj: () => {},
    gArrowDown: () => {},
    // [count] lines upward, on the first non-blank
    // character |linewise|.
    '-': () => {},
    // [count] lines downward, on the first non-blank
    // character |linewise|.
    '+': () => {},
    // [count] - 1 lines downward, on the first non-blank
    // character |linewise|.
    _: () => {},
    // Goto line [count], default last line, on the first
    // non-blank character |linewise|.
    G: () => {},
    // Goto line [count], default first line, on the first
    // non-blank character |linewise|.  If 'startofline' not
    // set, keep the same column.
    gg: () => {}
};

/*
:[range]		Set the cursor on the last line number in [range].
			[range] can also be just one line number, e.g., ":1"
			or ":'m".
			In contrast with |G| this command does not modify the
			|jumplist|.

{count}%		Go to {count} percentage in the file, on the first
			non-blank in the line |linewise|.  To compute the new
			line number this formula is used:
			    ({count} * number-of-lines + 99) / 100
			See also 'startofline' option.  {not in Vi}
*/
