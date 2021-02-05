import Tag from "../modicum/Tag";
import View from "../modicum/View";

function sideMenu() {
	new Tag('app-page', {
		markup: `<div class="ion-page">
			<ion-header class="ion-no-border">
				<ion-toolbar>
					<ion-menu-button slot="start"></ion-menu-button>
					<ion-title>Page</ion-title>
				</ion-toolbar>
			</ion-header>
			
			<ion-content class="ion-padding">
				<h1>[[text]]</h1>
			</ion-content>
		</div>`,
	});

	new View(new View(undefined, {dom:document.body}), {
		markup: `<ion-app>
			<ion-split-pane content-id="main">
				<ion-menu content-id="main">
					<ion-list aka="menu-list">
						<ion-list-header>
							<h1>Menu</h1>
						</ion-list-header>
					</ion-list>
				</ion-menu>

				<ion-nav id="main" root="app-page"></ion-nav>
			</ion-split-pane>
		</ion-app>`,
	});
}

export default sideMenu;
