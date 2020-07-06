const utils = require("../utils.js");

class Model {
  constructor (model) {
    this.model = model;
    this.cache = model.cache;
  }

  create (obj) {
    return this.model.create({ ...obj,
      key: Model.generatePublicKey(),
      private_key: Model.generatePublicKey()
    })
  }

  async destroy (selector) {
    return await this.model.destroy(selector)
  }

  get (type, token) {
    if (typeof type === "object" && type !== null) {
      return this.model.findAll({ where: type });
    }

    return this.model.findOne({ where: { [type]: token } });
  }

  scope () {
    return new Model(this.model.scope(arguments))
  }

  async all (type, token) {
    /* explicitly look for the string "ALL" in order to return all so this
       isn't accidentally called. */
    if (type === "ALL") {
      return this.model.findAll();
    }

    if (typeof type === "object" && type !== null) {
      return this.model.findAll({ where: {...type} });
    }

    if (Array.isArray(token)) {
      const { Op } = this.model.sequelize.Sequelize;
      return this.model.findAll({ where: { [type]: { [Op.in]: token }} });
    } else {
      return this.model.findAll({ where: { [type]: token} });
    }
  }

  async update (key, data) {
    return await this.model.update(data, { where: { key }, returning: true, individualHooks: true });
  }

  async bulkUpdate(keys, data){
    let dataArray = keys.map((key)=>{
      return {key, ...data}
    })
    return await this.model.bulkCreate(dataArray, {
      updateOnDuplicate:Object.keys(data).concat(["updatedAt"])
    })
  }

  // parent is a sequelize result.
  // the two variables `key` and `recursion_attributes` may seem confusing but they can
  // be thought of as key being the `primary_key` column name, and `recursion_attributes`
  // is the key where the id of the parent is stored.
  // for example in an object like:
  // {
  //   id: 4,     /* key = 'id' */
  //   parent: 2, /* recursion_attributes = ['parent'] = 2 */
  // }
  // RETURNS:
  // this will return the type that was put in by way of the `parent` variable.
  // this means that if the parent is an array of parents it will return an
  // array of those parents. otherwise it will just return the single object
  // parent and its children.
  async recurse (parent, key, recursion_attributes, level) {
    const { Op } = this.model.sequelize.Sequelize;

    const getDescendants = (recursion_attributes, keys) => {
      return this.model.findAll({ where: {
        [Op.or]: recursion_attributes.map(([parent_key]) => ({ [parent_key]: { [Op.in]: keys }}))
      }});
    };

    // we want to return the type that a parent is -- if there is only one
    // parent we return an object, if there are many we return an array.
    const parentIsArray = Array.isArray(parent);

    // normalize `parent` so that it's always an array. we can either accept
    // a single sequelize parent or a query of sequelize parents.
    // NOTE: the above variable `parentIsArray` is not just used here, but also
    // below. Do not reduce this to a one-liner.
    if (!parentIsArray) parent = [parent];

    if (typeof recursion_attributes === "object") {
      recursion_attributes = Object.keys(recursion_attributes).map(o => [o, recursion_attributes[o]]);
    }

    // start out by fetching all the descendants of our root node.
    let keys = parent.map(o => o.dataValues[key]);
    let descendants = await getDescendants(recursion_attributes, keys);

    let flag = descendants.length > 0;

    // add the parent to the map because we want to make sure the children
    // nodes are added to it below in the `children.push(...)` line.
    let mapByKeys = {};
    parent.forEach(o => mapByKeys[o[key]] = o.dataValues);

    // `current_level` should start at one because this is kinda meant to be
    // a human readable label.
    let current_level = 1;
    // if there are no descendants at the top level, or any successive level,
    // break out of the `while` loop and return the complete tree as it is.
    // otherwise, break out when the level specified is hit (e.g. two layers deep).
    while (flag !== false && (typeof level === "number" ? current_level < level : true)) {
      if (descendants.length > 0) {
        // these are where we will push the keys of the descendants we have
        // already queried.
        let keys = [];
        for (let x = 0; x < descendants.length; x++) {
          // only reference `dataValues`, it makes it easier to form a JSON
          // object of just the SQL return values rather than the entire
          // sequelize object.
          let descendant = descendants[x].dataValues;
          if (!mapByKeys[descendant[key]]) keys.push(descendant[key]);

          // for each descendants, add it to the key/value object (this will be
          // garbage collected at the end of this function).
          mapByKeys[descendant[key]] = descendant;

          // and add this descendant to its parent. Note that because this is
          // created by reference, this actually builds a full tree without
          // requiring recursion or tunneling.
          recursion_attributes.forEach(([parent_key, col_name]) => {
            if (utils.hasKey(descendant, parent_key)) {
              if (!mapByKeys[descendant[parent_key]][col_name]) mapByKeys[descendant[parent_key]][col_name] = [];
              mapByKeys[descendant[parent_key]][col_name].push(descendant);
            }
          })
        }

        descendants = await getDescendants(recursion_attributes, keys);
        current_level++;
      } else flag = false;
    }

    // return the parent key, which should be the `dataValues` plus a .children
    // list with all children (that goes all the way down)...
    if (parentIsArray) {
      return parent.map(parent => mapByKeys[parent[key]]);
    }

    // if the input parent was a single parent not in an array, return the same
    // object structure back.
    return mapByKeys[parent[0][key]];
  }

  static generatePublicKey () {
    return utils.generateRandomString(16);
  }

}

module.exports = Model;
