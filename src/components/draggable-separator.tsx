import { Component, JSXElement, createSignal } from 'solid-js';

export const DraggableSeparator: Component<{
    children: [JSXElement, JSXElement];
}> = ({ children }) => {
    const [ratio, setRatio] = createSignal([0.4, 0.6]);
    const drag = (evt: DragEvent) => {
        evt.preventDefault();
        if (evt.screenX === 0) return;
        const first = evt.x / evt.target.parentNode.offsetWidth;

        setRatio([first, 1 - first]);
    };

    return (
        <div class="flex w-full">
            <div style={`flex: ${ratio()[0]}`}>{children[0]}</div>
            <span
                class="bg-gray-600 w-1 h-full cursor-col-resize"
                onDrag={drag}
                draggable
            />
            <div style={`flex: ${ratio()[1]}`}>{children[1]}</div>
        </div>
    );
};
