var express = require('express'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	flash = require('connect-flash'),
	socketio = require('socket.io'),
	compilex = require('compilex'),
	passport = require('passport'),
	localStrategy = require('passport-local'),
	passportLocalMongoose = require('passport-local-mongoose'),
	User = require('./models/User'),
	Post = require('./models/Post'),
	Notif = require('./models/Notif'),
	socketio = require('socket.io');

var students = [];
var app = express();
var rooms = [];
var expressServer = app.listen(3000, () => {
	console.log('Server is running');
});
var io = socketio(expressServer);

// mongoose.connect("mongodb://localhost/whiteboard",{ useNewUrlParser: true });
mongoose.connect('mongodb://localhost/whiteboard', {
	useUnifiedTopology: true,
	useNewUrlParser: true
});
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

app.use(
	require('express-session')({
		secret: 'hackathon is on!!',
		resave: false,
		saveUninitialized: false
	})
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.error1 = req.flash('error1');
	res.locals.error2 = req.flash('error2');
	res.locals.error3 = req.flash('error3');
	res.locals.out = req.flash('out');
	next();
});

// Landing page
app.get('/', (req, res) => {
	res.render('landing');
});

//To put middleware
app.get('/dashboard', isLoggedIn, (req, res) => {
	res.render('home');
});

//Routes Credentials
// or login in users
app.get('/login', (req, res) => {
	res.render('login');
});

app.get('/room/student', isLoggedIn, (req, res) => {
	res.render('student-room', {
		user: req.user
	});
});
app.get('/room/:roomId', isLoggedIn, function(req, res) {
	// console.log(req.params.roomId);
	res.render('student-room', {
		user: req.user,
		roomId: req.params.roomId
	});
});

app.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/dashboard',
		failureRedirect: '/login'
	}),
	function(req, res) {}
);

// For registering new user
app.post('/register', (req, res) => {
	if (req.body.designation) {
		if (req.body.password === req.body.confirmpassword) {
			var newUser = new User({
				username: req.body.username,
				email: req.body.email,
				designation: req.body.designation
			});
			User.register(newUser, req.body.password, async function(err, user) {
				if (err) {
					console.log(err);
					req.flash('error1', 'Username already exists');
					res.redirect('/login');
				} else {
					await User.authenticate('local')(req, res, function() {
						res.redirect('/dashboard');
					});
				}
			});
		} else {
			// Confirm password is wrong
			req.flash('error2', 'Passwords do not match');
			res.redirect('/login');
		}
	} else {
		// Please select designation.
		req.flash('error3', 'Select Designation');
		res.redirect('/login');
	}
});

// Save your code
app.post('/post/code', (req, res) => {
	if (req.body.designation == 'Student') {
		// console.log(req.body.email);
		const post = new Post({
			username: req.body.username,
			email: req.body.email,
			question: req.body.question,
			code: req.body.code,
			input: req.body.input,
			output: req.body.output
		});
		post.save(function(err) {
			if (!err) {
				res.send({
					status: true
				});
			} else {
				res.send({
					status: false
				});
			}
		});
	} else {
		console.log('Teachers cant post');
		res.send({
			status: false
		});
	}
});

//Notification code
app.post('/notif', (req, res) => {
	//if(req.body.designation == 'Student') {
	// console.log(req.body.email);
	const notif = new Notif({
		tousername: req.body.tousername,
		fromusername: req.body.fromusername,
		code: req.body.code,
		comment: req.body.comment
	});
	notif.save(function(err) {
		if (!err) {
			res.send({
				status: true
			});
		} else {
			res.send({
				status: false
			});
		}
	});

	
});
//notif get
app.get('/notif/:tousername', async (req, res) => {
	try {
		const notifs = await Notif.find({ tousername: req.params.tousername });
		res.status(200).json({ notifs: notifs });
	} catch (err) {
		res.status(400).json({ error: err });
	}
});

// Download code
app.post('/download', async (req, res) => {
	try {
		res.setHeader(`Content-disposition', 'attachment; filename=${req.body.name}.c`);
		res.setHeader('Content-type', 'text/plain');
		res.charset = 'UTF-8';
		res.write(req.body.data);
		res.end();
	} catch (err) {
		res.status(400).json({ error: err });
	}
});

// Retrieve all posts
app.get('/post/all', async (req, res) => {
	try {
		const posts = await Post.find().sort({ date: -1 });
		res.status(200).json({ posts: posts });
	} catch (err) {
		res.status(400).json({ error: err });
	}
});

// Today's posts
app.get('/post/count/today', async (req, res) => {
	try {
		var start = new Date();
		start.setHours(0, 0, 0, 0);
		var end = new Date();
		end.setHours(23, 59, 59, 999);
		const todayPosts = await Post.find({ date: { $gte: start, $lt: end } }).count();
		res.status(200).json({ today: todayPosts });
	} catch (err) {
		res.status(400).json({ error: err });
	}
});

// User's posts
app.get('/post/:username', async (req, res) => {
	try {
		const userPosts = await Post.find({ username: req.params.username }).sort({ date: -1 });
		res.status(200).json({ userPosts: userPosts });
	} catch (err) {
		res.status(400).json({ error: err });
	}
});

app.get('/post/count/:username', async (req, res) => {
	try {
		const userPosts = await Post.find({ username: req.params.username }).count();
		res.status(200).json({ userPosts: userPosts });
	} catch (err) {
		res.status(400).json({ error: err });
	}
});

// Get email from username
app.get('/email/:username', async (req, res) => {
	try {
		const user = await User.find({ username: req.params.username });
		res.status(200).json({ user: user });
	} catch (err) {
		res.status(400).json({ error: err });
	}
});

// LOGOUT
app.get('/logout', (req, res) => {
	req.logout();
	req.flash('out', 'Successfully logged you out');
	res.redirect('/login');
});
//Checking for Authenication
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		//req.flash("error", "Please Login First!");
		return res.redirect('/login');
	}
}

// Route for ROOMS
app.get('/room', isLoggedIn, (req, res) => {
	res.render('room', {
		user: req.user
	});
});

// SETTING UP SOCKETIO
// io.on('connect',(socket) => {
// 	socket.on('create-room',function(msg){
// 		console.log(msg)
// 		socket.join(msg.roomId);
// 		// socket.to(msg.roomId).emit('send-room-data',{'username':msg.})
// 		var room = {
// 			"roomName" : msg.roomName,
// 			"teacher" : msg.teacher,
// 			"roomId"   : msg.roomId,
// 		};
// 		var firstRoomSection = {
// 			"roomId"   : msg.roomId,
// 			"students" : []
// 		}
// 		rooms.push(room);
// 		socket.emit('success-creating-room',{
// 			"result" : true,
// 			"roomId" : msg.roomId
// 		});
// 		// socket.broadcast.emit('room-created', {
// 		// 	'username':msg.username,
// 		// 	'roomId':msg.roomId,
// 		// 	'roomName':msg.roomName
// 		// });
// 	});

// // 	Send the room lIst to data
// 	setInterval(function(){
// 		socket.emit('get-rooms',{
// 		"rooms" : rooms
// 	});
// 	},2000);
var adminID = '';
var teacherArray = [];
var userData = [];
var user = '';
var activeuserSocketId = '';

io.on('connect', function(socket) {
	// console.log("Welcome new user");
	socket.on('ok', function() {
		//
	});
	socket.on('connect-to-room', function(data) {
		socket.join(data.roomId);
		var count = 0;
		if (data.designation === 'Teacher') {
			// adminID = socket.id;
			adminID = socket.id;
			teacherArray.forEach(function(item) {
				if (item.username == data.username) {
					// item.code = data.code;
				} else {
					count + -1;
				}
			});
			if (count == teacherArray.length) {
				var temp = {
					id: socket.id,
					username: data.username
				};
				teacherArray.push(temp);
			}
		}
	});

	socket.on('get-students', function(msg) {
		// console.log(msg);
		// console.log(students);
		// console.log(rooms);
		studentInRoom = [];
		students.forEach(function(item) {
			// console.log(item)
			if (item.roomId == msg['roomId']) {
				studentInRoom = item.students;
			}
		});
		socket.emit('send-student', {
			studentsList: studentInRoom
		});
		// console.log(studentInRoom);
	});

	socket.on('transfer-teacher-data', function(data) {
		// if (user == data.username) {
		// console.log(activeuserSocketId);
		// console.log(data.code);
		socket.broadcast.to(activeuserSocketId).emit('code-on-user', data.code);
		// }
	});

	socket.on('get-user-data', function(data) {
		console.log(data);
		user = data.username;
		// activeuserSocketId = data.socketId;
		// console.log(user,"Active user is here bro ",activeuserSocketId);
		userData.forEach(function(item) {
			if (data.username == item.username) {
				socket.emit('sending-code-data', item.code);
			}
		});
	});

	socket.on('userdata', function(data) {
		// console.log(user,data.username);
		if (user == data.username) {
			activeuserSocketId = socket.id;
			console.log('Here is data of socket which is sending ', socket.id);
			console.log(adminID);
			// activeuserSocketId = socket.id;
			socket.broadcast.to(adminID).emit('code', data.code);
		}

		var count = 0;
		userData.forEach(function(item) {
			if (item.username == data.username) {
				item.code = data.code;
			} else {
				count + -1;
			}
		});
		if (count == userData.length) {
			var temp = {
				code: data.code,
				username: data.username
			};
			userData.push(temp);
		}
		// console.log("Dais here boiss");
		// console.log(userData);
	});
});

// });

app.post('/create-room', function(req, res) {
	var room = {
		roomName: req.body.roomName,
		teacher: req.body.teacher,
		roomId: req.body.roomId
	};
	rooms.push(room);
	var firstRoomSection = {
		roomId: req.body.roomId,
		students: []
	};
	students.push(firstRoomSection);
	res.send(true);
});
app.get('/get-room', function(req, res) {
	res.send({
		rooms: rooms
	});
});
app.post('/enter-room', function(req, res) {
	// console.log(req.body);
	students.forEach(function(student) {
		if (student.roomId == req.body.roomId) {
			student.students.push(req.body.student);
		}
	});
	// console.log(students);
	res.send(true);
});

// app.get('/newpage:id',function(req, res){
// 	res.send('Teacher has enter room page ',id)
// });

// Compilex

var compiler = require('compilex');
var option = { stats: true };
compiler.init(option);

app.post('/compile/c', function(req, res) {
	// console.log("entered here");
	var code = req.body.code;
	var input = req.body.input;
	// console.log(code);
	// console.log(input);
	compiler.flush(function() {
		console.log('All previous temporary files flushed !');
	});
	if (input === '') {
		var envData = { OS: 'linux', cmd: 'gcc', options: { timeout: 1000 } };
		compiler.compileCPP(envData, code, function(data) {
			if (data.error) {
				res.send({
					output: data.error,
					status: false
				});
			} else {
				console.log(data.output);
				res.send({
					output: data.output,
					status: true
				});
			}
		});
	} else {
		var envData = { OS: 'linux', cmd: 'gcc', options: { timeout: 1000 } };
		compiler.compileCPPWithInput(envData, code, input, function(data) {
			if (data.error) {
				res.send({
					output: data.error,
					status: true
				});
			} else {
				console.log(data.output);
				res.send({
					output: data.output,
					status: true
				});
			}
		});
	}
});