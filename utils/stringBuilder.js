class StringBuilder {
    constructor() {
      this.strings = [];
    }
  
    append(string) {
      this.strings.push(string);
      return this;
    }
  
    toString() {
      return this.strings.join('');
    }
}

module.exports = StringBuilder;