let imgCount = 0
const cloudUrl = 'https://djjjk9bjm164h.cloudfront.net/'
// const data = [
//   {img: `${cloudUrl}tender01.jpg`, name: 'Korean Fried', price: '20', distance: '2'},
//   {img: `${cloudUrl}tender02.jpg`, name: 'Grilled', price: '23', distance: '5'},
//   {img: `${cloudUrl}tender03.jpg`, name: 'Fried', price: '25', distance: '11'},
//   {img: `${cloudUrl}tender04.jpg`, name: 'Deep Fried', price: '23', distance: '6'}
// ]
const savedData = [];

async function fetchData() {
    try {
        const response = await fetch('/get_tasks');
        const data = await response.json();

        console.log(data);
        data.forEach(task => {
            const taskData = {
                img: `${cloudUrl}tender01.jpg`,
                id: task.id,
                taskName: task.task_name,
                duration: task.duration_minutes,
                category: task.category,
                priority: task.priority,
                taskDone: task.task_done,
                startTime: new Date().getTime(),
                timeWorked: "00:00",
                timerInterval: null
            };

            // generateRow(taskData);
            savedData.push(taskData);

        });
        savedData.forEach(_data => appendCard(_data));
        myFunction();
    } catch (error) {
        console.error('Error:', error);
    }
}
let current;
let likeText;
let startX;

fetchData();
const frame = document.body.querySelector('.frame');

function myFunction() {


    current = frame.querySelector('.card:last-child')
    likeText = current.children[0]
    startX = 0, startY = 0, moveX = 0, moveY = 0
    initCard(current)

    // Rest of your code...
}

document.querySelector('#like').onclick = () => {
    moveX = 1
    moveY = 0
    complete()
}
document.querySelector('#hate').onclick = () => {
    moveX = -1
    moveY = 0
    complete()
}

function appendCard(data) {
    console.log("creating card");
    const firstCard = frame.children[0]
    const newCard = document.createElement('div')
    newCard.className = 'card'
    // newCard.style.backgroundImage = `url(${data.img})`
    newCard.innerHTML = `
<div class="card" style="width: 100%; ">
<div class="card-header">
<h5 class="card-title"><span>${data.taskName}</span></h5>
</div>
<img src="${data.img}" class="card-img-top" style="max-height: 200px;" alt="...">
    <div class="card-body">
       
        // <div class="is-like">LIKE</div>
        <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's
            content.</p>
        <div class="class-text">


                <span><b>$</b>${data.priority}</span>

            <div class="info">
                ${data.duration} miles away
            </div>
        </div>
    </div>
</div>

        `
    if (firstCard) frame.insertBefore(newCard, firstCard)
    else frame.appendChild(newCard)
    imgCount++
}

function initCard(card) {
    card.addEventListener('pointerdown', onPointerDown)
}

function setTransform(x, y, deg, duration) {
    current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${deg}deg)`
    likeText.style.opacity = Math.abs((x / innerWidth * 2.1))
    likeText.className = `is-like ${x > 0 ? 'like' : 'nope'}`
    if (duration) current.style.transition = `transform ${duration}ms`
}

function onPointerDown({ clientX, clientY }) {
    startX = clientX
    startY = clientY
    current.addEventListener('pointermove', onPointerMove)
    current.addEventListener('pointerup', onPointerUp)
    current.addEventListener('pointerleave', onPointerUp)
}

function onPointerMove({ clientX, clientY }) {
    moveX = clientX - startX
    moveY = clientY - startY
    setTransform(moveX, moveY, moveX / innerWidth * 50)
}

function onPointerUp() {
    current.removeEventListener('pointermove', onPointerMove)
    current.removeEventListener('pointerup', onPointerUp)
    current.removeEventListener('pointerleave', onPointerUp)
    if (Math.abs(moveX) > frame.clientWidth / 2) {
        current.removeEventListener('pointerdown', onPointerDown)
        complete()
    } else cancel()
}

function complete() {
    const flyX = (Math.abs(moveX) / moveX) * innerWidth * 1.3
    const flyY = (moveY / moveX) * flyX
    setTransform(flyX, flyY, flyX / innerWidth * 50, innerWidth)

    const prev = current
    const next = current.previousElementSibling
    if (next) initCard(next)
    current = next
    likeText = current.children[0]
    appendCard(data[imgCount % 4])
    setTimeout(() => frame.removeChild(prev), innerWidth)
}

function cancel() {
    setTransform(0, 0, 0, 100)
    setTimeout(() => current.style.transition = '', 100)
}