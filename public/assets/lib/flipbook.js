document.addEventListener('DOMContentLoaded', () => {
    const body = document.getElementsByTagName('body')[0];
    const book = document.getElementById('flipbook');
    // const playBtn = document.getElementById('playBtn');

    // Audio Setup
    const bgMsc = new Audio(`https://digtalpahchan.in/assets/music/Jashn-E-Bahaara - Instrumental - Jodhaa Akbar.mp3`);
    bgMsc.loop = true;
    
    const turnAudio = new Audio('/assets/music/pageflip.mp3');
    turnAudio.loop = false;
    
    // const intrucAudio = new Audio('https://flipix.in/assets/music/Welcome Music.mp3');
    // intrucAudio.loop = false;
    
    // const welcomeImg = document.querySelector(".welcome");
    // if (welcomeImg){
    //     welcomeImg.addEventListener('click', function() {
    //         if (intrucAudio.paused) {
    //             intrucAudio.play();
    //         }
    //     });
    // }

    playBtn.addEventListener('click', function() {
        if (bgMsc.paused) {
            bgMsc.play();
            playBtn.innerHTML = '<img src="/assets/images/pause.svg" class="share">';
        } else {
            bgMsc.pause();
            playBtn.innerHTML = '<img src="/assets/images/play.svg" class="share">';
        }
    });
    
    
    
    // Other setting like ratio, etc
    let firstHalf = 0;
    
    if (numPages % 2 !== 0) { // If the number is odd
        firstHalf = Math.floor(numPages / 2) + 1;
    } else { // If the number is even
        firstHalf = Math.floor(numPages / 2);
    }

    book.style.aspectRatio = pageRatio;
    if (pageOrientation === 'portrait') {
        book.classList.add('portrait');
    }
    // body.style.background = `center / cover url(../assets/images/BGI/${bgImg})`;




    // Function to create a page
    function createPage(className, frontImgSrc, backImgSrc, id, count, reverseCount) {
        const page = document.createElement('div');
        page.className = `${className} page`;
        if (count > (firstHalf + 1) ){
            page.classList.add('last-half');
        } else {
            page.classList.add('first-half');
        }
        page.id = id;

        const frontPage = document.createElement('div');
        frontPage.className = 'front-page';
        if (frontImgSrc) {
            const frontImg = document.createElement('img');
            frontImg.src = `${frontImgSrc}`;
            frontPage.appendChild(frontImg);
            // const fileName = frontImgSrc.replace(/\.[^/.]+$/, ""); // remove extension
            // if (fileName.length <= 6) {
            //     const frontLabel = document.createElement('label');
            //     frontLabel.textContent = fileName + 'b';
            //     frontPage.appendChild(frontLabel);
            // } else {
            //     console.log(fileName);
            // }
        } else {
            frontPage.classList.add('blank');
        }

        const backPage = document.createElement('div');
        backPage.className = 'back-page';
        if (backImgSrc) {
            const backImg = document.createElement('img');
            backImg.src = `${backImgSrc}`;
            backPage.appendChild(backImg);
            // const fileName = backImgSrc.replace(/\.[^/.]+$/, ""); // remove extension
            // if (fileName.length <= 6) {
            //     const backLabel = document.createElement('label');
            //     backLabel.textContent = fileName + 'a';
            //     backPage.appendChild(backLabel);
            // } else {
            //     console.log(fileName);
            // }
        } else {
            backPage.classList.add('blank');
        }

        page.appendChild(frontPage);
        page.appendChild(backPage);

        page.addEventListener('click', handlePageClick);
        
        // Add the custom properties for count and reverse-count
        page.style.setProperty('--count', count);
        page.style.setProperty('--reverse-count', reverseCount);
        
        return page;
    }

    // Create front cover
    const frontCover = createPage('front-cover', frontCoverImg, '', 'frontCover', 1, numPages + 2);
    book.appendChild(frontCover);

    // Create pages dynamically
    for (let i = 0; i < 3; i++) {
        const pageId = `page${i + 1}`;
        const frontPageImgSrc = isCropped ? sheets[2 * i] : sheets[i];
        const backPageImgSrc = isCropped ? sheets[2 * i + 1] : sheets[i + 1];

        const page = createPage('inner', frontPageImgSrc, backPageImgSrc, pageId, i + 2, numPages + 1 - i);
        book.appendChild(page);
    }

    // Create back cover
    const backCover = createPage('back-cover', '', backCoverImg, 'backCover', numPages + 2, 1);
    book.appendChild(backCover);










    // handle click events

    function handlePageClick(event) {
        const clickedPage = event.currentTarget;
        const pageIndex = parseInt(clickedPage.id.replace('page', ''));

        clickedPage.classList.toggle('turn');
        turnAudio.play();

        if (clickedPage.classList.contains('turn')) {
            // Go Forward
            setTimeout(() => {
                if ((pageIndex + 3) <= numPages) {
                    const pageId = `page${pageIndex + 3}`;
                    const frontPageImgSrc = isCropped ? sheets[2 * pageIndex + 2 + 2] : sheets[pageIndex + 2];
                    const backPageImgSrc = isCropped ? sheets[2 * pageIndex + 3 + 2] : sheets[pageIndex + 3];
                    const count = pageIndex + 4;
                    const reverseCount = numPages - pageIndex - 1;
    
                    const page = createPage('inner', frontPageImgSrc, backPageImgSrc, pageId, count, reverseCount);
                    book.appendChild(page);
                }
                if ((pageIndex - 3) > 0) {
                    document.getElementById(`page${pageIndex - 3}`).remove();
                }
            }, 300); // Adjust the timeout as necessary
        } else {
            // Go Backward
            setTimeout(() => {
                if ((pageIndex + 3) <= numPages) {
                    document.getElementById(`page${pageIndex + 3}`).remove();
                }
                if ((pageIndex - 3) > 0) {
                    const pageId = `page${pageIndex - 3}`;
                    const frontPageImgSrc = isCropped ? sheets[2 * pageIndex - 4 - 4] : sheets[pageIndex - 4];
                    const backPageImgSrc = isCropped ? sheets[2 * pageIndex - 3 - 4] : sheets[pageIndex - 3];
                    const count = pageIndex - 2;
                    const reverseCount = numPages + 5 - pageIndex;
    
                    const page = createPage('inner turn', frontPageImgSrc, backPageImgSrc, pageId, count, reverseCount);
                    book.appendChild(page);
                }
            }, 300); // Adjust the timeout as necessary
        }
    }



    document.head.innerHTML += `
        <style>
            #page${numPages} img {
                left: unset;
                right: 0;
            }
        </style>
    `;





    // opening and closing album
    var notOpened = true;
    function openBook(){
        book.classList.toggle('open');
        if(notOpened && bgMsc.paused){
            bgMsc.play();
            playBtn.innerHTML = '<img src="/assets/images/pause.svg" class="share">';
        }
        notOpened = false;
    }

    document.getElementById('frontCover').addEventListener('click', openBook);
    document.getElementById('backCover').addEventListener('click', () => {
        book.classList.toggle('close');
    });
    



    // Full screen toggle
    var landscapeLocked = false;
    function toggleFullScreen(element) {
        function requestFullScreen() {
            if (element.requestFullscreen) {
                return element.requestFullscreen();
            } else if (element.mozRequestFullScreen) { // Firefox
                return element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) { // Chrome, Safari, and Opera
                return element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) { // IE/Edge
                return element.msRequestFullscreen();
            }
        }
    
        function lockOrientation() {
            if (screen.orientation && screen.orientation.lock && window.innerWidth <= 768) {
                return screen.orientation.lock('landscape').catch(function(error) {
                    alert("Failed to lock orientation:", error);
                });
            }
        }
    
        function exitFullScreen() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { // Chrome, Safari, and Opera
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE/Edge
                document.msExitFullscreen();
            }
        }
    
        if (!document.fullscreenElement) {
            requestFullScreen().then(() => {
                if (!landscapeLocked) {
                    return lockOrientation();
                    landscapeLocked = true;
                }
            }).catch(err => {
                alert("Error attempting to enable full-screen mode:", err);
            });
            document.getElementById("fullScreenButton").innerHTML = '<img src="/assets/images/exit-fullscreen.svg" class="share">';
        } else {
            exitFullScreen();
            document.getElementById("fullScreenButton").innerHTML = '<img src="/assets/images/fullscreen.svg" class="share">';
        }
    }
    
    
    
    // Touch event to show lock message only when full-screen & landscape lock is active
    document.addEventListener("touchstart", function (e) {
        if (e.touches.length > 1) {
            if (document.getElementById("fullScreenButton").innerHTML == '<img src="/assets/images/exit-fullscreen.svg" class="share">') {
                document.querySelector('.lock-msg').style.opacity = "0.5";
                setTimeout(function () {
                    document.querySelector('.lock-msg').style.opacity = "0";
                }, 3000);
            }
        }
    });



    document.getElementById("fullScreenButton").addEventListener("click", function() {
        toggleFullScreen(body);
    });
    
    // If window width < 550 and orientation is portrait,
    // Create overlay and add event listener click to toggleFullScreen
    function problematicFunction() {
        if (window.innerWidth < 550) {
            console.log('hello');
            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            document.body.appendChild(overlay);
            overlay.addEventListener('click', function() {
                toggleFullScreen(body);
                setTimeout(() => {
                    overlay.remove();
                }, 1000);
            });
        } 
    }
    
    function isIOS() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
      }
      
      if (isIOS()) {
        console.log("This is an iOS device");
        // iOS-specific logic here
      } else {
        console.log("This is a non iOS divice");
        problematicFunction();
      }
    

    // Popup
    
    // Get all open buttons
    const openButtons = document.querySelectorAll('.open-popup');
    openButtons.forEach(button => {
        button.addEventListener('click', function() {
            const popupId = this.getAttribute('data-popup');
            document.getElementById(popupId).style.display = 'flex';
        });
    });

    // Get all close buttons
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const popupId = this.getAttribute('data-popup');
            document.getElementById(popupId).style.display = 'none';
        });
    });

    // Close the popup when clicking outside of the popup content
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('popup')) {
            event.target.style.display = 'none';
        }
    });
    
    
    
    // On window unload, User leave the page, stop music
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            if (!bgMsc.paused) {
                bgMsc.pause();
            }
        }
    });

    const whatsappLink = document.getElementById('whatsapp-link');
    if (whatsappLink) {
        const phone = whatsappLink.textContent.replace(/\D/g, '');
        const currentUrl = window.top.location.href;
        const message = `Hi,\nI liked your flipbook ${currentUrl}`;
        const encodedMessage = encodeURIComponent(message);
        whatsappLink.href = `https://wa.me/${phone}?text=${encodedMessage}`;
    }
    
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const currentUrl = window.top.location.href;
            const message = `Hi,\nHere is my flipbook: ${currentUrl}`;
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

            window.open(whatsappUrl, '_blank');
        });
    }
});