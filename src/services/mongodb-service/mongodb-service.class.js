const { Service } = require('feathers-mongodb');

exports.MongodbService = class MongodbService extends Service {
  constructor(options, app) {
    super(options);
    
    app.get('mongoClient').then(db => {
      this.Model = db.collection('mongodb-service');
    });
  }
};
