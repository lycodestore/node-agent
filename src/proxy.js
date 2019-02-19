const http = require('http')
const path = require('path')

const proxy = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin" , "*")
  res.setHeader("Access-Control-Allow-Headers" , "content-type")
  res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
  
  getParams(req).then(params => {
    req.body = params
    transmit(req, res)
  })
})

proxy.listen(80, 'localhost', () => {
  console.log('listening......')
})

// 从原生请求对象中过滤出请求体
function getParams (req) {
  return new Promise((resolve, reject) => {
    let body = []
    req.on('data', (chunk) => {
      body.push(chunk)
    }).on('end', () => {
      body = Buffer.concat(body).toString()
      if (body.trim() === '') {
        resolve(null)
      } else {
        try {
          let result = JSON.parse(body)
          resolve(result)
        } catch(ex) {
          reject(ex)
        }
      }
    })
  })
}

// 转发请求
function transmit (req, res) {
  const options = {
    hostname: 'www.baidu.com',
    port: 80,
    path: req.url,
    method: req.method
  }

  const creq = http.request(options, (cres) => {
    cres.setEncoding('utf8');
    cres.on('data', (chunk) => {
      res.write(chunk)
    });
    cres.on('end', () => {
      res.end()
    });
  })

  creq.on('error', (e) => {
    console.log(e.message)
  })
  
  creq.write(JSON.stringify(req.body))
  creq.end()
}
