import type { Component } from 'solid-js';
import Editor from './components/editor';
import Preview from './components/preview';
import Info from './components/info';

const App: Component = () => {
    return (
        <div class="flex w-screen h-screen font-mono">
            <Editor />
            <Preview />
            <Info />
        </div>
    );
};

export default App;
