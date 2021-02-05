
export interface DataConsumer {
	setData(d:any): void;
}

export class Data {
	data: any;
	consumers: DataConsumer[];

	constructor(d:any) {
		this.data = d;
		this.consumers = [];
	}

	setData(d?:any) {
		this.data = d ? d : null;
		for (var i in this.consumers) {
			this.consumers[i].setData(d);
		}
	}

	addConsumer(c:DataConsumer, setData=true) {
		this.consumers.push(c);
		if (setData) {
			c.setData(this.data);
		}
	}

	removeConsumer(c:DataConsumer, setNull=false) {
		const i = this.consumers.indexOf(c);
		if (i >= 0) {
			this.consumers = this.consumers.splice(i, 1);
		}
		if (setNull) {
			c.setData(null);
		}
	}

	trigger() {
		this.setData(this.data);
	}
}
