console.log('File test...')
Program exited with status code of null.App started on localhost server.
> INFO:
qiniu:listening on port:19110
>>skt cookie { _readableState:
   { objectMode: false,
     highWaterMark: 16384,
     buffer: [],
     length: 0,
     pipes: null,
     pipesCount: 0,
     flowing: true,
     ended: true,
     endEmitted: false,
     reading: false,
     sync: true,
     needReadable: false,
     emittedReadable: false,
     readableListening: false,
     defaultEncoding: 'utf8',
     ranOut: false,
     awaitDrain: 0,
     readingMore: false,
     decoder: null,
     encoding: null,
     resumeScheduled: false },
  readable: true,
  domain: null,
  _events: {},
  _maxListeners: undefined,
  socket:
   { _connecting: false,
     _hadError: false,
     _handle:
      { fd: 11,
        reading: true,
        owner: [Circular],
        onread: [Function: onread],
        onconnection: null,
        writeQueueSize: 0 },
     _parent: null,
     _host: null,
     _readableState:
      { objectMode: false,
        highWaterMark: 16384,
        buffer: [],
        length: 0,
        pipes: null,
        pipesCount: 0,
        flowing: true,
        ended: false,
        endEmitted: false,
        reading: true,
        sync: false,
        needReadable: true,
        emittedReadable: false,
        readableListening: false,
        defaultEncoding: 'utf8',
        ranOut: false,
        awaitDrain: 0,
        readingMore: true,
        decoder: null,
        encoding: null,
        resumeScheduled: false },
     readable: true,
     domain: null,
     _events:
      { end: [Object],
        finish: [Function: onSocketFinish],
        _socketEnd: [Function: onSocketEnd],
        drain: [Object],
        timeout: [Function],
        error: [Function: socketOnError],
        close: [Object],
        data: [Function: socketOnData] },
     _maxListeners: undefined,
     _writableState:
      { objectMode: false,
        highWaterMark: 16384,
        needDrain: false,
        ending: false,
        ended: false,
        finished: false,
        decodeStrings: false,
        defaultEncoding: 'utf8',
        length: 0,
        writing: false,
        corked: 0,
        sync: false,
        bufferProcessing: false,
        onwrite: [Function],
        writecb: null,
        writelen: 0,
        bufferedRequest: null,
        lastBufferedRequest: null,
        pendingcb: 0,
        prefinished: false,
        errorEmitted: false },
     writable: true,
     allowHalfOpen: true,
     destroyed: false,
     bytesRead: 599,
     _bytesDispatched: 311,
     _pendingData: null,
     _pendingEncoding: '',
     server:
      { domain: null,
        _events: [Object],
        _maxListeners: undefined,
        _connections: 1,
        _handle: [Object],
        _usingSlaves: false,
        _slaves: [],
        allowHalfOpen: true,
        pauseOnConnect: false,
        httpAllowHalfOpen: false,
        timeout: 120000,
        _connectionKey: '4:null:19110' },
     _idleTimeout: 120000,
     _idleNext:
      { [Function: utcDate]
        _onTimeout: [Function],
        _idleTimeout: 23,
        _idleNext: [Object],
        _idlePrev: [Circular],
        _idleStart: 952239419 },
     _idlePrev: { _idleNext: [Circular], _idlePrev: [Object] },
     _idleStart: 952239420,
     parser:
      { '0': [Function: parserOnHeaders],
        '1': [Function: parserOnHeadersComplete],
        '2': [Function: parserOnBody],
        '3': [Function: parserOnMessageComplete],
        _headers: [],
        _url: '',
        socket: [Circular],
        incoming: [Circular],
        maxHeaderPairs: 2000,
        onIncoming: [Function: parserOnIncoming] },
     _paused: false,
     read: [Function],
     _consuming: true,
     _httpMessage: null,
     _peername: { address: '::1', family: 'IPv6', port: 58227 } },
  connection:
   { _connecting: false,
     _hadError: false,
     _handle:
      { fd: 11,
        reading: true,
        owner: [Circular],
        onread: [Function: onread],
        onconnection: null,
        writeQueueSize: 0 },
     _parent: null,
     _host: null,
     _readableState:
      { objectMode: false,
        highWaterMark: 16384,
        buffer: [],
        length: 0,
        pipes: null,
        pipesCount: 0,
        flowing: true,
        ended: false,
        endEmitted: false,
        reading: true,
        sync: false,
        needReadable: true,
        emittedReadable: false,
        readableListening: false,
        defaultEncoding: 'utf8',
        ranOut: false,
        awaitDrain: 0,
        readingMore: true,
        decoder: null,
        encoding: null,
        resumeScheduled: false },
     readable: true,
     domain: null,
     _events:
      { end: [Object],
        finish: [Function: onSocketFinish],
        _socketEnd: [Function: onSocketEnd],
        drain: [Object],
        timeout: [Function],
        error: [Function: socketOnError],
        close: [Object],
        data: [Function: socketOnData] },
     _maxListeners: undefined,
     _writableState:
      { objectMode: false,
        highWaterMark: 16384,
        needDrain: false,
        ending: false,
        ended: false,
        finished: false,
        decodeStrings: false,
        defaultEncoding: 'utf8',
        length: 0,
        writing: false,
        corked: 0,
        sync: false,
        bufferProcessing: false,
        onwrite: [Function],
        writecb: null,
        writelen: 0,
        bufferedRequest: null,
        lastBufferedRequest: null,
        pendingcb: 0,
        prefinished: false,
        errorEmitted: false },
     writable: true,
     allowHalfOpen: true,
     destroyed: false,
     bytesRead: 599,
     _bytesDispatched: 311,
     _pendingData: null,
     _pendingEncoding: '',
     server:
      { domain: null,
        _events: [Object],
        _maxListeners: undefined,
        _connections: 1,
        _handle: [Object],
        _usingSlaves: false,
        _slaves: [],
        allowHalfOpen: true,
        pauseOnConnect: false,
        httpAllowHalfOpen: false,
        timeout: 120000,
        _connectionKey: '4:null:19110' },
     _idleTimeout: 120000,
     _idleNext:
      { [Function: utcDate]
        _onTimeout: [Function],
        _idleTimeout: 23,
        _idleNext: [Object],
        _idlePrev: [Circular],
        _idleStart: 952239419 },
     _idlePrev: { _idleNext: [Circular], _idlePrev: [Object] },
     _idleStart: 952239420,
     parser:
      { '0': [Function: parserOnHeaders],
        '1': [Function: parserOnHeadersComplete],
        '2': [Function: parserOnBody],
        '3': [Function: parserOnMessageComplete],
        _headers: [],
        _url: '',
        socket: [Circular],
        incoming: [Circular],
        maxHeaderPairs: 2000,
        onIncoming: [Function: parserOnIncoming] },
     _paused: false,
     read: [Function],
     _consuming: true,
     _httpMessage: null,
     _peername: { address: '::1', family: 'IPv6', port: 58227 } },
  httpVersionMajor: 1,
  httpVersionMinor: 1,
  httpVersion: '1.1',
  complete: true,
  headers:
   { host: 'localhost:8088',
     connection: 'keep-alive',
     pragma: 'no-cache',
     'cache-control': 'no-cache',
     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.80 Safari/537.36',
     accept: '*/*',
     referer: 'http://localhost:8088/pie/editor?pieName=test',
     'accept-encoding': 'gzip, deflate, sdch',
     'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4',
     cookie: 'io=aGzARYYEkoSe0gx-AAAA; ukey=76a45e19-3966-4e74-bd5d-80ea1d8cb360; pie=1/test; pieId=3; pieUid=1; pieName=1/editor; pieUrl=../mypies/editor.js' },
  rawHeaders:
   [ 'Host',
     'localhost:8088',
     'Connection',
     'keep-alive',
     'Pragma',
     'no-cache',
     'Cache-Control',
     'no-cache',
     'User-Agent',
     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.80 Safari/537.36',
     'Accept',
     '*/*',
     'Referer',
     'http://localhost:8088/pie/editor?pieName=test',
     'Accept-Encoding',
     'gzip, deflate, sdch',
     'Accept-Language',
     'zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4',
     'Cookie',
     'io=aGzARYYEkoSe0gx-AAAA; ukey=76a45e19-3966-4e74-bd5d-80ea1d8cb360; pie=1/test; pieId=3; pieUid=1; pieName=1/editor; pieUrl=../mypies/editor.js' ],
  trailers: {},
  rawTrailers: [],
  _pendings: [],
  _pendingIndex: 0,
  upgrade: false,
  url: '/socket.io/?EIO=3&transport=polling&t=LGkcVza',
  method: 'GET',
  statusCode: null,
  statusMessage: null,
  client:
   { _connecting: false,
     _hadError: false,
     _handle:
      { fd: 11,
        reading: true,
        owner: [Circular],
        onread: [Function: onread],
        onconnection: null,
        writeQueueSize: 0 },
     _parent: null,
     _host: null,
     _readableState:
      { objectMode: false,
        highWaterMark: 16384,
        buffer: [],
        length: 0,
        pipes: null,
        pipesCount: 0,
        flowing: true,
        ended: false,
        endEmitted: false,
        reading: true,
        sync: false,
        needReadable: true,
        emittedReadable: false,
        readableListening: false,
        defaultEncoding: 'utf8',
        ranOut: false,
        awaitDrain: 0,
        readingMore: true,
        decoder: null,
        encoding: null,
        resumeScheduled: false },
     readable: true,
     domain: null,
     _events:
      { end: [Object],
        finish: [Function: onSocketFinish],
        _socketEnd: [Function: onSocketEnd],
        drain: [Object],
        timeout: [Function],
        error: [Function: socketOnError],
        close: [Object],
        data: [Function: socketOnData] },
     _maxListeners: undefined,
     _writableState:
      { objectMode: false,
        highWaterMark: 16384,
        needDrain: false,
        ending: false,
        ended: false,
        finished: false,
        decodeStrings: false,
        defaultEncoding: 'utf8',
        length: 0,
        writing: false,
        corked: 0,
        sync: false,
        bufferProcessing: false,
        onwrite: [Function],
        writecb: null,
        writelen: 0,
        bufferedRequest: null,
        lastBufferedRequest: null,
        pendingcb: 0,
        prefinished: false,
        errorEmitted: false },
     writable: true,
     allowHalfOpen: true,
     destroyed: false,
     bytesRead: 599,
     _bytesDispatched: 311,
     _pendingData: null,
     _pendingEncoding: '',
     server:
      { domain: null,
        _events: [Object],
        _maxListeners: undefined,
        _connections: 1,
        _handle: [Object],
        _usingSlaves: false,
        _slaves: [],
        allowHalfOpen: true,
        pauseOnConnect: false,
        httpAllowHalfOpen: false,
        timeout: 120000,
        _connectionKey: '4:null:19110' },
     _idleTimeout: 120000,
     _idleNext:
      { [Function: utcDate]
        _onTimeout: [Function],
        _idleTimeout: 23,
        _idleNext: [Object],
        _idlePrev: [Circular],
        _idleStart: 952239419 },
     _idlePrev: { _idleNext: [Circular], _idlePrev: [Object] },
     _idleStart: 952239420,
     parser:
      { '0': [Function: parserOnHeaders],
        '1': [Function: parserOnHeadersComplete],
        '2': [Function: parserOnBody],
        '3': [Function: parserOnMessageComplete],
        _headers: [],
        _url: '',
        socket: [Circular],
        incoming: [Circular],
        maxHeaderPairs: 2000,
        onIncoming: [Function: parserOnIncoming] },
     _paused: false,
     read: [Function],
     _consuming: true,
     _httpMessage: null,
     _peername: { address: '::1', family: 'IPv6', port: 58227 } },
  _consuming: true,
  _dumped: true,
  _query: { EIO: '3', transport: 'polling', t: 'LGkcVza' },
  res:
   { domain: null,
     _events: { prefinish: [Function: resOnFinish] },
     _maxListeners: undefined,
     output: [],
     outputEncodings: [],
     outputCallbacks: [],
     writable: true,
     _last: false,
     chunkedEncoding: false,
     shouldKeepAlive: true,
     useChunkedEncodingByDefault: true,
     sendDate: true,
     _removedHeader: {},
     _hasBody: true,
     _trailer: '',
     finished: true,
     _hangupClose: false,
     _headerSent: true,
     socket: null,
     connection: null,
     _header: 'HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: 101\r\nAccess-Control-Allow-Origin: *\r\nSet-Cookie: io=3XTW3ayZ_mYBtDbdAAAA\r\nDate: Tue, 19 Apr 2016 12:58:44 GMT\r\nConnection: keep-alive\r\n\r\n',
     _headers: null,
     _headerNames: {},
     statusMessage: 'OK',
     statusCode: 200 },
  cleanup: [Function: cleanup],
  read: [Function] }
