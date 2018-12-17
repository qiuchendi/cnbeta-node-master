

/**
 * 文章相关
 * @type {*}
 */
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const config = require('../config/dbconf');
mongoose.Promise = global.Promise;

var db=mongoose.connect(`mongodb://hudingyu:hudy320123!@${config.originIp}:${config.localPort}/${config.db.articlelist}`);
// var db = mongoose.connect(`mongodb://${config.localUrl}:${config.localPort}/${config.db.articlelist}`);

mongoose.connection.on("error", function (error) {
    console.log("database connnecting failed：" + error);
});

mongoose.connection.on("open", function () {
    console.log("database connnecting succeeded");
});

const articleModel = {
    sid: String,
    title: String,
    pubTime: String,
    label: String,
    source: String,
    hometext: String,
    summary: String,
    content: String,
    csrf: String,
    sn: String,
    thumb: String,
    author: String,
    commentCount: Number,
};

let schema = mongoose.Schema;
let articleMap = new schema(articleModel);
articleMap.plugin(mongoosePaginate);
let articleDbModel = mongoose.model('Article', articleMap);

module.exports = { articleModel, articleDbModel };