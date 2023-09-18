const word_motions = {
    // [count] words forward.  |exclusive| motion.
    w: () => {},
    // [count] WORDS forward.  |exclusive| motion.
    W: () => {},
    // Forward to the end of word [count] |inclusive|.
    // Does not stop in an empty line.
    e: () => {},
    // Forward to the end of WORD [count] |inclusive|.
    // Does not stop in an empty line.
    E: () => {},
    // [count] words backward.  |exclusive| motion.
    b: () => {},
    // [count] WORDS backward.  |exclusive| motion.
    B: () => {},
    // Backward to the end of word [count] |inclusive|.
    ge: () => {},
    // Backward to the end of WORD [count] |inclusive|.
    gE: () => {}
};

/*
A word consists of a sequence of letters, digits and underscores, or a
sequence of other non-blank characters, separated with white space (spaces,
tabs, <EOL>).  This can be changed with the 'iskeyword' option.  An empty line
is also considered to be a word.

A WORD consists of a sequence of non-blank characters, separated with white
space.  An empty line is also considered to be a WORD.
*/
