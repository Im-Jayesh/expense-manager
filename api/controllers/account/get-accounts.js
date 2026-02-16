module.exports = {

  friendlyName: 'Get accounts',

  description: 'Get all accounts for the logged in user.',

  fn: async function () {

    const userId = this.req.apiUser.userId;

    const accounts = await Account.find({
      owner: userId
    });

    return accounts;
  }

};
