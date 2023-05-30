import { DataConsumer } from "./Data";

export interface ViewProps {
	dom?: Element;
	markup?: string;
	id?: string;
	plug?: string;
	style?: string;
	datapath?: (v: View, d: any) => any;
	ondata?: (v: View, d: any) => void;
	childrendata?: (v: View, d: any) => any;
}

export default class View implements DataConsumer {
	static readonly HIDDEN_CLASS = 'modicum-hidden';
	static body = new View(null, { dom: document.body });
	static head = new View(null, { dom: document.head }, p => {
		const style = document.createElement('style');
		style.innerHTML = `.${View.HIDDEN_CLASS} {display: none;}`;
		p.dom.appendChild(style);
	});
	static styles = new Set<string>();
	parent: View | null;
	root: View;
	props: ViewProps;
	children: View[];
	userdata: any;
	dom: HTMLElement;
	cloneIndex: number;

	constructor(
		parent: View | null, props: ViewProps, didInit?: (v: View) => void,
		cloneOf?: View
	) {
		this.parent = parent;
		this.root = (parent ? parent.root : (cloneOf ? cloneOf.root : this));
		this.props = props;
		this.userdata = null;
		this.#didInit = didInit;
		this.#cloneOf = cloneOf;
		this.cloneIndex = -1;
		this.children = [];
		this.#nodes = new Map();
		this.dom = <HTMLElement>this.#makeDom();
		this.#init();
		props.id ? this.dom.id = props.id : null;
		this.#link();
		if (didInit) {
			didInit(this);
		}
	}

	get(aka: string): Element {
		return <Element>this.#nodes.get(aka);
	}

	set(aka: String, v: any) {
		var n = this.#nodes.get(aka);
		v = (v !== null && v !== undefined ? '' + v : '');
		n && n.nodeValue !== v ? n.nodeValue = v : null;
	}

	setAttribute(aka: string, key: string, val?: string) {
		const e = this.get(aka);
		if (e) {
			if (val) {
				if (e.getAttribute(key) !== val) {
					e.setAttribute(key, val);
				}
			} else {
				e.removeAttribute(key);
			}
		}
	}

	setClass(aka: string, name: string, flag: boolean) {
		const e = this.get(aka);
		e ? (flag ? e.classList.add(name) : e.classList.remove(name)) : null;
	}

	addEventListener(aka: string, type: string, handler: (ev:any) => void) {
		const e = this.get(aka);
		e ? e.addEventListener(type, handler) : null;
	}

	setData(d: any, useDatapath = true) {
		this.#data = d;
		useDatapath && this.props.datapath ? d = this.props.datapath(this, d) : null;
		if (Array.isArray(d)) {
			this.#setArray(d);
		} else if (d !== null && d !== undefined) {
			this.dom.classList.remove(View.HIDDEN_CLASS);
			this.props.ondata ? this.props.ondata(this, d) : null;
			this.props.childrendata ? d = this.props.childrendata(this, d) : null;
			this.children.forEach(child => {
				child.setData(d);
			});
		} else {
			this.dom.classList.add(View.HIDDEN_CLASS);
			this.#clearClones();
		}
	}

	refresh() {
		this.setData(this.#data);
	}

	setDataRange(start: number, end?: number) {
		this.#rangeStart = start;
		this.#rangeEnd = end;
		this.#rangeData ? this.#setArray(this.#rangeData) : null;
	}

	getPrevClone(): View | null {
		var ret = null;
		if (this.cloneIndex > 0) {
			if (this.#cloneOf && this.#cloneOf.#clones) {
				ret = this.#cloneOf.#clones[this.cloneIndex - 1];
			} else if (this.#clones && this.#clones.length > 0) {
				ret = this.#clones[this.#clones.length - 1];
			}
		}
		return ret;
	}

	getNextClone(): View | null {
		var ret = null;
		//TODO
		return ret;
	}

	static createElement(
		name:string, attributes?:any,
		html?:string, parent?:Element
	): Element {
		const ret = document.createElement(name);
		for (const key in attributes) {
			if (Object.prototype.hasOwnProperty.call(attributes, key)) {
				const value = attributes[key];
				ret.setAttribute(key, value);
			}
		}
		html ? ret.innerHTML = html : null;
		parent ? parent.appendChild(ret) : null;
		return ret;
	}

	// =========================================================================
	// private
	// =========================================================================
	#didInit?: (v: View) => void;
	#cloneOf?: View;
	#data?: any;
	#nodes: Map<String, Node>;

	#link() {
		if (this.parent) {
			var plug = this.props.plug ? this.props.plug : 'default';
			var pdom = this.parent.get(plug);
			if (this.#cloneOf) {
				this.props.dom ? null : pdom.insertBefore(this.dom, this.#cloneOf.dom);
			} else {
				this.parent.children.push(this);
				this.props.dom ? null : pdom.appendChild(this.dom);
			}
		}
	}

	#unlink() {
		if (this.parent != null) {
			this.#cloneOf ? null : this.parent.#removeChild(this);
			this.dom.remove();
		}
	}

	#removeChild(child: View) {
		var i = this.children.indexOf(child);
		if (i >= 0) {
			this.children.splice(i, 1);
		}
	}

	#init() {
		if (!this.#nodes.has('default')) {
			this.#nodes.set('default', this.dom);
		}
		this.#nodes.set('root', this.dom);
		if (this.props.ondata) {
			this.dom.classList.add(View.HIDDEN_CLASS);
		}
		if (this.props.style && !View.styles.has(this.props.style)) {
			const e = document.createElement('style');
			e.innerHTML = this.props.style;
			document.head.appendChild(e);
		}
	}

	#makeDom(): Element {
		var ret: Element;
		if (this.props.dom) {
			ret = this.props.dom;
		} else if (this.props.markup) {
			var e: HTMLElement = this.root.dom.ownerDocument.createElement('div');
			e.innerHTML = this.props.markup.replace(/\n\s+/g, '\n');
			ret = <Element>e.firstElementChild;
			this.#collectNodes(ret);
		} else {
			ret = this.root.dom.ownerDocument.createElement('div');
		}
		return ret;
	}

	#collectNodes(e: Element) {
		var aka = e.getAttribute('aka');
		if (aka != null) {
			e.removeAttribute('aka');
			this.#nodes.set(aka, e);
		}
		for (var i = 0; i < e.childNodes.length; i++) {
			var n = <Node | null>e.childNodes[i];
			if (n?.nodeType === Node.ELEMENT_NODE) {
				this.#collectNodes(<Element>n);
			} else if (n?.nodeType === Node.TEXT_NODE) {
				var res;
				while (n && (res = /\[\[(\w+)\]\]/.exec(<string>n.nodeValue))) {
					const parent = n.parentElement;
					if (res.index > 0) {
						const pre = document.createTextNode(res.input.substr(0, res.index));
						parent?.insertBefore(pre, n);
						i++;
					}
					n.nodeValue = '';
					this.#nodes.set(res[1], n);
					if ((res.index + res[0].length) < res.input.length) {
						const s = res.input.substr(res.index + res[0].length);
						const post = document.createTextNode(s);
						parent?.insertBefore(post, n.nextSibling);
						i++;
						n = post;
					} else {
						n = null;
					}
				}
			}
		}
	}

	// =========================================================================
	// replication
	// =========================================================================
	#rangeStart = 0;
	#rangeEnd?: number = undefined;
	#rangeData?: any[] = undefined;
	#clones?: View[] = undefined;

	/*
	Clones are Views whose cloneOf is set and they're only linked into
	the DOM, but not added to the View tree.
	Depending on array length:
	- if zero, only the original View exists and it's hidden
	- if one, only the original View exists, populated and visible
	- if more than one, the original View is the last element of the sequence
	*/
	#setArray(v: any[]) {
		this.#rangeData = v;
		if (this.#rangeStart != 0 || this.#rangeEnd) {
			v = this.#rangeEnd
				? v.slice(this.#rangeStart, this.#rangeEnd)
				: v.slice(this.#rangeStart);
		}
		var count = Math.max(v.length - 1, 0);
		this.#clones ? null : this.#clones = [];
		for (var i = 0; i < count; i++) {
			if (i >= this.#clones.length) {
				const clone = new View(this.parent, this.props, this.#didInit, this);
				clone.cloneIndex = i;
				this.#clones.push(clone);
			}
			this.#clones[i].setData(v[i], false);
		}
		this.#clearClones(count);
		this.cloneIndex = v.length - 1;
		this.setData(v.length > 0 ? v[v.length - 1] : null, false);
	}

	#clearClones(count = 0) {
		if (this.#clones) {
			while (this.#clones.length > count) {
				(this.#clones.pop() as View).#unlink();
			}
		}
	}

}
