var socket = io();

let botsOn = 0;
const botsConnected = document.getElementById('connected')
const loc = window.location.pathname;
const dir = loc.substring(0, loc.lastIndexOf('/'));

function addBot() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const host = document.getElementById('host').value;
    const port = document.getElementById('port').value;
    socket.emit('add-bot', username, password, host, port)
    console.log(`Adding ${username}...`)
}

socket.on('show-bot', (response) => {
    botsOn++
    botsConnected.innerHTML = `Bots Connected: ${botsOn}`
    const container = document.getElementById( 'all-bots');
    const botImage = document.createElement('img')
    const childContainer = document.createElement('div')
    const button = document.createElement("button")
    const link = document.createElement('a')
    const text = document.createTextNode(`Username: ${response.username}`)
    button.textContent = "Delete Bot"
    button.id = response.username
    button.addEventListener("dblclick", () => {
        socket.emit('remove-bot', button.id, () => {
            container.removeChild(childContainer)
            botsOn--
        })
    })
    botImage.src = `https://crafatar.com/avatars/${response.uuid}`
    botImage.style.width = `100px`
    botImage.style.height = `100px`
    childContainer.style.border = `solid 5px gray`
    childContainer.appendChild(botImage)
    console.log(container)
    link.appendChild(text)
    link.href = `${dir} ` + `bots/${response.username}.html`
    console.log(link.href)
    childContainer.appendChild(link)
    childContainer.appendChild(button)
    container.appendChild(childContainer)
})


function followUser() {
    const target = document.getElementById('target').value;
    socket.emit('follow-user', target)
}


