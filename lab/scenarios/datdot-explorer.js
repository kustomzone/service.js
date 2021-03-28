const http = require('http')
const debug = require('debug')
const log = debug(`datdot-explorer`)

const [json, port] = process.argv.slice(2)
const PORTS = JSON.parse(json)

const server = http.createServer(handler)
server.listen(port, function after () {
  log(`running on http://localhost:${this.address().port}`)
})

function handler (request, response) {
  log('request:', request.url)
  switch (request.url) {
    case "/":
      response.setHeader("Content-Type", "text/html")
      response.writeHead(200)
      response.end(explorer(PORTS))
      break
    default:
      response.setHeader("Content-Type", "application/json")
      response.writeHead(404)
      response.end(JSON.stringify({ error: "404 - not found" }))
      break
  }
}
function show (LOG = window.LOG) {
  document.body.innerHTML = ''
  const parser = document.createElement('div')
  document.body.innerHTML = `
  <div class="log"></div>
  <div class="status">${showStatus(LOG)}</div>
  <style>
    body { margin: 0; }
    .log { height: 85vh; background-color: #000; color: #ccc; display: flex; flex-direction: column; overflow-y: scroll; }
    .status { width: 100vw; height: 100vh; background-color: #000; }
    .item { padding: 5px 12px; font-family: arial; display:flex; flex-direction: row; }
    .name { font-size: 14px; min-width: 250px; }
    .message { font-size: 14px; word-break: break-word; }
  </style>`
  const [log, status] = document.body.children
  const nums = []
  const names = {}
  LOG.sort((a, b) => a[2] - b[2])

  window.toggleStack = function onclick (el, i) {
    if (el.children.length === 1) el.removeChild(el.lastChild)
    else {
      const [name, id, time, message, type, _stack] = LOG[i]
      var segment = ''
      const stack = _stack.split('\n').map(x=>x.trim()).slice(2).map((line, idx) => {
        if (!idx) {
          var [start, rest] = line.split('(')
          if (!rest) {
            rest = start
            start = ''
          }
          segment = rest.split('/lab/scenarios/logkeeper')[0]
          return [start, rest.replace(segment, '')].join('')
        } else {
          return line.replace(segment, '')
        }
      })
      const pre = document.createElement('pre')
      pre.style='color:lime;'
      pre.innerHTML = JSON.stringify(stack, 0, 2)
      el.append(pre)
    }
  }
  for (var i = 0, len = LOG.length; i < len; i++) {
    const [name, id, time, message] = LOG[i]
    const stamp = `${time}`.split('.')[0]
    const color = () => (names[name] || (names[name] = getRandomColor()))
    parser.innerHTML = `<div class="item" style="background-color: ${ i%2 ? '#282828' : '#202020'};">
      <div class="name" style="color: ${color()};">
        <span>${name}</span><span style="font-size: 9px"> (${id})</span>
      </div>
      <div class="message">${format(i, message)}</div>
    </div>`
    const [element] = parser.children
    log.append(element)
  }
  log.scrollTop = log.scrollHeight
  function getRandomColor () {
    var num = Math.random() * 360
    for (var i = 0; i < nums.length; i++) if (Math.abs(nums[i] - num) < 30) num = Math.random() * 360
    nums.push(num)
    return `hsla(${num}, 100%, 70%, 1)`
  }
  function format (id, message) {
    if (message && typeof message === 'object') {
      var { type, data } = message
      if (typeof data !== 'string') data = JSON.stringify(data)
      if (type === 'error') return `<span onclick="toggleStack(this, ${id})" style="color: red">${type}:${data}</span>`
      if (type === 'chainEvent') return `<span onclick="toggleStack(this, ${id})" style="color: orange">${type}:${data}</span>`
      if (type === 'block') return `<span onclick="toggleStack(this, ${id})" style="color: green">${type}:${data}</span>`
      if (type === 'chain') return `<span onclick="toggleStack(this, ${id})" style="color: DarkGoldenRod">${type}:${data}</span>`
      if (type === 'user') return `<span onclick="toggleStack(this, ${id})" style="color: DarkCyan">${type}:${data}</span>`
      if (type === 'peer') return `<span onclick="toggleStack(this, ${id})" style="color: DarkSeaGreen">${type}:${data}</span>`
      if (type === 'publisher') return `<span onclick="toggleStack(this, ${id})" style="color: purple">${type}:${data}</span>`
      if (type === 'sponsor') return `<span onclick="toggleStack(this, ${id})" style="color: lime">${type}:${data}</span>`
      if (type === 'author') return `<span onclick="toggleStack(this, ${id})" style="color: fuchsia">${type}:${data}</span>`
      if (type === 'hoster') return `<span onclick="toggleStack(this, ${id})" style="color: pink">${type}:${data}</span>`
      if (type === 'attestor') return `<span onclick="toggleStack(this, ${id})" style="color: olive">${type}:${data}</span>`
      if (type === 'encoder') return `<span onclick="toggleStack(this, ${id})" style="color: turquoise">${type}:${data}</span>`
      if (type === 'serviceAPI') return `<span onclick="toggleStack(this, ${id})" style="color: teal"> ${type}:${data}</span>`
      if (type === 'chat') return `<span onclick="toggleStack(this, ${id})" style="color: silver"> ${type}:${data}</span>`
      if (type === 'p2plex') return `<span onclick="toggleStack(this, ${id})" style="color: SlateBlue"> ${type}:${data}</span>`
      if (type === 'chainAPI') return `<span onclick="toggleStack(this, ${id})" style="color: white"> ${type}:${data}</span>`
      if (type === 'requestResponse') return `<span onclick="toggleStack(this, ${id})" style="color: aqua"> ${type}:${data}</span>`
      if (type === 'feed') return `<span onclick="toggleStack(this, ${id})" style="color: salmon"> ${type}:${data}</span>`
      if (type === 'log') return `<span onclick="toggleStack(this, ${id})" style="color: gray">${type}:${data}</span>`
      if (type === 'schedule') return `<span onclick="toggleStack(this, ${id})" style="color: seagreen">${type}:${data}</span>`
      return console.log('error', message)
    } else {
      console.error('weirdly formatted message', message)
      return message
    }
  }
  function showStatus (LOG) {
    return `<div style="color: gray; padding: 10px 40px;"> STATUS
        <div> event NewAmendment: ${countPresence('Event received: NewAmendment')} (7 roles per contract)</div>
        <div> Hosting OK, Starting Challenge Phase: ${countPresence('Starting Challenge Phase')} (3 per contract)</div>
        <br>
        <div> Storage challenge emitted: ${countPresence('"method":"NewStorageChallenge"')}</div>
        <div> Event received (attestor & hoster) ${countPresence('Event received: NewStorageChallenge')}</div>
        <div> Attestor: starting verifyStorageChallenge ${countPresence('Starting verifyStorageChallenge')}</div>
        <div> Hoster: starting Starting sendStorageChallenge ${countPresence('Starting sendStorageChallenge')}</div>
        <div> Hoster Storage fetching data ${countPresence('Fetching data for index')}</div>
        <div> Hoster -> Attestor: sending proof of storage ${countPresence('Sending proof of storage chunk')}</div>
        <div> Attestor received proof ${countPresence('Storage Proof received')}</div>
        <div> Attestor -> Hoster: storage is verified ${countPresence('Storage verified for chunk')}</div>
        <div> Hoster got all reponses: ${countPresence('responses received from the attestor')}</div>
        <div> event StorageChallengeConfirmed: ${countPresence('Event received: StorageChallengeConfirmed')} (3 per contract)</div>
        <br>
        <div> Performance challenge requests: ${countPresence('"method":"NewPerformanceChallenge"')}</div>
        <div> event PerformanceChallengeConfirmed: ${countPresence('Event received: PerformanceChallengeConfirmed')} (5 per contract)</div>
        <br>
        <div> FAIL_ACK_TIMEOUT: ${countPresence('FAIL_ACK_TIMEOUT')}</div>
        <div> uncaughtException Error: Channel destroyed uncaughtException ${countPresence('uncaughtException Error: Channel destroyed uncaughtException')}</div>
        <div></div>
      </div>`

      function countPresence (phrase) {
        const results = []
        for (var i = 0; i < LOG.length; i ++) {
          var [name, id, time, { type = '', data = '' }] = LOG[i]
          if (typeof data !== 'string') data = JSON.stringify(data)
          if (data && data.includes(phrase)) results.push(LOG)
          else if (type.includes(phrase)) results.push(LOG)
        }
        return results.length
      }
  }
}
function explorer (PORTS) {
  const script = `;(async (PORTS) => {
    window.PORTS = PORTS
    const name = 'datdot-explorer'
    start()
    function start () {
      window.connections = {}
      window.LOG = []
      function logger (port, message) {
        const msgs = connections[port].msgs
        const { flow: [from, into, id, time], type, data, meta: { stack } } = message

        if (type !== 'log') return console.error('unknown message type', message)
        if (!from) return console.error('missing sender', message)
        if (!into || into !== '*') return console.error('missing recipient', message)

        LOG.push([from, id, time, data, type, stack])
      }
      for (var i = 0, len = PORTS.length; i < len; i++) connect(PORTS[i])
      function connect (port) {
        const url = 'ws://localhost:' + port
        console.log('connecting and fetching logs from:', url)
        const ws = new WebSocket(url)
        connections[port] = { ws, port, codec: { encode, decode }, msgs: {} }
        var counter = 0
        function decode (json) { return JSON.parse(json) }
        function encode (type, data, cite) {
          const flow = [name, port, counter++]
          const message = { flow, cite, type, data }
          return JSON.stringify(message)
        }
        ws.onmessage = event => {
          const message = decode(event.data)
          logger(port, message)
        }
        ws.onopen = function open () {
          const message = encode('all:live')
          ws.send(message)
        }
        ws.onclose = function close () {
          const message = encode('close', 'unexpected closing of log server connection for: ' + port)
          console.error(message)
        }
        ws.onerror = function error (err) {
          const message = encode('error', err)
          console.error(message) // setTimeout(() => , 2000)
        }
      }
    }
    window.show = ${show}
  })([${PORTS.join(',')}])`
  const explorer = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <link rel="icon" type="image/png" sizes="16x16" href="data:image/png;base64,
  iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAMFBMVEU0OkArMjhobHEoPUPFEBIu
  O0L+AAC2FBZ2JyuNICOfGx7xAwTjCAlCNTvVDA1aLzQ3COjMAAAAVUlEQVQI12NgwAaCDSA0888G
  CItjn0szWGBJTVoGSCjWs8TleQCQYV95evdxkFT8Kpe0PLDi5WfKd4LUsN5zS1sKFolt8bwAZrCa
  GqNYJAgFDEpQAAAzmxafI4vZWwAAAABJRU5ErkJggg==" />
    </head>
    <body><script>${script}</script></body>
  </html>`
  return explorer
}
