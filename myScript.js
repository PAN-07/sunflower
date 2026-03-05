const complimentBox = document.getElementById("complimentBox");

const compliments = [
    "I can't be too nice also ryt? 🥰",
    "WOAHH chill out, the photobooth might break 👩",
    "DID YOU JUST WOKE UP 🥴",
    "EWW 🤢",
    "I HOPE THE WEBSITE CRASHES 💥",
    "THAT PIC WAS SOO... ykw leave it. 👅",
    "ITS OKAY BABE, YOU TRIED YOUR BEST 💋",
    "THT FOREHEAD IS EXTRA SHINY TODAY 🌟",
    "DAMN tht pic soo WORTHLESS 😔",
    "FAHHHHHHHH 🗣️"
];

const flash = document.getElementById("flash");
const shutterSound = document.getElementById("shutterSound");

// Webcam access
const video = document.getElementById('video');
navigator.mediaDevices.getUserMedia({video:true})
.then(stream => video.srcObject = stream)
.catch(()=> alert("Camera access denied!"));

// Apply filters
let currentFilter = "none";

const filterButtons = document.querySelectorAll('.filter-buttons button');
filterButtons.forEach(btn => {
    btn.addEventListener('click', ()=>{
        currentFilter = btn.dataset.filter;
        video.style.filter = currentFilter;
    });
});

// Layout toggle
let currentLayout = 'polaroid';
const layoutBtn = document.getElementById('layoutBtn');
layoutBtn.addEventListener('click', ()=>{
    if(currentLayout==='polaroid'){
        currentLayout='strip';
        layoutBtn.textContent='Switch to Polaroid Layout';
    } else {
        currentLayout='polaroid';
        layoutBtn.textContent='Switch to Strip Layout';
    }
});

// Countdown and capture
const countdownEl = document.getElementById('countdown');
const captureBtn = document.getElementById('captureBtn');
const stripContainer = document.getElementById('strip-container');

captureBtn.addEventListener('click', ()=>{
    let count = 3;
    countdownEl.style.display = 'block';
    countdownEl.textContent = count;
    const interval = setInterval(()=>{
        count--;
        if(count>0) countdownEl.textContent = count;
        else{
            clearInterval(interval);
            countdownEl.style.display='none';
            takePhoto();
        }
    },1000);
});

// Spacebar also triggers photo capture
document.addEventListener('keydown', (e)=>{
    if(e.code === 'Space' && !e.repeat){
        e.preventDefault();
        captureBtn.click();
    }
});

// Take photo function
function takePhoto(){

    // Flash effect
    flash.style.opacity = "1";
    shutterSound.currentTime = 0;
    shutterSound.play();

    setTimeout(()=>{
        flash.style.opacity = "0";
    },80);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');

    // Apply filter BEFORE drawing
    ctx.filter = currentFilter;
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    // Create photo container
    const photoDiv = document.createElement('div');
    photoDiv.className='strip-photo';
    
    if(currentLayout==='polaroid'){
        photoDiv.classList.add('polaroid-style');
    } else {
        photoDiv.classList.add('photo-strip-style');
    }

    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    photoDiv.appendChild(img);

    const dateEl = document.createElement('div');
    dateEl.className='photo-date';
    dateEl.textContent = new Date().toLocaleString();

    const printBtn = document.createElement('button');
    printBtn.textContent = 'Print';
    printBtn.style.marginTop='5px';
    printBtn.style.borderRadius='6px';
    printBtn.style.border='none';
    printBtn.style.padding='5px 10px';
    printBtn.style.cursor='pointer';
    printBtn.addEventListener('click', ()=>{
        const w = window.open('');
        w.document.write(`<img src="${img.src}"><p>${dateEl.textContent}</p>`);
        w.print();
    });

    // Insert new photo at top
    stripContainer.insertBefore(photoDiv, stripContainer.children[1]);

    if(currentLayout === 'polaroid'){
        photoDiv.appendChild(dateEl);
        photoDiv.appendChild(printBtn);
    } else {

        const stripPhotos = stripContainer.querySelectorAll('.photo-strip-style');
        stripPhotos.forEach(photo=>{
            const oldDate = photo.querySelector('.photo-date');
            const oldPrint = photo.querySelector('button');
            if(oldDate) oldDate.remove();
            if(oldPrint) oldPrint.remove();
        });

        const allStripPhotos = stripContainer.querySelectorAll('.photo-strip-style');
        const bottomPhoto = allStripPhotos[allStripPhotos.length - 1];

        if(bottomPhoto){
            const bottomDate = document.createElement('div');
            bottomDate.className='photo-date';
            bottomDate.textContent = new Date().toLocaleString();

            const bottomPrint = document.createElement('button');
            bottomPrint.textContent = 'Print';
            bottomPrint.style.marginTop='5px';
            bottomPrint.style.borderRadius='6px';
            bottomPrint.style.border='none';
            bottomPrint.style.padding='5px 10px';
            bottomPrint.style.cursor='pointer';

            bottomPrint.addEventListener('click', ()=>{
                const w = window.open('');
                const allStripPhotos = stripContainer.querySelectorAll('.photo-strip-style');

                let stripHTML = `
                    <html>
                    <head>
                        <title>Print Strip</title>
                        <style>
                            body{
                                margin:0;
                                display:flex;
                                justify-content:center;
                                background:white;
                                font-family: 'Comic Sans MS', cursive;
                            }
                            .strip{
                                width:300px;
                                border-left:6px solid #fff;
                                border-right:6px solid #fff;
                                border-top:6px solid #fff;
                                border-bottom:6px solid #fff;
                            }
                            .strip img{
                                width:100%;
                                display:block;
                            }
                            .date{
                                text-align:center;
                                padding:8px;
                                font-size:14px;
                            }
                            @media print{
                                body{
                                    margin:0;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="strip">
                `;

                for(let i = allStripPhotos.length - 1; i >= 0; i--){
                    const imgEl = allStripPhotos[i].querySelector('img');
                    stripHTML += `<img src="${imgEl.src}">`;
                }

                stripHTML += `
                            <div class="date">${bottomDate.textContent}</div>
                        </div>
                    </body>
                    </html>
                `;

                w.document.write(stripHTML);
                w.document.close();
                w.print();
            });

            bottomPhoto.appendChild(bottomDate);
            bottomPhoto.appendChild(bottomPrint);
        }
    }

    setTimeout(()=>{
        photoDiv.style.transform='translateY(0) rotate(0deg)';
        photoDiv.style.opacity=1;
    },100);

    createConfetti();

    // Change compliment after each photo
complimentBox.classList.add("compliment-animate");

setTimeout(()=>{
    const randomIndex = Math.floor(Math.random() * compliments.length);
    complimentBox.textContent = compliments[randomIndex];
    complimentBox.classList.remove("compliment-animate");
},400);
}

// Confetti function
function createConfetti(){
    for(let i=0;i<20;i++){
        const conf = document.createElement('div');
        conf.className='confetti-piece';
        conf.style.left=Math.random()*window.innerWidth+'px';
        conf.style.setProperty('--x', (Math.random()*200-100)+'px');
        document.body.appendChild(conf);
        setTimeout(()=> conf.remove(),1200);
    }
}
