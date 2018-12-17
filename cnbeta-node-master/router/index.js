

const api = require('./api');

module.exports = (app) => {
    app.use(api.routes(), api.allowedMethods());
};
