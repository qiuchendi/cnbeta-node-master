
/**
 * 遍历数据库中上一阶段得到的新闻列表来获取每篇新闻正文的url，抓取文章正文内容，更新到数据库
 */
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const async = require('async');
const logger = require('../config/log');
const path = require('path');
const https = require('https');

const {
    website,
    listBaseUrl,
    contentBaseUrl,
    serverIp,
    serverPort,
    totalPage
} = require('../config/originconf');

const dbHelper = require('../dbhelper/dbhelper');
const { articleModel, articleDbModel } = require('../model/article');

const {
    sleep,
    styleReg,
    scriptReg,
    mkDirs,
} = require('../utils/utils');

/**
 * 抓取正文程序入口
 * @returns {Promise.<*>}
 */
const articleContentInit = async() => {
    logger.info('grabbing article contents starts...');
    let uncachedArticleSidList = await getUncachedArticleList(articleDbModel);
    // console.log('未缓存的文章：'+ uncachedArticleSidList.join(','));
    const res = await batchCrawlArticleContent(uncachedArticleSidList);
    if (!res) {
        logger.error('grabbing article contents went wrong...');
    }
    return res;
};

/**
 * 查询新闻列表获取sid列表
 * @param Model
 * @returns {Promise.<void>}
 */
const getUncachedArticleList = async(Model) => {
    const selectedArticleList = await dbHelper.queryDocList(Model).catch(function (err){
        logger.error(err);
    });
    return selectedArticleList.map(item => item.sid);
    // return selectedArticleList.map(item => item._doc.sid);
};

/**
 * 批量抓取新闻详情内容
 * @param list
 * @returns {Promise}
 */
const batchCrawlArticleContent = (list) => {
    return new Promise((resolve, reject) => {
        async.mapLimit(list, 3, (sid, callback) => {
            getArticleContent(sid, callback);
        }, (err, result) => {
            if (err) {
                logger.error(err);
                reject(false);
                return;
            }
            resolve(true);
        });
    });
};

/**
 * 抓取单篇文章内容
 * @param sid
 * @param callback
 * @returns {Promise.<void>}
 */
const getArticleContent = async(sid, callback) => {
    let num = Math.random() * 1000 + 1000;
    await sleep(num);
    console.log('当前sid:' + sid);
    let url = contentBaseUrl + sid + '.htm';
    request(url, (err, response, body) => {
        if (err) {
            logger.error('grabbing article content went wrong，article url:' + url);
            callback(null, null);
            return;
        }
        const $ = cheerio.load(body, {
            decodeEntities: false
        });
        const serverAssetPath = `${serverIp}:${serverPort}/data`;
        let domainReg = new RegExp('https://static.cnbetacdn.com','g');
        let article = {
            sid,
            source: $('.article-byline span a').html() || $('.article-byline span').html(),
            summary: $('.article-summ p').html(),
            content: $('.articleCont').html().replace(styleReg.reg, styleReg.replace).replace(scriptReg.reg, scriptReg.replace).replace(domainReg, serverAssetPath),
        };
        saveContentToDB(article);
        let imgList = [];
        $('.articleCont img').each((index, dom) => {
            imgList.push(dom.attribs.src);
        });
        downloadImgs(imgList);
        callback(null, null);
    });
};

/**
 * 下载图片
 * @param list
 */
const downloadImgs = (list) => {
    const host = 'https://static.cnbetacdn.com';
    const basepath = './public/data';
    if (!list.length) {
        return;
    }
    try {
        async.eachSeries(list, (item, callback) => {
            let num = Math.random() * 500 + 500;
            sleep(num);
            if (item.indexOf(host) === -1) return;
            let thumb_url = item.replace(host, '');
            item.thumb = thumb_url;
            if (!fs.exists(thumb_url)) {
                mkDirs(basepath + thumb_url.substring(0, thumb_url.lastIndexOf('/')), () => {
                    // request
                    //     .get({
                    //         url: host + thumb_url,
                    //     })
                    //     .pipe(fs.createWriteStream(path.join(basepath, thumb_url)))
                    //     .on("error", (err) => {
                    //         console.log("pipe error", err);
                    //     });
                    console.log(host + thumb_url);
                    https.get(host + thumb_url, (res) =>{
                        let imgData = "";
                        res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
                        res.on("data", function(chunk){
                            imgData+=chunk;
                        });
                        res.on("end", function(){
                            // console.log('start write...');
                            fs.writeFile(path.join(basepath, thumb_url), imgData, "binary", function(err){
                                if(err){
                                    console.log("down fail:" + err);
                                }
                            });
                        });
                        res.on("error", function(err){
                            console.log(err);
                        });
                    });
                    callback(null, null);
                });
            }
        });
    }
    catch(err) {
        console.log(err);
    }
};
/**
 * 保存到文章内容到数据库
 * @param article
 */
const saveContentToDB = (item) => {
    let flag = dbHelper.updateCollection(articleDbModel, item);
    if (flag) {
        logger.info('grabbing article content succeeded：' + item.sid);
    }
};

module.exports = articleContentInit;