class EmailProvider {
  constructor(name) {
    this.name = name;
  }

  async send(_payload) {
    throw new Error("EmailProvider.send() must be implemented");
  }
}

module.exports = EmailProvider;
