const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = 1000
canvas.height = 600
const targetWnh = 148
let countdown = 3
let frame = 0
let levelTimeout = {
	easy: 30,
	normal: 20,
	hard: 15,
}

let isPaused = false
let targetsPos = [
	{ x: 100, y: 150 },
	{ x: 100, y: 370 },
	{ x: 300, y: 270 },
	{ x: 530, y: 250 },
	{ x: 400, y: 100 },
	{ x: 700, y: 70 },
	{ x: 700, y: 270 },
]

let targets = []
let availableTargets=[...targetsPos]
for(let i = 0; i < 3;i++){
	let index = Math.floor(Math.random() * availableTargets.length)
	targets.push(availableTargets[index])
	availableTargets.splice(index, 1)
}
let isBoom = false
const pointerWnh = 56
let mouseX = 0, mouseY = 0, offsetX = 0, offsetY = 0
let score = 0
let isPlay = false
let endGame = false
let frameSwitchGun = 0

let { username, diff, gunSrc, targetSrc } = JSON.parse(localStorage.getItem('gameSet'))

const bgImg = new Image()
bgImg.src = '/Sprites/background.jpg'
const pointerImg = new Image()
pointerImg.src = '/Sprites/pointer.png'
const boomImg = new Image()
boomImg.src = '/Sprites/boom.png'
const gunImg = new Image()
gunImg.src = `/Sprites/${gunSrc}`
const targetImg = new Image()
targetImg.src = `/Sprites/${targetSrc}`

let countEL = document.createElement('span')
countEL.style.position = 'absolute'
countEL.style.font = '50px Arial'
countEL.style.fontWeight = 'bold'
document.querySelector('.game').appendChild(countEL)

document.addEventListener('keyup', (e) => {
	if(e.code === 'Space'){
		changeGun()
	}
	if(e.code === 'Escape'){
		if(!endGame && countdown < 0){
			isPaused = !isPaused
			if(countdown < 0){
				isPlay = !isPaused
			}
			if(isPaused){
				document.querySelector('.pauseMenu').style.display = 'flex'
			}else{
				document.querySelector('.pauseMenu').style.display = 'none'
			}
		}
	}
})

document.getElementById('resume').onclick = () => {isPaused=false; document.querySelector('.pauseMenu').style.display = 'none';if(countdown < 0){
	isPlay = !isPaused
}}

canvas.onmousemove = (e) => {
	mouseX = e.offsetX - pointerWnh / 2
	mouseY = e.offsetY - pointerWnh / 2
	offsetX = e.offsetX
	offsetY = e.offsetY
}
let currentTimeout = levelTimeout[diff];
canvas.onclick = (e) => {
    if (!isPlay) return;
	if(gunState) return
    isBoom = true;
    let isHit = false;

    targets.forEach((target, index) => {
        if (e.offsetX > target.x &&
            e.offsetX < target.x + targetWnh &&
            e.offsetY > target.y &&
            e.offsetY < target.y + targetWnh) {
            score++;
            isHit = true;
            targets.splice(index, 1);
        }
    });

    if (!isHit) {
        if (currentTimeout > 5) {
            currentTimeout -= 5;
        } else {
            currentTimeout = 0;
        }
    }

    setTimeout(() => isBoom = false, 200);
};

const renderCountdown = setInterval(() => {
	countEL.textContent = countdown;
	if (countdown === 0) {
		clearInterval(renderCountdown);
		isPlay = true;
		countEL.remove();

		const timerInterval = setInterval(() => {
			if (currentTimeout <= 0) {
				currentTimeout = 0
				clearInterval(timerInterval);
				isPlay = false;
				endGame = true
				renderEndGame()
			} else {
				if(!isPaused){
					currentTimeout--
				}
			}
		}, 1000);
	}
	countdown--;
}, 1000);



window.onload = renderCountdown

function renderNavbar() {
	console.log(currentTimeout)
	c.fillStyle = 'rgba(0,0,0,0.5)'
	c.fillRect(0, 0, canvas.width, 50)
	c.fillStyle = 'white'
	c.font = 'bold 25px Arial'
	c.fillText(username, 20, 35)
	c.fillText(`Score: ${score}`, canvas.width / 2.3, 35)
	c.fillText(`Time: ${currentTimeout}`, canvas.width - 200, 35)
}

let gunState = "";

function renderGun() {
    let gunX = canvas.width / 4 + mouseX / 6;
    let gunY = canvas.height / 2 + mouseY / 6;

    if (gunState === "down") {
        frameSwitchGun += 10; 
        gunY += frameSwitchGun;

        if (gunY >= canvas.height) {
            gunState = "switch"; 
            frameSwitchGun = 0; 
        }
    }

    if (gunState === "switch") {
        gunSrc = gunSrc === "gun1.png" ? "gun2.png" : "gun1.png";
        gunImg.src = `/Sprites/${gunSrc}`;
        gunState = "up"; 
    }

    if (gunState === "up") {
        frameSwitchGun += 10;
        gunY = canvas.height - frameSwitchGun;

        if (gunY <= canvas.height / 2 + mouseY / 6) {
            gunState = ""; 
            frameSwitchGun = 0;
        }
    }
    c.drawImage(gunImg, gunX, gunY);
}

function changeGun() {
    if (!gunState) {
        gunState = "down";
        frameSwitchGun = 0;
    }
}

function newTarget() {
	if (!isPlay) return
	if (targets.length === targetsPos.length) return
	let newTargets = targetsPos.filter(target => !targets.includes(target))
	targets.push(newTargets[Math.floor(Math.random() * newTargets.length)])
}

function renderTarget() {
	targets.forEach(target => {
		c.drawImage(targetImg, target.x, target.y)
	});
}

function renderPointer() {
	c.drawImage(pointerImg, mouseX, mouseY, pointerWnh, pointerWnh)
}

function renderEndGame(){}


function animate() {
	frame++
	c.drawImage(bgImg, 0, 0, canvas.width, canvas.height)
	if (frame % (3 * 120) === 0) {
		newTarget()
	}
	renderTarget()
	if (isBoom) {
		c.drawImage(boomImg, offsetX - 86 / 2, offsetY - 80 / 2)
	}
	renderPointer()
	renderGun()
	renderNavbar()
	requestAnimationFrame(animate)
}
animate()