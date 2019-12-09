window.editor = ace.edit('editor');
editor.setTheme('ace/theme/terminal');
editor.setFontSize('16px');
editor.setValue(
	`#include<stdio.h>
int main(){

	/* Write your code here */

	return 0;
}`,
	4
);
editor.session.setOptions({
	mode: 'ace/mode/c_cpp',
	tabSize: 3,
	useSoftTabs: true
});
editor.moveCursorTo(4, 2);

const runButton = document.getElementById('run');
const postButton = document.getElementById('post');

runButton.addEventListener('click', () => {
	run();
});

postButton.addEventListener('click', () => {
	post();
});

const user = {
	username: document.getElementById('designation').dataset.username,
	email: document.getElementById('designation').dataset.email,
	designation: document.getElementById('designation').dataset.designation
};

if (user.designation == 'Teacher') {
	document.getElementById('aside').style.display = 'block';
	document.getElementById('top-data').style.borderTopLeftRadius = '0px';
	document.getElementById('editor-container').style.display = 'none';
	document.getElementById('i-o-container').style.display = 'none';
	document.getElementById('post').style.display = 'none';
} else {
	document.getElementById('aside').style.display = 'none';
	document.getElementById('top-data').style.width = '100%';
	document.getElementById('editor-container').style.width = '100%';
	document.getElementById('i-o-container').style.width = '100%';
}

console.log(user);

function run() {
	$('.animation-container').css({
		display: 'block'
	});
	const code = editor.getValue();
	const input = document.getElementById('input').value;
	const language = 'c';
	console.log(code);
	console.log(input);
	$.ajax({
		url: '/compile/c',
		method: 'POST',
		data: {
			code: code,
			input: input,
			language: language
		},
		success: function(msg) {
			$('.animation-container').css({
				display: 'none'
			});
			$('#output').html(msg['output']);
		},
		error: function(result) {
			console.log('Error Occured');
			$('.animation-container').css({
				display: 'none'
			});
		}
	});
}

function post() {
	const question = prompt('What is your code about?');
	const code = editor.getValue();
	const input = document.getElementById('input').value;
	const output = document.getElementById('output').value;
	$.ajax({
		url: '/post/code',
		method: 'POST',
		data: {
			username: user.username,
			email: user.email,
			designation: user.designation,
			question: question,
			code: code,
			input: input,
			output: output
		},
		success: function(msg) {
			if (msg['status']) {
				window.location.href = '/dashboard';
			}
		},
		error: function(result) {
			console.log('Error occurred');
			alert('Code could not be posted');
		}
	});
}

function showContainer() {
	document.getElementById('editor-container').style.display = 'block';
	document.getElementById('i-o-container').style.display = 'flex';
}

function hideContainer() {
	document.getElementById('editor-container').style.display = 'none';
	document.getElementById('i-o-container').style.display = 'none';
}

// Sockets
window.soc;
var socket = io('https://whiteboard-guakf.run.goorm.io');
var designation = document.getElementById('designation').dataset.designation;
var username = document.getElementById('designation').dataset.username;
var roomId = document.getElementById('designation').dataset.roomid;
console.log(roomId);

socket.emit('connect-to-room', {
	roomId: roomId,
	username: username,
	designation: designation
});
$('#roomName').text('Joined : ' + roomId);
$('#room').text('Created : ' + roomId);
$('#name').text(username);

if (designation === 'Teacher') {
	setInterval(function() {
		socket.emit('get-students', {
			roomId: roomId
		});
		socket.on('send-student', function(students) {
			var ul = document.getElementById('rooms-data');
			ul.innerHTML = '';
			students['studentsList'].forEach(function(student) {
				var id = student;
				console.log(student);
				ul.innerHTML +=
					'<li class="rooms-data-item" onclick="getClickUser(this.id)" 	id="' +
					id +
					'"><span>' +
					student +
					'</span><span class="online"</span></li>';
			});
		});
	}, 2000);

	// editor.getSession().on('change',function(){
	// socket.emit('transfer-teacher-data',{
	// 	"code"     : editor.getValue(),
	// 	'username' : username,
	// 	'teacher'  : teacher
	// });
	// });
	editor.textInput.getElement().addEventListener('keyup', function() {
		socket.emit('transfer-teacher-data', {
			code: editor.getValue(),
			username: username,
			teacher: teacher
		});
	});
} else {
	socket.on('connect', () => {
		console.log('her i m ', socket.id);
		window.soc = socket.id;
		console.log(window.soc);
		$('hidden-para').html(window.soc);
		// console.log("I m a student " ,window.socketStudentId);// an alphanumeric id...
	});

	var teacher = roomId.substring(0, roomId.length - 5);
	// editor.getSession().on('change',function(){
	// 	socket.emit('userdata',{
	// 		"code"     : editor.getValue(),
	// 		'username' : username,
	// 		'teacher'  : teacher
	// 	});
	// });

	editor.textInput.getElement().addEventListener('keyup', function() {
		socket.emit('userdata', {
			code: editor.getValue(),
			username: username,
			teacher: teacher
		});
	});

	socket.on('code-on-user', function(code) {
		console.log('here is the data bois ', code);
		console.log('yes i m grtting trigered');
		editor.setValue(code);
	});
}
function getClickUser(msg) {
	console.log('It entered her');
	var username = msg;
	var socketId = $('#hidden-para').html();
	console.log('Try to send this is to server ', socketId);
	showContainer();
	console.log(msg);
	socket.emit('get-user-data', {
		username: username,
		socketId: socketId
	});
	socket.on('code', function(code) {
		editor.setValue(code);
	});

	// setInterval(function(){
	// 	console.log("Trying to fetch data");
	// 	socket.emit('get-user-data',{
	// 	'student':msg
	// 	});
	// 	socket.on('sending-code-data',function(code){
	// 	// console.log(code);
	// 	editor.setValue(code);
	// 	});
	// },500);
}

socket.on('code', function(code) {
	editor.setValue(code);
});

$('#run').on('click', function() {
	run();
});