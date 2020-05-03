/*
Connection to server.
(c)2020 Florian Beck and Leander Schmidt.
*/

// setup

export default class Connection {
  constructor(username, password) {
    this.username = username;
    this.password = password;
    this.socket = this.connect();
  }

  connect() {
    return io.connect("localhost:3000/", {
      query: "name=" + this.username + "&pw=" + this.password,
    });
  }
}
