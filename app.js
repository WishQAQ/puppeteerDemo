const axios = require('axios');

const express = require('express')
const app = express()
const port = 3000

const scraper = require('./ticketJs')

// scraper.load = {
//   account: 'fd13308092229ntbcm',
//   password: 'zxc123456',
//   start: '重庆北',
//   end: '重庆西',
//   time: '2020-1-28',
//   ticketNum: 'K836',
//   // userName: '宋娇',
//   userName: '董欢',
//   userNumber: '513436200309092060',
//   userType: '儿童票'
// }

app.get('/', (req, res) => {

  const mediumArticles = new Promise((resolve, reject) => {
    scraper
        .scrapeMedium()
        .then(data => {
          resolve(data)
        })
        .catch(err => reject('Medium scrape failed'))
  })


  Promise.all([mediumArticles])
      .then(data => {
        console.log(data);

        let passengerArr = [];

        let passengerForm = {
          passenger_id: '',  // 乘客ID
          name: '',  // 乘客姓名
          r_order_sn: '',  // 12306订单号
          seat_number: '', // 席位号
          ticket_species: '', // 票种
          ticket_price: '', // 票价
          ticket_status: '',  // 出票状态
          ticketing_time: '', // 出票时间
          payment_account: '', // 支付账号
          payment_flow_number: '', // 支付流水号
        }

        passengerArr.push(passengerForm)

        axios.post('/plug/addBuyTicketsInfo/1', {
          order_sn : '',  // 订单号
          token : '',  // 行程标识
          routeId: '',  // 路线标识
          departure: '', // 发站
          arrival: '', // 到站
          riding_time: '', // 乘车时间
          ticket_check: '', // 检票口
          trips_number: '', // 车次
          info: JSON.stringify(passengerArr),

        })
            .then(function (response) {
              console.log(response);
            })
            .catch(function (error) {
              console.log(error);
            });

      })
      .catch(err => res.status(500).send(err))

})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

