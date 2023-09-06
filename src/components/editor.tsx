import { enterSymbol, vimState, getLines } from "../models/vim";
import { type Component } from 'solid-js';
import { createMutable, createStore, produce, unwrap } from 'solid-js/store';


const Editor: Component = () => {
	return (
		<div class="bg-zinc-900 h-full w-full" onKeyDown={evt => enterSymbol(evt.key)} tabindex={0}>
			{getLines(vimState).map((str, row) => <div class='w-full'>
				<span class={`select-none inline-block min-w-[48px] text-right pr-2 text-zinc-600 font-bold ${row === vimState.cursorLine ? "pr-5" : ""}`}>{Math.abs(row - vimState.cursorLine) || row}</span>
				<span class="text-gray-200 whitespace-pre">{
					str.split("").map((char, col) => {
						let className = "";
						if (row === vimState.cursorLine && col === vimState.cursorColumn) {
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
