import Data from "../modicum/Data";
import View from "../modicum/View";

class MenuItems extends View {
	constructor(parent: View, data: Data, state: Data, menu: Element) {
		super(parent, {
			plug: 'menu-list',
			markup: '<ion-item>[[title]]</ion-item>',
			datapath: (p: View, d) => d.contents,
			ondata: (p: View, d) => {
				p.set('title', d.title);
				p.setAttribute('root', 'color', p.cloneIndex === state.data.current
					? 'primary'
					: undefined);
			}
		}, p => {
			p.dom.addEventListener('click', (ev) => {
				state.data.current = p.cloneIndex;
				data.trigger();
				(<any>menu).close();
			});
		});
		data.addConsumer(this);
	}
}

class Page extends View {
	constructor(parent: View, data: Data, state: Data) {
		super(parent, {
			plug: 'split-pane',
			markup: `<div id="main" class="ion-page">
				<ion-header class="ion-no-border sidemenu-header">
					<ion-toolbar>
						<ion-menu-button slot="start"></ion-menu-button>
						<ion-title>[[title]]</ion-title>
					</ion-toolbar>
				</ion-header>
				
				<ion-content class="ion-padding" aka="content">
					<h1>[[text]]</h1>
				</ion-content>
			</div>`,
			datapath: (p: View, d) => d.contents[state.data.current],
			ondata: (p: View, d) => {
				p.set('title', d.title);
				p.get('content').innerHTML = d.html;
			},
		});
		data.addConsumer(this);
	}
}

function sideMenu() {
	const data = new Data({
		contents: [
			{ title: 'Inbox', html: `inbox is empty` },
			{ title: 'Sent', html: `no sent items` },
			{ title: 'Spam', html: `no spam` }
		]
	});
	const state = new Data({
		current: 0,
	});

	new View(View.body, {
		markup: `<ion-app>
			<ion-split-pane content-id="main" class="sidemenu-split-pane" aka="split-pane">
				<ion-menu content-id="main" aka="menu">
					<ion-header class="ion-no-border sidemenu-header" aka="menu-header">
						<ion-toolbar>
							<ion-title>SideMenu</ion-title>
						</ion-toolbar>
					</ion-header>
					<ion-content>
						<ion-list class="sidemenu-menu-list" aka="menu-list">
					</ion-content>
					</ion-list>
				</ion-menu>
			</ion-split-pane>
		</ion-app>`,
	}, p => {
		new MenuItems(p, data, state, p.get('menu'));
		new Page(p, data, state);
	});
}

export default sideMenu;
