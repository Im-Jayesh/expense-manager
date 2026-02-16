module.exports.models = {

  schema: true,

  // We set this to 'safe' globally. 
  // Your 'production.js' will override this anyway, but 'safe' is best practice.
  migrate: 'safe',

  attributes: {
    createdAt: { type: 'number', autoCreatedAt: true, },
    updatedAt: { type: 'number', autoUpdatedAt: true, },
    
    // --- MONGODB FIX START ---
    // We change type to 'string' and map it to '_id' which is what Atlas uses.
    id: { type: 'string', columnName: '_id' },
    // --- MONGODB FIX END ---
  },

  dataEncryptionKeys: {
    default: 'RG+IYAJj5CWIuS0HmiAD46iOUI+yUgRaioQ4BHhiym4='
  },

  cascadeOnDestroy: true

};