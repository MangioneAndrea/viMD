import type { Component } from 'solid-js';
import { marked } from 'marked';
import { vimState } from '../models/vim';

const Preview: Component = () => {
    return (
        <div
            class="w-full h-full p-8 markdown-body"
            innerHTML={marked(vimState.buffer.text)}
        />
    );
};

export default Preview;
