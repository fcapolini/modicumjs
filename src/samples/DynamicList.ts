import Data from "../modicum/Data";
import View from "../modicum/View";

function dynamicList() {
	const list = new View(View.body, {
		markup: `<div>
			<h3>[[title]]</h3>
			<ul aka="list"></ul>
		</div>`,
		ondata: (v: View, d) => v.set('title', d.title)
	})

	const items = new View(list, {
		plug: 'list',
		markup: `<li>[[title]] <span>[[count]]</span></li>`,
		datapath: (v: View, d) => d.items,
		ondata: (v: View, d) => {
			v.set('title', d.title);
			v.set('count', d.count);
		}
	});

	const data = new Data({
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
	}).addConsumer(list);

	var i1 = 0;
	var i2 = data.data.items.length;
	var delta = 1;
	setInterval(() => {
		i1 += delta;
		if (i1 >= i2) delta = -1;
		if (i1 <= 0) delta = 1;
		items.setDataRange(i1, i2);
	}, 500);
}

export default dynamicList;
