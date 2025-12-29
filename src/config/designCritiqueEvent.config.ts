import { EventEmitter } from "events";

const designCritiqueEventBus = new EventEmitter();

designCritiqueEventBus.setMaxListeners(30);

export default designCritiqueEventBus;
