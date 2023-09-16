import { Component, JSXElement, createSignal } from 'solid-js';

export const DraggableSeparator: Component<{
    children: [JSXElement, JSXElement];
}> = ({ children }) => {
    const [ratio, setRatio] = createSignal([0.5, 0.5]);
    const drag = (evt: DragEvent) => {
        console.log(evt.x, evt.target.parentNode.offsetWidth);
    };

    return (
        <div class="flex w-full">
            <div class="flex-1">{children[0]}</div>
            <span
                class="bg-gray-600 w-1 h-full cursor-col-resize"
                onDrag={drag}
                draggable
            />
            <div class="flex-1">{children[1]}</div>
        </div>
    );
};
