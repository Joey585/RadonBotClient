var socket = io();


const title = document.getElementById('title')

socket.on('first-bot', (username) => {
    console.log('Ran.')
    title.innerHTML = `Welcome ${username}`
})