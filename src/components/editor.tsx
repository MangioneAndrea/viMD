
import { createSignal, type Component } from 'solid-js';


const Editor: Component = () => {
	const lines = [
		"hii",
		"hello",
		"hii",
		"hello",
		"hii",
		"hello",
		"hii",
		"hello",
		"hii",
		"hello",
		"hii",
		"hello",
		"hii",
		"hello",
		"hii",
		"hello",
		"hii",
		"hello",
		"hii",
		"hello",
		"hii",
		"hello",

	]
	let [cursorY, setCursorY] = createSignal(10);
	let cursorX = 1;





	return (
		<div class="bg-zinc-900 h-full w-full">
			{lines.map((str, row) => <div class='w-full'>
				<span class={`select-none inline-block min-w-[48px] text-right pr-2 text-zinc-600 font-bold ${row === cursorY() ? "pr-5" : ""}`}>{Math.abs(row - cursorY()) || row}</span>
				<span class="text-gray-200">{
					str.split("").map((char, col) => {
						let className = "";
						if (row === cursorY() && col === cursorX) {
							className += "bg-white "
						}
						return <span class={className}>{char}</span>
					})
				}</span>
			</div>)
			}
		</div >
	);
};

export default Editor;
