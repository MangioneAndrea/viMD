import type { Component } from 'solid-js';
import Editor from './components/editor';
import Preview from './components/preview';
import Info from './components/info';
import { DraggableSeparator } from './components/draggable-separator';

const App: Component = () => {

    return (
        <div class="flex w-screen h-screen font-mono">
            <DraggableSeparator>
                <Editor />
                <Preview />
            </DraggableSeparator>
            <Info />
        </div>
    );
};

export default App;
