module.exports = async (Sequelize, sequelize) => {
  const Model = require("./Model.js");
  const UserModel = require('./UserModel.js')
  const models = await require("./Index.js")(Sequelize, sequelize);

  for (let x in models) {
    if (x === 'User'){
      models[x] = new UserModel(models[x])
    } else {
      models[x] = new Model(models[x]);
    }
  }

  return models;
};
