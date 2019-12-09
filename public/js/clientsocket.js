var socket = io('https://whiteboard-guakf.run.goorm.io');
var designation = document.getElementById('designation').dataset.designation;
var username = document.getElementById('designation').dataset.username;
var dashboardBtn = document.getElementById('dashboard-btn');
var createRoomBtn = document.getElementById('create-room-btn');
var roomLI = document.querySelectorAll('.rooms-data-item');
window.rooms;
console.log(designation);
console.log(username);
if (designation === 'Teacher') {
	createRoomBtn.style.display = 'block';
} else {
	createRoomBtn.style.display = 'none';
	setInterval(function() {
		getRooms();
	}, 2000);
}

dashboardBtn.addEventListener('click', () => {
	window.location.href = '/dashboard';
});

createRoomBtn.addEventListener('click', () => {
	const roomName = prompt('Enter the Room name');
	if (roomName) {
		createRoom(roomName);
	} else {
		console.log('Teacher didnt enter any room name');
	}
});

function printPlease(msg) {
	var selectedRoom;
	window.rooms.forEach(function(room) {
		if (room.roomId === msg) {
			selectedRoom = room;
		}
	});
	console.log(selectedRoom.username);
	$('#room-title').html('<span class="highlight" id="name">' + selectedRoom.roomName + '</span>,');
	$('#room-id').html(
		'Room id: <span class="highlight" id="roomId">' + selectedRoom.roomId + '</span>'
	);
	$('#creator').html(
		'Created by <span class="highlight" id="teacher">' + selectedRoom.teacher + '</span>.'
	);
	$('#room-link').text('Click to join');
}

function createRoom(roomName) {
	var roomId = randomRoomId();
	$.ajax({
		url: '/create-room',
		method: 'POST',
		data: {
			roomId: roomId,
			teacher: username,
			roomName: roomName
		},
		success: function(msg) {
			if (msg) {
				var loc = '/room/' + roomId;
				window.location.href = loc;
			} else {
				console.log('Server returned false while creating room');
			}
		},
		error: function(result) {
			console.log('Error occurred');
		}
	});
}
function getRooms() {
	$.ajax({
		url: '/get-room',
		method: 'GET',
		success: function(rooms) {
			console.log(rooms);
			var ul = document.getElementById('rooms-data');
			ul.innerHTML = '';
			window.rooms = rooms['rooms'];
			rooms['rooms'].forEach(function(room) {
				//Append it to html
				console.log(room);
				ul.innerHTML +=
					'<li class="rooms-data-item" onclick="printPlease(this.id)" 	id="' +
					room.roomId +
					'"><span>' +
					room.roomName +
					'</span><span class="online"></span></li>';
			});
		},
		error: function(result) {
			console.log(result);
			console.log('Error occurred');
		}
	});
}

$('#room-link').on('click', function() {
	var password = '123456';
	var userEnteredPassword = prompt('Enter the password to join the room');
	if (userEnteredPassword == password) {
		// console.log($('#room-id').text());
		// console.log($('#room-id').text());
		// console.log($('#room-id').text());
		joinToRoom($('#roomId').text(), $('#name').text(), username);
	} else {
		console.log('Password entered was wrong');
	}
});

function joinToRoom(roomId, roomName, username) {
	$.ajax({
		url: '/enter-room',
		method: 'POST',
		data: {
			roomId: roomId,
			student: username,
			roomName: roomName
		},
		success: function(msg) {
			console.log('Room join Successfull');
			if (msg) {
				var loc = '/room/' + roomId;
				window.location.href = loc;
			}
		},
		error: function(result) {
			console.log('Error occurred');
		}
	});
}

function randomRoomId() {
	return username + Math.floor(Math.random() * 100000);
}