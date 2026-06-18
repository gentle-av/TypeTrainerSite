export class DependencyContainer {
  constructor() {
    this.instances = new Map();
    this.factories = new Map();
  }

  register(name, factory) {
    this.factories.set(name, factory);
  }

  registerInstance(name, instance) {
    this.instances.set(name, instance);
  }

  resolve(name) {
    if (this.instances.has(name)) {
      return this.instances.get(name);
    }
    if (this.factories.has(name)) {
      const instance = this.factories.get(name)(this);
      this.instances.set(name, instance);
      return instance;
    }
    throw new Error(`Service ${name} not found`);
  }

  has(name) {
    return this.instances.has(name) || this.factories.has(name);
  }
}
