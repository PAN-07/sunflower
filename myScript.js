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

const bgMusic = document.getElementById("angleBaby");
const musicBtn = document.getElementById("musicBtn");

document.addEventListener("click", () => {
    if(bgMusic.paused){

        bgMusic.volume = 0;
        bgMusic.play().catch(()=>{});

        let vol = 0;
        const fade = setInterval(()=>{
            vol += 0.05;
            bgMusic.volume = vol;

            if(vol >= 0.4){
                bgMusic.volume = 0.4;
                clearInterval(fade);
            }
        },200);

    }
}, { once: true });

if(musicBtn && bgMusic){

    musicBtn.addEventListener("click", () => {
        if(bgMusic.paused){
            bgMusic.play();
            musicBtn.textContent = "🔊 Music";
        } else {
            bgMusic.pause();
            musicBtn.textContent = "🔇 Muted";
        }
    });

}

function getFormattedDate(){
    const d = new Date();

    const day = String(d.getDate()).padStart(2,'0');
    const month = String(d.getMonth()+1).padStart(2,'0');
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2,'0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
}

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

    ctx.filter = currentFilter;
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

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
    dateEl.textContent = getFormattedDate();

    const printBtn = document.createElement('button');
    printBtn.textContent = 'Print';
    printBtn.style.marginTop='5px';
    printBtn.style.borderRadius='6px';
    printBtn.style.border='none';
    printBtn.style.padding='5px 10px';
    printBtn.style.cursor='pointer';
    printBtn.addEventListener('click', ()=>{

    const image = new Image();
    image.src = img.src;

    image.onload = ()=>{

        const sideBorder = 20;
        const topBorder = 20;
        const bottomBorder = 70;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = image.width + sideBorder*2;
        canvas.height = image.height + topBorder + bottomBorder;

        // white polaroid background
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        // draw photo
        ctx.drawImage(image, sideBorder, topBorder, image.width, image.height);

        // draw date at bottom
        ctx.fillStyle = "black";
        ctx.font = "16px Comic Sans MS";
        ctx.textAlign = "center";
        ctx.fillText(dateEl.textContent, canvas.width/2, canvas.height-25);

        const link = document.createElement("a");
        link.download = "photobooth-polaroid.png";
        link.href = canvas.toDataURL("image/png");
        link.click();

    }

});

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
            bottomDate.textContent = getFormattedDate();

            const bottomPrint = document.createElement('button');
            bottomPrint.textContent = 'Print';
            bottomPrint.style.marginTop='5px';
            bottomPrint.style.borderRadius='6px';
            bottomPrint.style.border='none';
            bottomPrint.style.padding='5px 10px';
            bottomPrint.style.cursor='pointer';

            bottomPrint.addEventListener('click', ()=>{

                const allStripPhotos = stripContainer.querySelectorAll('.photo-strip-style');

                const width = 300;
                const sideBorder = 12;
                const topBorder = 12;
                const divider = 8;

                const firstImg = allStripPhotos[0].querySelector('img');
                const ratio = firstImg.naturalHeight / firstImg.naturalWidth;
                const imgHeight = width * ratio;

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                canvas.width = width + sideBorder*2;
                canvas.height = topBorder + (imgHeight * allStripPhotos.length) + (divider * (allStripPhotos.length-1)) + 30;

                ctx.fillStyle = "white";
                ctx.fillRect(0,0,canvas.width,canvas.height);

                let y = topBorder;

                const images = [];

                for(let i = allStripPhotos.length - 1; i >= 0; i--){
                    const imgEl = allStripPhotos[i].querySelector('img');
                    const im = new Image();
                    im.src = imgEl.src;
                    images.push(im);
                }

                let loaded = 0;

                images.forEach((im)=>{
                    im.onload = ()=>{
                        const h = width * (im.height / im.width);
                        ctx.drawImage(im,sideBorder,y,width,h);
                        y += h + divider;
                        loaded++;

                        if(loaded === images.length){

                            ctx.fillStyle="black";
                            ctx.font="14px Comic Sans MS";
                            ctx.textAlign="center";
                            ctx.fillText(bottomDate.textContent, canvas.width/2, canvas.height-10);

                            const link = document.createElement("a");
                            link.download="photobooth-strip.png";
                            link.href = canvas.toDataURL("image/png");
                            link.click();
                        }
                    }
                });

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

    complimentBox.classList.add("compliment-animate");

    setTimeout(()=>{
        const randomIndex = Math.floor(Math.random() * compliments.length);
        complimentBox.textContent = compliments[randomIndex];
        complimentBox.classList.remove("compliment-animate");
    },400);
}

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
