module.exports = {

  friendlyName: 'Generate account number',


  description: 'Generate a pseudo-random 10-digit string for use as a bank account number.',


  inputs: {
    // No inputs needed
  },


  exits: {

    success: {
      outputFriendlyName: 'Account number',
      outputType: 'string'
    },

  },


  fn: async function (inputs) {

    // 1. Generate a random number between 1,000,000,000 and 9,999,999,999
    // This isn't "cryptographically secure" but works for this assignment.
    var min = 1000000000;
    var max = 9999999999;
    var randomNum = Math.floor(Math.random() * (max - min + 1)) + min;

    // 2. Return it as a string
    return randomNum.toString();

  }


};