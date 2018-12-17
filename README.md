# cnbeta-node-master
cnBeta爬取node端代码
使用 async await 做异步逻辑的处理。
使用 async库 来做循环遍历，以及并发请求操作。
使用 log4js 来做日志处理
使用 cheerio 来做新闻详情页的分析抓取。
使用 mongoose 来连接mongoDB 做数据的保存以及操作。

├── bin              // 入口
│   ├── article-list.js      // 抓取新闻列表逻辑
│   ├── content.js          // 抓取新闻内容逻辑
│   ├── server.js      // 服务端程序入口
│   └── spider.js      // 爬虫程序入口
├── config             // 配置文件
├── dbhelper           // 数据库操作方法目录
├── middleware      // koa2 中间件
├── model          // mongoDB 集合操作实例
├── router         // koa2 路由文件
├── utils         // 工具函数
├── package.json       
