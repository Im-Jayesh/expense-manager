module.exports = {

  friendlyName: 'Create account',

  inputs: {
    name: {
      type: 'string',
      required: true,
      maxLength: 200
    }
  },

  fn: async function ({ name }) {

    const userId = this.req.apiUser.userId;

    const newAccount = await Account.create({
      name,
      owner: userId
    }).fetch();

    return this.res.redirect('/accounts');
  }

};
