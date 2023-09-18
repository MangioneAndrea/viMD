export const left_right_motions = {
    // [count] characters to the left.  |exclusive| motion.
    h: () => {},
    LeftArrow: () => {},
    Backspace: () => {},
    // [count] characters to the right.  |exclusive| motion.
    l: () => {},
    RightArrow: () => {},
    // To the first character of the line.  |exclusive| motion.
    // When moving up or down next, stay in same
    // TEXT column (if possible).  Most other commands stay
    // in the same SCREEN column.
    0: () => {},
    Home: () => {},
    // To the first non-blank character of the line.  |exclusive| motion.
    '^': () => {},
    // To the end of the line.  When a count is given also go
    // [count - 1] lines downward |inclusive|.
    // In Visual mode the cursor goes to just after the last
    // character in the line.
    $: () => {},
    // To the last non-blank character of the line and
    // [count - 1] lines downward |inclusive|.
    g_: () => {},
    // To the first character of
    // the screen line.  |exclusive| motion.  Differs from
    // "0" when a line is wider than the screen.
    g0: () => {},
    // To the first non-blank
    // character of the screen line.  |exclusive| motion.
    // Differs from "^" when a line is wider than the screen.
    'g^': () => {},
    // Like "g0", but half a screenwidth to the right (or as much as possible).
    gm: () => {},
    // To the last character of
    // the screen line and [count - 1] screen lines downward
    // |inclusive|.  Differs from "$" when a line is wider
    // than the screen.
    g$: () => {},
    // To screen column [count] in the current line.
    // |exclusive| motion.  Ceci n'est pas une pipe.
    '|': () => {},
    //To [count]'th occurrence of {char} to the right.  The
    // cursor is placed on {char} |inclusive|.
    // {char} can be entered as a digraph |digraph-arg|.
    f: () => {},
    // To the [count]'th occurrence of {char} to the left.
    // The cursor is placed on {char} |exclusive|.
    // {char} can be entered like with the |f| command.
    F: () => {},
    // Till before [count]'th occurrence of {char} to the
    // right.  The cursor is placed on the character left of
    // {char} |inclusive|.
    // {char} can be entered like with the |f| command.
    t: () => {},
    // Till after [count]'th occurrence of {char} to the
    // left.  The cursor is placed on the character right of
    // {char} |exclusive|.
    // {char} can be entered like with the |f| command.
    T: () => {},
    // Repeat latest f, t, F or T [count] times.
    ';': () => {},
    // Repeat latest f, t, F or T in opposite direction [count] times.
    ',': () => {}
};
