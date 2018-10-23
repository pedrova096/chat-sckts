const net = require('net');
const port = process.env.PORT || 3000;
let clients = [];

let crearMsj = (from, message) => {
    if (message) {
        return `${from}> ${message}\n`;
    } else {
        // return ` <${from}\n`;
        return `${from}> `;
    }
}
let getUsuarios = () => clients.map(m => m.name);
let getUsuariosToString = () => `\n\t-${getUsuarios().join('\n\t-')}`;
let broadcast = (sender, message) => {
    clients.forEach((client) => {
        if (client === sender) return;
        client.write(crearMsj(sender.name, message));
        client.write(crearMsj(client.name));
    });
}
net.createServer((socket) => {
    socket.write("\nBienvenido a Pedro's Chat\n");
    socket.isOnName = true;
    socket.write(crearMsj('Nombre'));
    socket.on('data', (data) => {
        let mensaje = data.toString().trim();
        if (socket.isOnName) {
            if (mensaje.length === 0) {
                socket.write(crearMsj('Administrador', 'Digite un nombre de usuario valido'));
                socket.write(crearMsj('Nombre'));
            } else if (getUsuarios().includes(mensaje) || mensaje.toLowerCase() === 'administrador') {
                socket.write(crearMsj('Administrador', 'Nombre de usuario ya existente'));
                socket.write(crearMsj('Nombre'));
            } else {
                socket.isOnName = false;
                socket.name = mensaje;
                clients.push(socket);
                if (clients.length > 1)
                    socket.write(crearMsj('Administrador', `usuarios conectados:${getUsuariosToString()}`));
                broadcast({ name: 'Administrador' }, `${mensaje} se ha unido al chat`);
                // socket.write(crearMsj(socket.name));
            }
        } else {
            //socket.write(crearMsj(socket.name, mensaje));
            broadcast(socket, mensaje);
            socket.write(crearMsj(socket.name));
        }

    });
    socket.on('end', () => {
        clients = clients.filter(c => c != socket);
        broadcast({ name: 'Administrador' }, `${socket.name} ha salido del chat`);
    });
    socket.on('close', () => {
        clients = clients.filter(c => c != socket);
        broadcast({ name: 'Administrador' }, `${socket.name} ha salido del chat`);
    });
    socket.on('error', () => {
        clients = clients.filter(c => c != socket);
    });
}).on('error', (err) => {
    console.log(err);
}).listen(port);
console.log(`server corriendo, puerto: ${port}`);