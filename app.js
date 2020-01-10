const axios = require('axios');

let appData = require('./ticketData')

const express = require('express')
const app = express()
const scraper = require('./demoJs')
const fs  =require('fs')

const port = 3000

const bodyParser = require('body-parser');//解析,用req.body获取post参数
// 添加json解析
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'))
// 允许所有的请求形式
app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

  if (req.method == 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
});

// app.get("/")

// let store=JSON.parse(fs.readFileSync('./store.json').toString())

// app.get("/tickets",(req,res)=>{
//   res.setHeader('Content-Type', 'application/json');
//   res.end(JSON.stringify(store.tickets));
// })
app.post('/post', function (req, res) {
  let params = req.body
  // store.tickets.push(params);
  // fs.writeFile('./store.json',JSON.stringify(store),()=>{})

  console.log('当前购票路线：'+ params.time + ' ' + params.start + ' - ' + params.end + ' ' + params.ticketNumber);
  console.log('当前购票乘客：');
  params.info.forEach((userInfo,index) =>{
    console.log((index+1)+'：'+ userInfo.userName + ' ' + userInfo.userId + ' ' + userInfo.userType);
  })

  appData.params = params
  // module.exports.params = params;

  let data = {
    account: params.userAcc,
    password: params.userPas
  }

  console.log('当前客户端账号：'+ params.userAcc)
  console.log('当前客户端密码：'+ params.userPas)

  axios.post('https://tohcp.cn/account/login',data)
      .then(val =>{
        if(val.data.code === 0){
          console.log('登录客户端账号成功');
          axios.interceptors.request.use(function (config) {    // 这里的config包含每次请求的内容
            config.headers['csrf'] = val.data.result.csrf;
            return config;
          }, function (err) {
            return Promise.reject(err);
          });

          setTimeout(() =>{

            let ticketData = {
              account: params.account,
              password: params.password
            }

            console.log('当前12306账号：'+ params.account)
            console.log('当前12306密码：'+ params.password)

            axios.interceptors.request.use(function (config) {    // 这里的config包含每次请求的内容
              config.headers['a'] = params.account;
              config.headers['p'] = params.password;
              config.headers['csrf'] = val.data.result.csrf;
              return config;
            }, function (err) {
              return Promise.reject(err);
            });

            axios.post('https://tohcp.cn/plug/login',ticketData).then(val =>{
              if(val.data.code === 0){
                console.log('12306账号后台成功，请勿修改12306登录页面账号');
                const mediumArticles = new Promise((resolve, reject) => {
                  scraper
                      .scrapeMedium()
                      .then(data => {
                        resolve(data)

                      })
                      .catch(err => reject('Medium scrape failed'))
                })
              }else {
                console.log(val.data.msg);
              }
            }).catch(() =>{})
          },800)

        }else {
          console.log(val.data.msg);
        }
      })
      .catch(() =>{

      })

    res.send(200);

})

// app.get('/', (req, res) => {
//
//   const mediumArticles = new Promise((resolve, reject) => {
//     scraper
//         .scrapeMedium()
//         .then(data => {
//           resolve(data)
//         })
//         .catch(err => reject('Medium scrape failed'))
//   })
//
//


app.listen(port, () => console.log(`puppeteer 购票开始!`))

