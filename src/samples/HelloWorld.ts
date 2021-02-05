import View from "../modicum/View";

function helloWorld() {
	const body = new View(undefined, {dom:document.body});
	new View(body, {
		markup: '<div class="ion-padding">[[text]]</div>'
	}, p => {
		p.setNode('text', 'Hi there!');
	});
}

export default helloWorld;
