var socket = io('https://whiteboard-guakf.run.goorm.io');
const rooms = document.getElementById('rooms-data');

// socket.on('room-created', data => {
// 	const room = document.createElement('li');
// 	room.innerText = data.roomName;
// 	rooms.append(room);
// });