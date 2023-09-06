import { createSignal, type Component } from 'solid-js';

import { vimState } from "../models/vim";

const Info: Component = () => {
	return (
		<div class="bg-gray-900 fixed w-full bottom-0 flex justify-between">
			<span class="text-violet-300">
				{`-- ${vimState.mode.toUpperCase()} --`}
				{vimState.macro ? `recording @${vimState.macro}` : ""}
			</span>
			<span class="text-white right-0 w-24">
				{vimState.symbolBuffer}
			</span>
		</div>
	);
};

export default Info;
