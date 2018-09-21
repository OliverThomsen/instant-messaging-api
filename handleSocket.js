const handleSocket = (socket) => {
    console.log('New socket connection established - id:', socket.id)

    socket.on('chat', (data) => {
        console.log(data.message)

        io.sockets.emit('chat', data)
    })

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data)
    })
}

 module.exports = handleSocket
