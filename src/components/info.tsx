import { createSignal, type Component } from 'solid-js';


const Info: Component = () => {
	const [macro, setMacro] = createSignal("recording @q");
	const [mode, setMode] = createSignal("-- INSERT --");
	const [register, setRegister] = createSignal("\"a");
	return (
		<div class="bg-gray-900 fixed w-full bottom-0 font-mono flex justify-between">
			<span class="text-violet-300">
				{mode()}
				{macro()}
			</span>
			<span class="text-white right-0 w-24">
				{register()}
			</span>
		</div>
	);
};

export default Info;
