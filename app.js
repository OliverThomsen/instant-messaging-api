const app = require('express')()
const io = require('socket.io')(app.listen(3000))
const handleSocket = require('./handleSocket')

io.on('connection', (socket) => handleSocket(io, socket))
