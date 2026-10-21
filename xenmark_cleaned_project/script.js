
/* =====================================================
   LOAD ALL MEDIA FROM data.json
   Keep image paths, image rotations, and the hero video poster in one place.
===================================================== */
window.xenmarkMediaData = {};

// Lightweight mobile mode: disable auto-running visual effects on small screens.
// Scroll-reveal and the XENMARK logo loading screen are intentionally preserved.
function xenmarkIsMobilePerfMode() {
    return window.matchMedia("(max-width: 700px)").matches;
}

// Background videos can be costly on phones. Keep their poster/image visible instead.
if (xenmarkIsMobilePerfMode()) {
    document.querySelectorAll("video").forEach(function (video) {
        video.pause();
        video.removeAttribute("autoplay");
        video.setAttribute("preload", "none");
    });
}

window.xenmarkMediaDataPromise = fetch("./data.json")
    .then(function (response) {
        if (!response.ok) {
            throw new Error("Could not load data.json (HTTP " + response.status + ")");
        }
        return response.json();
    })
    .then(function (data) {
        window.xenmarkMediaData = data;

        // Apply the media path for each image or video source.
        document.querySelectorAll("[data-json-src]").forEach(function (element) {
            const mediaKey = element.getAttribute("data-json-src");
            const mediaPath = data[mediaKey];
            if (mediaPath) {
                // Defer off-screen image downloads on all devices, especially phones.
                // Keep the first hero image eager so the opening view stays immediate.
                if (element.tagName && element.tagName.toLowerCase() === "img") {
                    element.setAttribute("decoding", "async");
                    if (mediaKey === "media_1") {
                        element.setAttribute("loading", "eager");
                        element.setAttribute("fetchpriority", "high");
                    } else {
                        element.setAttribute("loading", "lazy");
                    }
                }
                element.setAttribute("src", mediaPath);
            }
        });

        // Use a local image from data.json as the hero video poster.
        document.querySelectorAll("[data-json-poster]").forEach(function (element) {
            const posterKey = element.getAttribute("data-json-poster");
            if (data[posterKey]) {
                element.setAttribute("poster", data[posterKey]);
            }
        });

        // Preserve the subtle grain texture, with its URL controlled by data.json.
        if (data.texture_noise) {
            document.documentElement.style.setProperty(
                "--xenmark-noise-image",
                'url("' + data.texture_noise + '")'
            );
        }

        // Reload video elements after their source paths have been assigned.
        document.querySelectorAll("video").forEach(function (video) {
            if (xenmarkIsMobilePerfMode()) {
                video.pause();
                video.removeAttribute("autoplay");
                video.setAttribute("preload", "none");
                return;
            }

            if (video.querySelector("source[src]")) {
                video.load();
            }
        });

        return data;
    })
    .catch(function (error) {
        console.error("Error loading data.json:", error);
        return {};
    });


/* =====================================================
   LOADER
===================================================== */

window.addEventListener(
    "load",
    function(){

        setTimeout(
            function(){

                document
                .getElementById("loader")
                .classList
                .add("hide");

            },
            1400
        );

    }
);


/* =====================================================
   MOBILE MENU
===================================================== */

const menu =
document.getElementById("menu");


const nav =
document.getElementById("nav");


menu.addEventListener(
    "click",
    function(){

        nav.classList.toggle("show");

    }
);


document
.querySelectorAll("#nav a")
.forEach(
    function(link){

        link.addEventListener(
            "click",
            function(){

                nav.classList.remove("show");

            }
        );

    }
);


/* =====================================================
   SCROLL PROGRESS
===================================================== */

const progress =
document.getElementById("scrollProgress");


window.addEventListener(
    "scroll",
    function(){

        const total =
            document.documentElement.scrollHeight -
            window.innerHeight;


        const percent =
            (window.scrollY / total) * 100;


        progress.style.width =
            percent + "%";

    }
);


/* =====================================================
   CURSOR GLOW
===================================================== */

const glow =
document.getElementById("cursorGlow");


document.addEventListener(
    "mousemove",
    function(e){

        if(window.innerWidth <= 700){

            return;

        }


        glow.style.left =
            e.clientX + "px";


        glow.style.top =
            e.clientY + "px";

    }
);


/* =====================================================
   SCROLL REVEAL
===================================================== */

const revealObserver =
new IntersectionObserver(
    function(entries){

        entries.forEach(
            function(entry){

                if(entry.isIntersecting){

                    entry.target
                    .classList
                    .add("show");


                    revealObserver
                    .unobserve(
                        entry.target
                    );

                }

            }
        );

    },
    {
        threshold:.12
    }
);


document
.querySelectorAll(".reveal")
.forEach(
    function(element){

        revealObserver.observe(element);

    }
);


/* =====================================================
   HERO SLOGANS
===================================================== */

const heroSlogans = [

    "MAKE YOUR SIGNAL",
    "WEAR YOUR VISION",
    "BUILD YOUR IDENTITY",
    "CREATE WHAT YOU SEE",
    "DON'T FOLLOW THE STANDARD",
    "MAKE IT COMPLETELY YOURS"

];


let heroIndex = 0;


if (!xenmarkIsMobilePerfMode()) setInterval(
    function(){

        const element =
            document.getElementById("heroSlogan");


        heroIndex++;


        if(heroIndex >= heroSlogans.length){

            heroIndex = 0;

        }


        element.style.opacity =
            "0";


        setTimeout(
            function(){

                element.innerHTML =

                    `<div class="hero-slogan-inner">
                        ${heroSlogans[heroIndex]}
                    </div>`;


                element.style.opacity =
                    "1";

            },
            250
        );


    },
    3000
);


/* =====================================================
   SECTION SLOGANS
===================================================== */

document
.querySelectorAll(".dynamic-slogan")
.forEach(
    function(element){

        const slogans =

            element
            .dataset
            .slogans
            .split("|")
            .map(
                function(item){

                    return item.trim();

                }
            );


        let index = 0;

        if (xenmarkIsMobilePerfMode()) {
            return;
        }

        setInterval(
            function(){

                index++;


                if(index >= slogans.length){

                    index = 0;

                }


                element.style.opacity =
                    "0";


                setTimeout(
                    function(){

                        element.textContent =
                            slogans[index];


                        element.style.animation =
                            "none";


                        void element.offsetWidth;


                        element.style.animation =
                            "sloganIn .6s both";


                    },
                    250
                );


            },
            3000
        );

    }
);


/* =====================================================
   AUTO IMAGE CHANGE EVERY 3 SECONDS
   The rotating image paths are stored in data.json under _image_sets.
===================================================== */
window.xenmarkMediaDataPromise.then(function (data) {
    document.querySelectorAll(".auto-image[data-json-set]").forEach(function (image) {
        const setKey = image.getAttribute("data-json-set");
        const images = data._image_sets && data._image_sets[setKey];

        if (!Array.isArray(images) || images.length < 2 || xenmarkIsMobilePerfMode()) {
            return;
        }

        let index = 0;
        window.setInterval(function () {
            index = (index + 1) % images.length;
            image.style.opacity = "0";

            window.setTimeout(function () {
                image.src = images[index];
                image.style.opacity = "1";
            }, 250);
        }, 3000);
    });
});


/* =====================================================
   BANNER
===================================================== */

const bannerSlides =
document.querySelectorAll(".banner-slide");


const bannerDots =
document.querySelectorAll(".banner-dot");


let bannerIndex = 0;


function changeBanner(index){

    bannerIndex = index;


    bannerSlides.forEach(
        function(slide){

            slide.classList.remove("active");

        }
    );


    bannerDots.forEach(
        function(dot){

            dot.classList.remove("active");

        }
    );


    bannerSlides[index]
        .classList
        .add("active");


    bannerDots[index]
        .classList
        .add("active");

}


if (!xenmarkIsMobilePerfMode()) setInterval(
    function(){

        bannerIndex++;


        if(bannerIndex >= bannerSlides.length){

            bannerIndex = 0;

        }


        changeBanner(bannerIndex);

    },
    5000
);


/* =====================================================
   CRAZY DROP
===================================================== */

const crazyStage =
document.getElementById("crazyStage");


if(crazyStage){

    const crazyObserver =

        new IntersectionObserver(
            function(entries){

                entries.forEach(
                    function(entry){

                        if(entry.isIntersecting){

                            crazyStage
                            .classList
                            .add("active");


                            crazyObserver
                            .unobserve(
                                crazyStage
                            );

                        }

                    }
                );

            },
            {
                threshold:.18
            }
        );


    crazyObserver.observe(crazyStage);

}


/* =====================================================
   CUSTOMIZER
===================================================== */

document
.querySelectorAll(".options")
.forEach(
    function(group){

        const buttons =
            group.querySelectorAll(".option");


        buttons.forEach(
            function(button){

                button.addEventListener(
                    "click",
                    function(){

                        buttons.forEach(
                            function(item){

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                        button.classList.add(
                            "active"
                        );

                    }
                );

            }
        );

    }
);


/* =====================================================
   FAQ
===================================================== */

document
.querySelectorAll(".faq-question")
.forEach(
    function(button){

        button.addEventListener(
            "click",
            function(){

                const item =
                    button.parentElement;


                document
                .querySelectorAll(".faq-item")
                .forEach(
                    function(other){

                        if(other !== item){

                            other.classList.remove(
                                "active"
                            );

                        }

                    }
                );


                item.classList.toggle(
                    "active"
                );

            }
        );

    }
);


/* =====================================================
   CONTACT
===================================================== */

function openContact(){

    document
    .getElementById("contactPopup")
    .classList
    .add("show");

}


function closeContact(){

    document
    .getElementById("contactPopup")
    .classList
    .remove("show");

}


document
.getElementById("contactPopup")
.addEventListener(
    "click",
    function(e){

        if(e.target === this){

            closeContact();

        }

    }
);


document.addEventListener(
    "keydown",
    function(e){

        if(e.key === "Escape"){

            closeContact();

        }

    }
);


/* =====================================================
   WHATSAPP FORM
===================================================== */

document
.getElementById("quoteForm")
.addEventListener(
    "submit",
    function(e){

        e.preventDefault();

        const name =
            document.getElementById("name").value;

        const email =
            document.getElementById("email").value;

        const phone =
            document.getElementById("phone").value;

        const product =
            document.getElementById("product").value;

        const type =
            document.getElementById("type").value;

        const message =
            document.getElementById("message").value;

        const text =
`XENMARK ENQUIRY

Name: ${name}
Email: ${email}
Phone: ${phone}
Product: ${product}
Customization: ${type}

Tell us about design:
${message}`;

        const whatsappURL =
            "https://wa.me/919876543210?text=" +
            encodeURIComponent(text);

        window.open(
            whatsappURL,
            "_blank"
        );

    }
);

/* =====================================================
   TOP BUTTON
===================================================== */

const topBtn =
document.getElementById("topBtn");


window.addEventListener(
    "scroll",
    function(){

        if(window.scrollY > 600){

            topBtn.classList.add("show");

        }else{

            topBtn.classList.remove("show");

        }

    }
);


topBtn.addEventListener(
    "click",
    function(){

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    }
);


/* =====================================================
   YEAR
===================================================== */

document
.getElementById("year")
.innerText =
new Date().getFullYear();


/* =====================================================
   WEAPON SELECTION
===================================================== */

(function(){

    const choices =
        document.querySelectorAll(
            ".arsenal-choice"
        );

    const image =
        document.getElementById(
            "arsenalImage"
        );

    const number =
        document.getElementById(
            "arsenalNumber"
        );

    const meta =
        document.getElementById(
            "arsenalMeta"
        );

    const title =
        document.getElementById(
            "arsenalTitle"
        );

    const description =
        document.getElementById(
            "arsenalText"
        );

    const product =
        document.querySelector(
            ".arsenal-product"
        );

    if(
        !choices.length ||
        !image ||
        !product
    ){
        return;
    }


    const products = [

        {
            number:"01",
            meta:"CORE DROP / 001",
            title:"OVERSIZED TEE",
            text:
                "Heavy visual presence with a clean custom finish.",
            image:
                "media_2"
        },

        {
            number:"02",
            meta:"HEAVY WEIGHT / 002",
            title:"CYBER HOODIE",
            text:
                "A bold streetwear silhouette built for custom graphics.",
            image:
                "media_3"
        },

        {
            number:"03",
            meta:"ACCESSORY / 003",
            title:"STREET CAP",
            text:
                "Minimal profile with maximum identity.",
            image:
                "media_6"
        },

        {
            number:"04",
            meta:"CUSTOM SPORT / 004",
            title:"TEAM JERSEY",
            text:
                "Custom sportswear engineered for teams and events.",
            image:
                "media_4"
        },

        {
            number:"05",
            meta:"LIMITED / 005",
            title:"PRINTED HOODIE",
            text:
                "Statement graphics with a premium finish.",
            image:
                "media_5"
        }

    ];


    function activateProduct(index){

        const item =
            products[index];

        choices.forEach(
            function(button,i){

                button.classList.toggle(
                    "active",
                    i === index
                );

            }
        );


        product.classList.remove(
            "active"
        );

        image.style.opacity = "0";

        image.style.transform =
            "scale(.88) translateY(25px)";


        setTimeout(
            function(){
                // Wait for data.json so a quick click never misses its local image path.
                window.xenmarkMediaDataPromise.then(function(data){
                    const imagePath = data[item.image];
                    if (imagePath) {
                        image.src = imagePath;
                    }

                    number.textContent = item.number;
                    meta.textContent = item.meta;
                    title.textContent = item.title;
                    description.textContent = item.text;

                    product.classList.add("active");
                    image.style.opacity = "1";
                    image.style.transform = "scale(1) translateY(0)";
                });
            },
            180
        );

    }


    choices.forEach(
        function(button,index){

            button.addEventListener(
                "click",
                function(){

                    activateProduct(
                        index
                    );

                }
            );

        }
    );


    let started = false;

    const section =
        document.getElementById(
            "arsenal"
        );


    if(section){

        const observer =
            new IntersectionObserver(
                function(entries){

                    entries.forEach(
                        function(entry){

                            if(
                                entry.isIntersecting &&
                                !started
                            ){

                                started = true;

                                if (xenmarkIsMobilePerfMode()) {
                                    return;
                                }

                                let index = 0;


                                const timer =
                                    setInterval(
                                        function(){

                                            index++;


                                            if(
                                                index >=
                                                products.length
                                            ){

                                                clearInterval(
                                                    timer
                                                );

                                                return;
                                            }


                                            activateProduct(
                                                index
                                            );

                                        },
                                        1600
                                    );

                            }

                        }
                    );

                },
                {
                    threshold:.3
                }
            );


        observer.observe(
            section
        );

    }

})();


/* =====================================================
   CUSTOMIZER IMAGE SELECTION
===================================================== */

(function(){

    const preview =
        document.getElementById("customizerPreview");

    const options =
        document.querySelectorAll(".customizer .option");

    if(!preview || !options.length){
        return;
    }

    // Image selections are managed in data.json under _customizer_images.
    function showImage(mediaKey, data){
        const url = data && data[mediaKey];
        if (!url) {
            return;
        }

        preview.style.opacity = "0";
        preview.style.transform = "scale(.94)";

        setTimeout(function(){
            preview.src = url;
            preview.style.opacity = "1";
            preview.style.transform = "scale(1)";
        },180);
    }

    options.forEach(function(button){

        button.addEventListener("click",function(){

            const value =
                button.textContent
                .trim()
                .toUpperCase();

            const group =
                button.parentElement;

            group
            .querySelectorAll(".option")
            .forEach(function(item){
                item.classList.remove("active");
            });

            button.classList.add("active");

            window.xenmarkMediaDataPromise.then(function(data){
                const imageConfig = data._customizer_images || {};
                const apparelKey = imageConfig.apparel && imageConfig.apparel[value];
                const treatmentKey = imageConfig.treatment && imageConfig.treatment[value];

                if (apparelKey) {
                    showImage(apparelKey, data);
                }

                if (treatmentKey) {
                    showImage(treatmentKey, data);
                }
            });

        });

    });

    document
    .querySelectorAll("[data-nav-treatment]")
    .forEach(function(link){

        link.addEventListener("click",function(){

            const wanted =
                link.dataset.navTreatment;

            options.forEach(function(button){

                if(
                    button.textContent
                    .trim()
                    .toUpperCase() === wanted
                ){
                    button.click();
                }

            });

        });

    });

})();


/* =====================================================
   LIMITED DROP COUNTDOWN
===================================================== */

(function(){

    const days =
        document.getElementById(
            "limitedDays"
        );

    const hours =
        document.getElementById(
            "limitedHours"
        );

    const minutes =
        document.getElementById(
            "limitedMinutes"
        );

    const seconds =
        document.getElementById(
            "limitedSeconds"
        );


    if(
        !days ||
        !hours ||
        !minutes ||
        !seconds
    ){
        return;
    }


    /*
       CHANGE THIS DATE TO YOUR ACTUAL DROP DATE.
    */

    const dropDate =
        new Date(
            "2026-12-31T23:59:59"
        ).getTime();


    function updateLimitedDrop(){

        const now =
            new Date().getTime();

        let distance =
            dropDate - now;


        if(
            distance < 0
        ){

            distance = 0;

        }


        const dayValue =
            Math.floor(
                distance /
                (1000 * 60 * 60 * 24)
            );


        const hourValue =
            Math.floor(
                (
                    distance %
                    (1000 * 60 * 60 * 24)
                )
                /
                (1000 * 60 * 60)
            );


        const minuteValue =
            Math.floor(
                (
                    distance %
                    (1000 * 60 * 60)
                )
                /
                (1000 * 60)
            );


        const secondValue =
            Math.floor(
                (
                    distance %
                    (1000 * 60)
                )
                /
                1000
            );


        days.textContent =
            String(
                dayValue
            ).padStart(
                2,
                "0"
            );


        hours.textContent =
            String(
                hourValue
            ).padStart(
                2,
                "0"
            );


        minutes.textContent =
            String(
                minuteValue
            ).padStart(
                2,
                "0"
            );


        seconds.textContent =
            String(
                secondValue
            ).padStart(
                2,
                "0"
            );

    }


    updateLimitedDrop();

    setInterval(
        updateLimitedDrop,
        1000
    );

})();


/* =====================================================
   CRAZY CYBERPUNK BANNER — AUTO CHANGE EVERY 3 SECONDS
===================================================== */

(function(){

    const slides = document.querySelectorAll('.crazy-banner-slide');
    const dots = document.querySelectorAll('.crazy-banner-dot');

    if(!slides.length){
        return;
    }

    let crazyBannerIndex = 0;
    let crazyBannerTimer = null;
    let changing = false;

    function changeCrazyBanner(index){

        if(changing || index === crazyBannerIndex){
            return;
        }

        changing = true;

        const current = slides[crazyBannerIndex];
        const next = slides[index];

        if(current){
            current.classList.add('cyber-exit');
            current.classList.remove('active');
        }

        /* Tiny delay makes the cyberpunk wipe/glitch feel cleaner. */
        window.setTimeout(function(){

            slides.forEach(function(slide){
                slide.classList.remove('active');
            });

            dots.forEach(function(dot){
                dot.classList.remove('active');
            });

            slides.forEach(function(slide){
                slide.classList.remove('cyber-exit');
            });

            next.classList.add('active');

            if(dots[index]){
                dots[index].classList.add('active');
            }

            crazyBannerIndex = index;
            changing = false;

        },180);
    }

    function nextCrazyBanner(){
        const nextIndex = (crazyBannerIndex + 1) % slides.length;
        changeCrazyBanner(nextIndex);
    }

    function restartCrazyBannerTimer(){
        window.clearInterval(crazyBannerTimer);
        crazyBannerTimer = null;
        if (!xenmarkIsMobilePerfMode()) {
            crazyBannerTimer = window.setInterval(nextCrazyBanner,3000);
        }
    }

    dots.forEach(function(dot){

        dot.addEventListener('click',function(){

            const index = Number(dot.dataset.crazyBanner);

            if(Number.isInteger(index) && index >= 0 && index < slides.length){
                changeCrazyBanner(index);
                restartCrazyBannerTimer();
            }

        });

    });

    /* Pause on hover so the image/text can be read, then continue automatically. */
    const banner = document.querySelector('#crazy-banner .crazy-banner-wrap');

    if(banner){
        banner.addEventListener('mouseenter',function(){
            window.clearInterval(crazyBannerTimer);
        });

        banner.addEventListener('mouseleave',function(){
            restartCrazyBannerTimer();
        });
    }

    restartCrazyBannerTimer();

})();



/* =====================================================
   ENHANCED XENMARK EXPERIENCE JS
===================================================== */

/* Scroll reveal for the new premium sections + selected major blocks. */
(function(){
    const items = document.querySelectorAll(
        '.scroll-reveal, .visual-section, .section-head, #collection .banner, .crazy-stage'
    );

    if(!items.length){
        return;
    }

    items.forEach(function(item){
        item.classList.add('scroll-reveal');
    });

    const observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
            if(entry.isIntersecting){
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    },{threshold:.12});

    items.forEach(function(item){
        observer.observe(item);
    });
})();

/* Animated words inside ENTER THE CRAZY. */
(function(){
    const element = document.querySelector('.crazy-live-word');

    if(!element){
        return;
    }

    const words = element.dataset.words
        .split('|')
        .map(function(word){ return word.trim(); })
        .filter(Boolean);

    if(!words.length || xenmarkIsMobilePerfMode()){
        return;
    }

    let index = 0;

    window.setInterval(function(){
        element.classList.remove('is-changing');
        void element.offsetWidth;
        element.classList.add('is-changing');

        window.setTimeout(function(){
            index = (index + 1) % words.length;
            element.textContent = words[index];
        },220);
    },2800);
})();

/* Auto-highlight the extra crazy collection every 3 seconds. */
(function(){
    const cards = document.querySelectorAll('.crazy-collection-card');
    const status = document.getElementById('crazyCollectionStatus');

    if(!cards.length){
        return;
    }

    let index = 0;

    function activate(next){
        index = next;

        cards.forEach(function(card, cardIndex){
            card.classList.toggle('active', cardIndex === index);
        });

        if(status){
            status.textContent = String(index + 1).padStart(2,'0') + ' / ' + String(cards.length).padStart(2,'0');
        }
    }

    activate(0);

    if (!xenmarkIsMobilePerfMode()) {
        window.setInterval(function(){
            activate((index + 1) % cards.length);
        },3000);
    }
})();

/* Cyberpunk loading transition. */
(function(){
    const loader = document.getElementById('xenmarkLoader');
    const bar = loader ? loader.querySelector('.xenmark-loader-progress span') : null;
    const percent = document.getElementById('xenmarkLoaderPercent');

    if(!loader){
        return;
    }

    let value = 0;
    let loaded = false;

    function renderProgress(number){
        const safe = Math.min(100,Math.max(0,number));

        if(bar){
            bar.style.width = safe + '%';
        }

        if(percent){
            percent.textContent = String(Math.round(safe)).padStart(2,'0') + '%';
        }
    }

    const progressTimer = window.setInterval(function(){
        value += value < 70 ? 4 : 2;

        if(value >= 96){
            value = 96;
            window.clearInterval(progressTimer);
        }

        renderProgress(value);
    },80);

    function finishLoader(){
        if(loaded){
            return;
        }

        loaded = true;
        window.clearInterval(progressTimer);
        renderProgress(100);

        window.setTimeout(function(){
            loader.classList.add('loader-hide');

            window.setTimeout(function(){
                if(loader.parentNode){
                    loader.parentNode.removeChild(loader);
                }
            },800);
        },260);
    }

    if(document.readyState === 'complete'){
        window.setTimeout(finishLoader,350);
    }else{
        window.addEventListener('load',function(){
            window.setTimeout(finishLoader,350);
        },{once:true});
    }

    /* Safety fallback for slow/blocked external assets. */
    window.setTimeout(finishLoader,2600);
})();
