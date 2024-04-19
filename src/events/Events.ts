import { Object3D } from "../core/Object3D";

class ObjectAddedEvent extends Event {
    constructor(public object: Object3D) {
        super("objectAdded");
    }
}

class ObjectRemovedEvent extends Event {
    constructor(public object: Object3D) {
        super("objectRemoved");
    }
}

class ObjectChangedEvent extends Event {
    constructor(public object: Object3D) {
        super("objectChanged");
    }
}

class RenderedSplatsChangedEvent extends Event {
    constructor(public object: Object3D) {
        super("renderedSplatsChanged");
    }
}

export { ObjectAddedEvent, ObjectRemovedEvent, ObjectChangedEvent, RenderedSplatsChangedEvent };
