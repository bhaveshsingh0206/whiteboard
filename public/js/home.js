let isDashboard = true; // visible
let isProfile = false; // invisible
let isNotification = false;
let notifications = document.getElementById('notifications');

const postContainer = document.getElementById('post-container');

globalPosts = [];

const user = {
	username: document.getElementById('user').dataset.username,
	email: document.getElementById('user').dataset.email,
	designation: document.getElementById('user').dataset.designation
};

var profile = document.getElementById('profile');
profile.addEventListener('click', e => {
	e.preventDefault();
	if (isProfile) {
		console.log('Already on profile');
	} else {
		console.log('get profile');
		getProfileDetails();
		isProfile = true;
		isDashboard = false;
		isNotification = false;
		profile.classList.add('active');
		dashboard.classList.remove('active');
		notification.classList.remove('active');
	}
});

var dashboard = document.getElementById('dashboard');
dashboard.addEventListener('click', e => {
	e.preventDefault();
	if (isDashboard) {
		console.log('already on dashboard');
	} else {
		console.log('get dashboard');
		getAllPosts();
		isDashboard = true;
		isProfile = false;
		isNotification = false;
		profile.classList.remove('active');
		dashboard.classList.add('active');
		notification.classList.remove('active');
	}
});

var notification = document.getElementById('notification');
notification.addEventListener('click', e => {
	e.preventDefault();
	if (isNotification) {
		console.log('already on notifications');
	} else {
		console.log('get notification');
		getAllNotifications();
		isNotification = true;
		isDashboard = false;
		isProfile = false;
		profile.classList.remove('active');
		dashboard.classList.remove('active');
		notification.classList.add('active');
	}
});

function getAllPosts() {
	let postRequest = new XMLHttpRequest();
	postRequest.onload = () => {
		let responseObject = null;

		try {
			responseObject = JSON.parse(postRequest.responseText);
		} catch (err) {
			console.log('Could not parse JSON!');
		}

		if (responseObject) {
			if (postRequest.status == 200) {
				// If posts are received successfully
				console.log(responseObject.posts);
				setPosts(responseObject.posts, false);
			} else {
				// TODO Error if network issue
				console.log('Error');
			}
		}
	};

	postRequest.open('get', '/post/all', true);

	postRequest.send();
}

getAllPosts();
dashboard.classList.add('active');

function setPosts(posts, notifs) {
	postContainer.innerHTML = '';
	if (notifs) {
		for (i = 0; i < posts.length; i++) {
			postHTML = `<div class="card gedf-card">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="mr-2">
                                </div>
                                <div class="ml-2">
                                    <div class="h5 m-0">Message</div>
                                    <div class="h7 text-muted">From ${posts[i].fromusername}</div>
                                </div>
                            </div>
                            <div>
                            
                             
                            </div>
                        </div>

                    </div>
                    <div class="card-body">
                     
                        <a class="card-link" href="#">
                            <h5 class="card-title" id="question${i}">${posts[i].comment}</h5>
                        </a>

                        <p class="card-text">
                            <div class="h5 m-0">${posts[i].code}</div>
                        </p>
                    </div>`;
			postContainer.innerHTML += postHTML;
		}
	} else {
		globalPosts = [];
		globalPosts = posts;
		postContainer.innerHTML = '';
		for (i = 0; i < posts.length; i++) {
			postHTML = `<div class="card gedf-card">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="mr-2">
                                </div>
                                <div class="ml-2">
                                    <div class="h5 m-0">@${posts[i].username}</div>
                                    <div class="h7 text-muted">${posts[i].email}</div>
                                </div>
                            </div>
                            <div>
                            
                                    <button class="btn btn-link dropdown-toggle downloaders" type="button" id="download${i}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" onclick="getId(this.id)">
                                        <i class="fa fa-arrow-down"></i>
                                    </button>
                             
                            </div>
                        </div>

                    </div>
                    <div class="card-body">
                        <div class="text-muted h7 mb-2"> <i class="fa fa-clock-o"></i>${showDate(
									posts[i].date
								)}</div>
                        <a class="card-link" href="#">
                            <h5 class="card-title" id="question${i}">${posts[i].question}</h5>
                        </a>

                        <p class="card-text">
                            <div class="editors" id="editor${i}"></div>
                        </p>
                    </div>`;
			postContainer.innerHTML += postHTML;
		}

		const downloaders = document.querySelectorAll('.downloaders');
		const editors = document.getElementsByClassName('editors');
		for (var i = 0; i < posts.length; i++) {
			//console.log(i);
			code = posts[i].code;
			input = posts[i].input;
			output = posts[i].output;
			question = posts[i].question;

			window.editor = ace.edit(`editor${i}`);
			editor.setTheme('ace/theme/terminal');
			editor.getSession().setMode('ace/mode/c_cpp');
			editor.setFontSize('16px');
			editor.setValue(formatCode(code, input, output));
			editor.clearSelection();
			editor.setReadOnly(true);

			// Start file download.
			// var p= document.getElementById(`download${i}`);
			//  p.onclick= function(){
			// // Generate download of hello.txt file with some content
			// var editor = document.getElementById(`editor${i}`);
			// 	var text = editor.getValue();
			// 	console.log(text);
			// var filename = question + ".c";

			//  download(filename, text);
		}
	}
}

$.ajax({
	url: `/post/count/${user.username}`,
	method: 'GET',
	success: function(msg) {
		document.getElementById('my-posts').innerHTML = msg.userPosts;
	},
	error: function(result) {
		console.log('Error occurred');
	}
});

$.ajax({
	url: '/post/count/today',
	method: 'GET',
	success: function(msg) {
		document.getElementById('today-posts').innerHTML = msg.today;
	},
	error: function(result) {
		console.log('Error occurred');
	}
});

async function getEmail(username) {
	let email = '';
	await $.ajax({
		url: `/email/${username}`,
		method: 'GET',
		success: function(msg) {
			email = msg.user[0].email;
			console.log(msg.user[0]);
			console.log(msg.user[0].email);
			return email;
		},
		error: function(result) {
			return email;
		}
	});
}

function showDate(realDate) {
	var copyDate = realDate;
	var date = realDate.split('T')[0];
	var postHours = (parseInt(copyDate.substring(11, 13)) + 6) % 24;
	if (postHours < 10) postHours = '0' + postHours;
	var postMinutes = (parseInt(copyDate.substring(14, 16)) + 30) % 60;
	if (postMinutes < 10) postMinutes = '0' + postMinutes;
	today = formatDate(new Date());
	var postYear = date.substring(0, 4);
	var postMonth = date.substring(5, 7);
	var postDay = date.substring(8, 10);
	var todayYear = today.substring(0, 4);
	var todayMonth = today.substring(5, 7);
	var todayDay = today.substring(8, 10);
	if ((todayDay = postDay && todayMonth == postMonth && todayYear == postYear)) {
		return `  Today at ${postHours}:${postMinutes}`;
	} else if ((todayDay = postDay + 1 && todayMonth == postMonth && todayYear == postYear)) {
		return `  Yesterday at ${postHours}:${postMinutes}`;
	} else {
		var months = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];
		//month = date.getMonth();
		//return `${months[month]} ${date.getDate()} at ${date.getHours()}:${date.getMinutes()}`;
		var month = Number(postMonth);
		return `  ${months[month]} ${postDay}  at ${postHours}:${postMinutes} `;
	}
}

function formatDate(date) {
	var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;

	return [year, month, day].join('-');
}

function formatCode(code, input, output) {
	if (input == '') {
		return code + '\n\n/*\nOutput:\n' + output + '\n*/';
	} else {
		return code + '\n\n/*\nInput:\n' + input + '\n\nOutput:\n' + output + '\n*/';
	}
}

function makeFile(code, input, output, question) {
	data = formatCode(code, input, output);
	$.ajax({
		url: '/download',
		method: 'POST',
		data: {
			data: data,
			name: question
		},
		success: function(msg) {
			console.log('Downloaded successfully');
		},
		error: function(result) {
			console.log('Error occurred');
		}
	});
}

function getProfileDetails() {
	$.ajax({
		url: `/post/${user.username}`,
		method: 'GET',
		success: function(msg) {
			setUpProfile(msg.userPosts, false);
		},
		error: function(result) {
			console.log('Error occurred');
		}
	});
}

function setUpProfile(posts) {
	console.log(posts);
	setPosts(posts);
}
const sendButton = document.getElementById('send');
sendButton.addEventListener('click', () => {
	console.log('clicked send');
	notif();
});

function notif() {
	const teacher = document.getElementById('inp1').value;
	const inpop = document.getElementById('inp2').value;
	const comment = document.getElementById('inp3').value;
	console.log(teacher + inpop + comment);
	$.ajax({
		url: '/notif',
		method: 'POST',
		data: {
			designation: user.designation,
			tousername: teacher,
			fromusername: user.username,
			code: inpop,
			comment: comment
		},
		success: function(msg) {
			console.log(msg);
			alert('SuccesFully Sent');
			teacher = '';
			inpop = '';
			comment = '';
		},
		error: function(result) {
			console.log(result);
			alert('Failed miserably');
		}
	});
}

//Download function
function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

// //Start file download.
// document.getElementById("download").addEventListener("click", function(){
//     // Generate download of hello.txt file with some content
//     var text = document.getElementById("text-val").value;
//     var filename = "hello.txt";

//     download(filename, text);
// }, false);

function getId(e) {
	console.log(e);
	id = e.substring(8);
	text = formatCode(globalPosts[id].code, globalPosts[id].input, globalPosts[id].output);
	// console.log(editor);
	// 	text = editor.getValue();
	console.log(text);
	filename = document.getElementById(`question${id}`).innerText + '.c';
	download(filename, text);
}

function getAllNotifications() {
	$.ajax({
		url: `/notif/${user.username}`,
		method: 'GET',
		success: function(msg) {
			console.log('notifs are');
			console.log(msg.notifs);
			setPosts(msg.notifs, true);
		},
		error: function(result) {
			console.log('Error occurred');
			return null;
		}
	});
}