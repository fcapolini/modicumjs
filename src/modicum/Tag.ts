import View, { ViewProps } from "./View";

export default class Tag {

	constructor(
		name:string, props?:ViewProps,
		didInit?:(v:View)=>void, willDispose?:(v:View)=>void
	) {
		this._name = name;
		this._props = props;
		this._didInit = didInit;
		this._willDispose = willDispose;
		this._ids = new Map();
		this._instances = new Map();
		const that = this;
		customElements.define(name, class extends HTMLElement {
			connectedCallback() {
				const id = this.id;
				const nr = Tag._nextNr++;
				const props = that._props ? that._props : {};
				props.dom = this;
				const view = new TagView(props);
				id && id !== '' ? that._ids.set(id, view) : null;
				(<any>this)._tag_instance_nr = nr;
				that._instances.set(nr, view);
				that._didInit ? that._didInit(view) : null;
			}
			disconnectedCallback() {
				const nr:number = (<any>this)._tag_instance_nr;
				that._willDispose ? that._willDispose(<View>that._instances.get(nr)) : null;
				this.id && this.id !== '' ? that._ids.delete(this.id) : null;
				that._instances.delete(nr);
			}
		});
	}

	get(id:string): TagView|undefined {
		return this._ids.get(id);
	}

	// =========================================================================
	// private
	// =========================================================================
	static _NR_PROP = '_tag_instance_nr';
	static _nextNr = 0;
	_name: string;
	_props?: ViewProps;
	_didInit?: (v:View)=>void;
	_willDispose?: (v:View)=>void;
	_ids: Map<string, TagView>;
	_instances: Map<number, TagView>;

}

export class TagView extends View {

	constructor(props:ViewProps) {
		super(undefined, props);
	}

	_makeDom() {
		const dom = <Element>this.props.dom;
		this.props.markup != null ? dom.innerHTML = this.props.markup : null;
		return dom;
	}

}
