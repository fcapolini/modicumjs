import Data from "../modicum/Data";
import View from "../modicum/View";

function staticList() {
	const view = new View(View.body, {
		markup: `<div>
			<h3>[[title]]</h3>
			<ul aka="list"></ul>
		</div>`,
		ondata: (v: View, d) => v.set('title', d.title)
	});

	const item = new View(view, {
		plug: 'list',
		markup: `<li>[[title]]: [[count]]</li>`,
		datapath: (v: View, d) => d.items,
		ondata: (v: View, d) => {
			v.set('title', d.title);
			v.set('count', d.count);
		}
	});
	
	new Data({
		title: 'Mail',
		items: [
			{ title: 'Inbox', count: 10 },
			{ title: 'Flagged', count: 4 },
			{ title: 'Drafts', count: 3 },
			{ title: 'Sent', count: 7 },
			{ title: 'Spam', count: 4 },
			{ title: 'Trash', count: 1 },
			{ title: 'Archive', count: 0 },
		]
	}).addConsumer(view);
}

export default staticList;
