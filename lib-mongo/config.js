module.exports = {
  secret: 'secure1',
  db: {
    host: 'localhost',
    port: 27017,
    name: 'eleicao2022',
    turno1: 'turno1',
    turno2: 'turno2',
    options: {
      keepAlive: true,

      useNewUrlParser: true, // <-- no longer necessary
      useUnifiedTopology: true, // <-- no longer necessary

      autoIndex: false, // Don't build indexes

      connectTimeoutMS: 30000, // Give up initial connection after 30 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6

      user: '',
      pass: ''
    },
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG || false
  }
};
