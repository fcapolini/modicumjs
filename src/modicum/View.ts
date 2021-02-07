import { DataConsumer } from "./Data";

export interface ViewProps {
	dom?: Element;
	markup?: string;
	plug?: string;
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
		this._didInit = didInit;
		this._cloneOf = cloneOf;
		this.cloneIndex = -1;
		this.children = [];
		this._nodes = new Map();
		this.dom = <HTMLElement>this._makeDom();
		this._init();
		this._link();
		if (didInit) {
			didInit(this);
		}
	}

	get(aka: string): Element {
		return <Element>this._nodes.get(aka);
	}

	set(aka: String, v: any) {
		var n = this._nodes.get(aka);
		n ? n.nodeValue = (v !== null && v !== undefined ? '' + v : '') : null;
	}

	setAttribute(aka: string, key: string, val?: string) {
		const e = this.get(aka);
		if (e) {
			if (val) {
				e.setAttribute(key, val);
			} else {
				e.removeAttribute(key);
			}
		}
	}

	setData(d: any, useDatapath = true) {
		useDatapath && this.props.datapath ? d = this.props.datapath(this, d) : null;
		if (Array.isArray(d)) {
			this._setArray(d);
		} else if (d !== null && d !== undefined) {
			this.dom.classList.remove(View.HIDDEN_CLASS);
			this.props.ondata ? this.props.ondata(this, d) : null;
			this.props.childrendata ? d = this.props.childrendata(this, d) : null;
			this.children.forEach(child => {
				child.setData(d);
			});
		} else {
			this.dom.classList.add(View.HIDDEN_CLASS);
			this._clearClones();
		}
	}

	setDataRange(start: number, end?: number) {
		this._rangeStart = start;
		this._rangeEnd = end;
		this._rangeData ? this._setArray(this._rangeData) : null;
	}

	getPrevClone(): View | null {
		var ret = null;
		if (this.cloneIndex > 0) {
			if (this._cloneOf && this._cloneOf._clones) {
				ret = this._cloneOf._clones[this.cloneIndex - 1];
			} else if (this._clones && this._clones.length > 0) {
				ret = this._clones[this._clones.length - 1];
			}
		}
		return ret;
	}

	getNextClone(): View | null {
		var ret = null;
		//TODO
		return ret;
	}

	// =========================================================================
	// private
	// =========================================================================
	_didInit?: (v: View) => void;
	_cloneOf?: View;
	_nodes: Map<String, Node>;

	_link() {
		if (this.parent) {
			var plug = this.props.plug ? this.props.plug : 'default';
			var pdom = this.parent.get(plug);
			if (this._cloneOf) {
				this.props.dom ? null : pdom.insertBefore(this.dom, this._cloneOf.dom);
			} else {
				this.parent.children.push(this);
				this.props.dom ? null : pdom.appendChild(this.dom);
			}
		}
	}

	_unlink() {
		if (this.parent != null) {
			this._cloneOf ? null : this.parent._removeChild(this);
			this.dom.remove();
		}
	}

	_removeChild(child: View) {
		var i = this.children.indexOf(child);
		if (i >= 0) {
			this.children = this.children.splice(i, 1);
		}
	}

	_init() {
		if (!this._nodes.has('default')) {
			this._nodes.set('default', this.dom);
		}
		this._nodes.set('root', this.dom);
		if (this.props.ondata) {
			this.dom.classList.add(View.HIDDEN_CLASS);
		}
	}

	_makeDom(): Element {
		var ret: Element;
		if (this.props.dom) {
			ret = this.props.dom;
		} else if (this.props.markup) {
			var e: HTMLElement = this.root.dom.ownerDocument.createElement('div');
			e.innerHTML = this.props.markup.replace(/\n\s+/g, '\n');
			ret = <Element>e.firstElementChild;
			this._collectNodes(ret);
		} else {
			ret = this.root.dom.ownerDocument.createElement('div');
		}
		return ret;
	}

	_collectNodes(e: Element) {
		var aka = e.getAttribute('aka');
		if (aka != null) {
			e.removeAttribute('aka');
			this._nodes.set(aka, e);
		}
		for (var i = 0; i < e.childNodes.length; i++) {
			var n = <Node | null>e.childNodes[i];
			if (n?.nodeType === Node.ELEMENT_NODE) {
				this._collectNodes(<Element>n);
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
					this._nodes.set(res[1], n);
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
	_rangeStart = 0;
	_rangeEnd?: number = undefined;
	_rangeData?: any[] = undefined;
	_clones?: View[] = undefined;

	/*
	Clones are Views whose cloneOf is set and they're only linked into
	the DOM, but not added to the View tree.
	Depending on array length:
	- if zero, only the original View exists and it's hidden
	- if one, only the original View exists, populated and visible
	- if more than one, the original View is the last element of the sequence
	*/
	_setArray(v: any[]) {
		this._rangeData = v;
		if (this._rangeStart != 0 || this._rangeEnd) {
			v = this._rangeEnd
				? v.slice(this._rangeStart, this._rangeEnd)
				: v.slice(this._rangeStart);
		}
		var count = Math.max(v.length - 1, 0);
		this._clones ? null : this._clones = [];
		for (var i = 0; i < count; i++) {
			if (i >= this._clones.length) {
				const clone = new View(this.parent, this.props, this._didInit, this);
				clone.cloneIndex = i;
				this._clones.push(clone);
			}
			this._clones[i].setData(v[i], false);
		}
		this._clearClones(count);
		this.cloneIndex = v.length - 1;
		this.setData(v.length > 0 ? v[v.length - 1] : null, false);
	}

	_clearClones(count = 0) {
		if (this._clones) {
			while (this._clones.length > count) {
				this._clones.pop()?._unlink();
			}
		}
	}

}
