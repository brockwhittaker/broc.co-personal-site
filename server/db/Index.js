const SHOULD_WIPE_MODELS = false;

module.exports = async (Sequelize, sequelize) => {
  class User extends Sequelize.Model {};
  class Highlight extends Sequelize.Model {};
  class HighlightComment extends Sequelize.Model {};
  class FetchAttempt extends Sequelize.Model {};

  User.init({
    email: Sequelize.STRING,
    handle: Sequelize.STRING,
    first_name: Sequelize.STRING,
    last_name: Sequelize.STRING,
    avatar: Sequelize.STRING,
    demo_flow: Sequelize.BOOLEAN,
    private_key: Sequelize.STRING,
    key: Sequelize.STRING,
    twitter: Sequelize.JSON,
  }, { sequelize, paranoid: true, modelName: 'user', indexes: [
    { unique: true, fields: ['handle'] },
  ] });

  Highlight.init({
    start_semantic_xpath: Sequelize.JSON,
    end_semantic_xpath: Sequelize.JSON,
    start_fragment_content: Sequelize.TEXT,
    end_fragment_content: Sequelize.TEXT,
    key: Sequelize.STRING,
    user: Sequelize.STRING,
    domain: Sequelize.STRING,
    path: Sequelize.STRING,
    unique_page_id: Sequelize.STRING,
    fragment_context: Sequelize.TEXT,
  }, { sequelize, paranoid: true, modelName: 'highlight', indexes: [
    { unique: false, fields: ['user'] },
    { unique: false, fields: ['domain'] },
    { unique: false, fields: ['path'] },
  ] });

  HighlightComment.init({
    highlight: Sequelize.STRING,
    user: Sequelize.STRING,
    comment: Sequelize.STRING(10000),
    key: Sequelize.STRING,
  }, { sequelize, paranoid: true, modelName: 'highlightcomment', indexes: [
    { unique: false, fields: ['user'] },
    { unique: false, fields: ['highlight'] },
  ] });

  FetchAttempt.init({
    user: Sequelize.STRING,
    domain: Sequelize.STRING,
    path: Sequelize.STRING,
  }, { sequelize, paranoid: true, modelName: 'fetch', indexes: [
    { unique: false, fields: ['user'] },
    { unique: false, fields: ['domain'] },
    { unique: false, fields: ['path'] },
  ] });

  await sequelize.sync({ force: SHOULD_WIPE_MODELS })

  const models = { User, Highlight, HighlightComment, FetchAttempt };

  for (model of Object.values(models)){
    model.addScope('defaultScope', {
      attributes:{exclude:['private_key']}
    }, {override:true})
    model.addScope('full', {
      attributes:{include:['private_key']}
    }, {override:true})
  }

  return models;
};
