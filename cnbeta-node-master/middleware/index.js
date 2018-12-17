

const bodyParser = require('koa-bodyparser');
const onerror = require('koa-onerror');
const logger = require('koa-logger');
const cors = require('koa2-cors');
const staticFiles = require('koa-static');
const path = require('path');

module.exports = (app) => {
    app.use(cors({
        credentials: true,
    }));
    app.use(staticFiles(path.resolve(__dirname, "../public")));
    app.use(bodyParser({
        enableTypes: ['json', 'form', 'text']
    }));
    app.use(logger());
    app.use(async(ctx, next) => {
        const start = new Date();
        await next();
        const ms = new Date() - start;
        console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
    });
    onerror(app);
};
