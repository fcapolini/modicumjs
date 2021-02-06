# ModicumJS

A minimal yet powerful reactive web framework for people who don't enjoy struggling with Angular, React & co.

## Samples

### Hello World

```typescript
import Data from "./modicum/Data";
import View from "./modicum/View";

const view = new View(View.body, {
    markup: `<div>Seconds: [[text]]</div>`,
    ondata: (v:View, d) => v.set('text', d)
});

const count = new Data(0).addConsumer(view);

setInterval(() => count.setData(count.data + 1), 1000);
```

* `view`'s content is child of the `body` element
* it defines a simple `div` with a partially dynamic text
* when it receives data, it updates the dynamic part
* `count` contains a simple numeric value
* `view` is registered as a consumer of `count`'s data
* `count`'s data is periodically updated and reflected in `view`'s DOM

### Replication

```typescript
import Data from "./src/modicum/Data";
import View from "./src/modicum/View";

const view = new View(View.body, {
    markup: `<div>
        <h3>[[title]]</h3>
        <ul aka="list"></ul>
    </div>`,
    ondata: (v:View, d) => v.set('title', d.title)
});

const item = new View(p, {
  plug: 'list',
  markup: `<li>[[title]]<span>[[count]]</span></li>`,
  datapath: (v:View, d) => d.items,
  ondata: (v:View, d) => {
    v.set('title', d.title);
    v.set('count', d.count);
  }
});

const data = new Data({
    title: 'Mail',
    items: [
        {title: 'Inbox', count: 10},
        {title: 'Flagged', count: 4},
        {title: 'Drafts', count: 3},
        {title: 'Sent', count: 7},
    ]
});
data.addConsumer(view);
```

* `view` defines a block with a dynamic title and an empty unordered list

* `item` is its child and it appends its DOM to `view`'s `<ul>` element (thanks to the name "list" given via `<ul>`'s "aka" attribute and referred to by `item`'s "plug" property)

* `view` is registered as a consumer of `data` and it sets its title accordingly

* Views propagate data to their children, so `item` also consumes `data`'s content

* `item` refines the data it receives with the `datapath` property

* the refined data is the `items` array, so it automatically clones itself for each element of it

* if the array grows or shrinks, e.g. with:

  ```typescript
  data.setData({title: 'Mail', items:[
      {title: 'Inbox', count: 10},
      {title: 'Flagged', count: 4},
  ]});
  ```

  exceeding clones are discarded, missing clones are created, and existing clones are updated.

## Classes

ModicumJS is a truly minimal yet fully functional reactive web framework. It has no dependencies and includes only three classes and two interfaces.

### interface ViewProps

```typescript
interface ViewProps {
    dom?: Element;
    markup?: string;
    plug?: string;
    datapath?: (v:View, d:any)=>any;
    ondata?: (v:View, d:any)=>void;
    childrendata?: (v:View, d:any)=>any;
}
```

### class View

```typescript
constructor(parent:View, props:ViewProps, didInit?:(v:View)=>void)
```

Views must normally have a parent. `View.head` and `View.body` are provided as useful parents. You can create a parent View anchored to any other DOM element if needed (see `View.body` initialization as an example of that).

A View wraps a fragment of the DOM. The fragment can be can be passed with the `dom` property or build from the `markup` property. The newly created DOM fragment is scanned and named Elements (with the `aka` attribute), plus named texts (with the `[[name]]` syntax, are collected).

```typescript
get(aka:string): Element
```

Returns a named Element, if it exists.

```typescript
set(aka:String, v:any)
```

Sets the textual value of a named text, if it exists.

```typescript
setAttribute(aka:string, key:string, val?:string)
```

Sets or removes an attribute of a named Element.

```typescript
setData(data:any)
```

Dictated by the `DataConsumer` interface. Normally used by `Data` instances.

```typescript
setDataRange(start:number, end?:number)
```

Sets the range of array elements to consider for View replication.

### interface DataConsumer

```typescript
interface DataConsumer {
    setData(d:any): void;
}
```

DataConsumers can be registered with Data instances in order to be notified when data changes.

### class Data

```typescript
constructor(data:any)
```

A Data instance is a simple data container. An initial value can be passed at instantiation.

```typescript
setData(data?:any)
```

Can be used to change contained data.

```typescript
addConsumer(c:DataConsumer, setData=true)
```

DataConsumers can be added to a Data instance so they are notified when its contained data change.

```typescript
removeConsumer(c:DataConsumer, setNull=false)
```

Previously added DataConsumers can unregister themselves.

```typescript
trigger()
```

Can be used to force data notification to registered DataConsumers regardless of data change.

### class Tag

```typescript
constructor(name:string, props?:ViewProps,
        didInit?:(v:View)=>void, willDispose?:(v:View)=>void)
```

A Tag defines [Custom Element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements). When an instance of that element is created, a wrapping View is created in turn and the optional `didInit` callback is called. When an instance is destroyed the optional `willDispose` is called.

Custom Elements are useful e.g. for working with [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)-based frameworks like [Ionic](https://ionicframework.com). Ionic `<ion-router>` and `<ion-nav>`, for example, work with components defined as custom tags to implement navigation.

```typescript
getIntance(id:string): View|undefined
```

Instances created with an `id` attribute are accessible via this method. Giving different IDs to different instances of the same custom tag allows us to access and interact with each instance's wrapping View.

