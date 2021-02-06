import Data from "../modicum/Data";
import View from "../modicum/View";

function helloWorld() {
	const view = new View(View.body, {
		markup: `<div>Seconds: [[text]]</div>`,
		ondata: (v: View, d) => v.set('text', d)
	});

	const count = new Data(0).addConsumer(view);

	setInterval(() => count.setData(count.data + 1), 1000);
}

export default helloWorld;
