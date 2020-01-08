const express = require('express')
const app = express()
const port = 8866

app.use(express.json())

// 处理跨域
app.all('*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Content-Type", "text/event-stream")
  res.header("Connection", "keep-alive")
	res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS")
  if(req.method=="OPTIONS") {
    res.sendStatus(200)
  } else {
    next()
  }
})

app.get('/api/stream', async (req, res) => {
  let timer = null
  // 消息块
  // 消息块用 \n\n 结尾 不加？data 消息连接另外一条消息
  // 消息块中单个字段用 \n 结尾 不加？此消息失效
  // \n 前最好不要加空格，保证输出结果中没有空格
  // event-stream 文本书写格式
  if (!req.query.q) {
    res.send('404')
    return false
  }
  res.write(`retry: 1000\n`)
  res.write(`id: ${+ new Date()}\n`)
  res.write(`data: ${JSON.stringify({
    eventName: 'message'
  })}\n\n`)
  
  

  timer = setInterval(() => {
    // 另外消息块
    // 自定义 sse 事件
    res.write(`retry: 1000\n`)
    res.write(`event: sse\n`)
    res.write(`id: ${+ new Date()}\n`)
    res.write(`data: ${JSON.stringify({
      eventName: 'sse'
    })}\n\n`)
  }, 1000)

  req.connection.addListener('close', () => {
    console.log('SSE 关闭: closed')
    clearInterval(timer)
    timer = null
  })
})

app.listen(
  port,
  () => {
    console.log(`run app on port ${port}`)
  }
)