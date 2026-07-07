// jest.environment.js
const Environment = require('jest-environment-jsdom').default;

module.exports = class CustomTestEnvironment extends Environment {
  async setup() {
    await super.setup();
    
    // Simuler les propriétés manquantes de window
    this.global.window.innerHeight = 768;
    this.global.window.scrollY = 0;
    
    // Simuler les propriétés manquantes de document
    if (!this.global.document.documentElement.scrollHeight) {
      Object.defineProperty(this.global.document.documentElement, 'scrollHeight', {
        value: 1000,
        writable: true
      });
    }
    
    if (!this.global.document.documentElement.offsetHeight) {
      Object.defineProperty(this.global.document.documentElement, 'offsetHeight', {
        value: 500,
        writable: true
      });
    }
  }
};