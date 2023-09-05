
import type { Component } from 'solid-js';


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
	let cursor = 10;



	return (
		<div class="bg-zinc-900 h-full w-full">
			{lines.map((str, idx) => <div class='w-full'>
				<span class={`inline-block min-w-[48px] text-right pr-2 text-zinc-600 font-bold ${idx === cursor ? "pr-5" : ""}`}>{Math.abs(idx - cursor) || idx}</span>
				<span class="text-white">{str}</span>
			</div>)
			}
		</div >
	);
};

export default Editor;
