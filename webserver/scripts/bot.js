var socket = io();

function sendMessage(){
    const msg = document.getElementById('chat-box').value
    if (msg) {
        socket.emit('chat-send', msg)
    }
    return false;
}
function clearChat(){
    const container = document.getElementById('chat-container')
    container.innerHTML = ``
}

socket.on('health', (health) => {
    const healthLabel = document.getElementById('health')
    healthLabel.innerHTML = `Health: ${health}`
})
socket.on('botData', (data) => {
    const username_label = document.getElementById('username')
    const location_label = document.getElementById('location')
    username_label.innerHTML = `Username: ${data.username}`
    location_label.innerHTML = `Position: <br><strong>X=</strong> ${data.x}<br><strong>Y=</strong> ${data.y}<br><strong>Z=</strong> ${data.z}`
})
socket.on('chat', (data) => {
    const container = document.getElementById('chat-container')
    const area = document.createElement('p')
    area.innerHTML = `${data}`
    container.append(area)
    if (container.childElementCount > 13) {
        const firstChild = container.firstElementChild
        firstChild.remove()
    }
})