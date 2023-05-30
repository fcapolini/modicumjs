import View, { ViewProps } from "./View";

export default class Tag {

	constructor(
		name: string, props?: ViewProps,
		didInit?: (v: View) => void, willDispose?: (v: View) => void
	) {
		this.#name = name;
		this.#props = props;
		this.#didInit = didInit;
		this.#willDispose = willDispose;
		this.#ids = new Map();
		this.#instances = new Map();
		const that = this;
		customElements.define(name, class extends HTMLElement {
			connectedCallback() {
				const id = this.id;
				const nr = Tag.#nextNr++;
				const props = that.#props ? that.#props : {};
				props.dom = this;
				const view = new TagView(props);
				id && id !== '' ? that.#ids.set(id, view) : null;
				(<any>this)[Tag.#NR_PROP] = nr;
				that.#instances.set(nr, view);
				that.#didInit ? that.#didInit(view) : null;
			}
			disconnectedCallback() {
				const nr: number = (<any>this)[Tag.#NR_PROP];
				that.#willDispose ? that.#willDispose(<View>that.#instances.get(nr)) : null;
				this.id && this.id !== '' ? that.#ids.delete(this.id) : null;
				that.#instances.delete(nr);
			}
		});
	}

	getIntance(id: string): View | undefined {
		return this.#ids.get(id);
	}

	// =========================================================================
	// private
	// =========================================================================
	static #NR_PROP = '_tag_instance_nr';
	static #nextNr = 0;
	#name: string;
	#props?: ViewProps;
	#didInit?: (v: View) => void;
	#willDispose?: (v: View) => void;
	#ids: Map<string, TagView>;
	#instances: Map<number, TagView>;

}

export class TagView extends View {

	constructor(props: ViewProps) {
		super(null, props);
	}

	#makeDom() {
		const dom = <Element>this.props.dom;
		this.props.markup != null ? dom.innerHTML = this.props.markup : null;
		return dom;
	}

}
