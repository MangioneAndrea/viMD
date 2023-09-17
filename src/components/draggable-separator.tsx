import { Component, JSXElement, createSignal } from 'solid-js';

export const DraggableSeparator: Component<{
    children: [JSXElement, JSXElement];
}> = ({ children }) => {
    const [ratio, setRatio] = createSignal([0.4, 0.6]);
    const [parentElement, setParentElement] = createSignal<HTMLElement | null>(
        null
    );

    const drag = (evt: MouseEvent) => {
        if (!parentElement()) return;
        console.log(parentElement());
        evt.preventDefault();
        if (evt.screenX === 0) return;
        const first = evt.x / parentElement()!.offsetWidth;

        setRatio([first, 1 - first]);
    };

    const startDragging = (evt) => {
        setParentElement(evt.target.parentNode);
    };

    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', () => setParentElement(null));

    return (
        <div class="flex w-full" onMouseMove={drag}>
            <div style={`flex: ${ratio()[0]}`}>{children[0]}</div>
            <span
                class="bg-gray-600 w-1 h-full cursor-col-resize"
                onMouseDown={startDragging}
                draggable
            />
            <div style={`flex: ${ratio()[1]}`}>{children[1]}</div>
        </div>
    );
};
