var login = document.querySelector('#login');
var loginQ = document.querySelector('#loginQ');
var register = document.querySelector('#register');
var registerQ = document.querySelector('#registerQ');

var frontSide = document.querySelector('#front-side');
var backSide = document.querySelector('#back-side');

loginQ.addEventListener('click', () => {
	frontSide.style.transform = 'perspective(' + 900 + 'px) rotateY(' + 0 + 'deg)';
	backSide.style.transform = 'perspective(' + 900 + 'px) rotateY(' + 180 + 'deg)';
	console.log('loginQ pressed');
});

registerQ.addEventListener('click', () => {
	frontSide.style.transform = 'perspective(' + 900 + 'px) rotateY(' + -180 + 'deg)';
	backSide.style.transform = 'perspective(' + 900 + 'px) rotateY(' + 0 + 'deg)';
	console.log('registerQ pressed');
});