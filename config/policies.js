// config/policies.js
module.exports.policies = {

  // Default: allow everything (explicitly protect specific actions below)
  '*': true,

  // Public / always-allowed actions (UI + miscellaneous)
  'entrance/*': true,
  'view-homepage-or-redirect': true,
  'view-faq': true,
  'view-contact': true,
  'legal/view-terms': true,
  'legal/view-privacy': true,
  'deliver-contact-form-message': true,

  // Session-protected UI pages (browser must be logged-in via sails.sid)
  'dashboard/*': 'is-logged-in',
  'account/view-account-overview': 'is-logged-in',
  'account/view-edit-password': 'is-logged-in',
  'account/view-edit-profile': 'is-logged-in',
  'account/index': 'is-logged-in',


  // Account API actions — require JWT for API calls
  'account/update-password': 'isApiAuthenticated',
  'account/update-profile': 'isApiAuthenticated',
  'account/update-billing-card': 'isApiAuthenticated',

  // Allow logout to work via normal session (no JWT required)
  'account/logout': true,
  'account/get-accounts': 'isApiAuthenticated',
  'account/create': 'isApiAuthenticated',
  'account/update': 'isApiAuthenticated',
  'account/destroy': 'isApiAuthenticated',
  'transactions/*': 'isApiAuthenticated',
  'accounts/share': 'isApiAuthenticated',
  'transactions/create': 'isApiAuthenticated',
  
};
