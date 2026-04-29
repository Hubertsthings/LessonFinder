"use strict";


/**
 * Elements
 */
const form = document.getElementById("sj-form");
const address = document.getElementById("sj-address");
const error = document.getElementById("sj-error");
const errorCode = document.getElementById("sj-error-code");
const engineSelector = document.getElementById("engine-selector");

/**
 * Globals
 */
let currentFrame = null;
let currentUrl = "";
let scramjet;
let connection;

/**
 * Initialize everything safely
 */
async function init() {
    try {
        const { ScramjetController } = $scramjetLoadController();

        scramjet = new ScramjetController({
            files: {
                wasm: "/scram/scramjet.wasm.wasm",
                all: "/scram/scramjet.all.js",
                sync: "/scram/scramjet.sync.js",
            },
        });

        await scramjet.init();

        connection = new BareMux.BareMuxConnection("/baremux/worker.js");

    } catch (err) {
        error.textContent = "Initialization failed.";
        errorCode.textContent = err.toString();
        console.error(err);
    }
}

init();



/**
 * Create frame (ONLY once)
 */
function initFrame() {
    if (!currentFrame) {
        currentFrame = scramjet.createFrame();
        currentFrame.frame.id = "sj-frame";

        currentFrame.frame.style.width = "100%";
        currentFrame.frame.style.height = "80vh";
        currentFrame.frame.style.border = "none";

currentFrame.frame.style.position = "fixed";
currentFrame.frame.style.top = "0px";
currentFrame.frame.style.left = "0";
currentFrame.frame.style.width = "100%";
currentFrame.frame.style.height = "100%";
currentFrame.frame.style.border = "none";
currentFrame.frame.style.zIndex = "9999";
currentFrame.frame.style.background = "white";

document.body.appendChild(currentFrame.frame);
    }
}

/**
 * Form submit
 */
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    error.textContent = "";
    errorCode.textContent = "";

    if (!scramjet || !connection) {
        error.textContent = "Proxy not initialized yet.";
        return;
    }

    try {
        await registerSW();
    } catch (err) {
        error.textContent = "Service worker failed.";
        errorCode.textContent = err.toString();
        return;
    }

    const query = address.value.trim();
    if (!query) return;

    const engine = engineSelector.value;
    const url = search(query, engine);

    try {
        const wispUrl =
            (location.protocol === "https:" ? "wss" : "ws") +
            "://" +
            location.host +
            "/wisp/";

        const current = await connection.getTransport();

        if (current !== "/libcurl/index.mjs") {
            await connection.setTransport("/libcurl/index.mjs", [
                { websocket: wispUrl },
            ]);
        }
initFrame();
startLoading();

currentUrl = url;
currentFrame.go(url);

setTimeout(() => {
    finishLoading();
}, 2000); // fallback
document.getElementById("nav-container").style.display = "flex";
document.getElementById("navbar-dot").style.display = "none";
window.navOpen = true;

    } catch (err) {
        error.textContent = "Failed to load page.";
        errorCode.textContent = err.toString();
        console.error(err);
    }
});

/**
 * Navigation buttons (global)
 */
window.goBack = function () {
    try {
        currentFrame?.frame.contentWindow.history.back();
    } catch (e) {
        console.warn("Back failed", e);
    }
};

window.goForward = function () {
    try {
        currentFrame?.frame.contentWindow.history.forward();
    } catch (e) {
        console.warn("Forward failed", e);
    }
};

window.refreshPage = function () {
    try {
        if (currentFrame && currentUrl) {
            currentFrame.go(currentUrl);
        }
    } catch (e) {
        console.warn("Refresh failed", e);
    }
};



window.goHome = function () {
    if (currentFrame) {
        currentFrame.frame.remove();
        currentFrame = null;
    }

    document.getElementById("homepage").style.display = "block";

    const bar = document.getElementById("navbar");
    bar.classList.add("collapsed");

    window.navOpen = false;
};







const loadingBar = document.getElementById("loading-bar");

let loadingInterval = null;

function startLoading() {
    loadingBar.style.opacity = "1";
    loadingBar.style.width = "10%";

    let progress = 10;

    clearInterval(loadingInterval);

    loadingInterval = setInterval(() => {
        if (progress < 90) {
            progress += Math.random() * 8; // smooth fake loading
            loadingBar.style.width = progress + "%";
        }
    }, 200);
}

function finishLoading() {
    clearInterval(loadingInterval);

    loadingBar.style.width = "100%";

    setTimeout(() => {
        loadingBar.style.opacity = "0";
        loadingBar.style.width = "0%";
    }, 300);
}



window.navOpen = false;

window.toggleNavbar = function () {
    const nav = document.getElementById("nav-container");
    const dot = document.getElementById("navbar-dot");

    if (nav.style.display === "none" || nav.style.display === "") {
        // OPEN
        nav.style.display = "flex";
        dot.style.display = "none";
    } else {
        // CLOSE
        nav.style.display = "none";
        dot.style.display = "block"; // 👈 only appears after close
    }
};





window.navSearch = function () {
    const input = document.getElementById("nav-search");
    const query = input.value.trim();

    if (!query || !scramjet || !connection) return;

    const engine = engineSelector.value;
    const url = search(query, engine);

    try {
        currentUrl = url;
        currentFrame.go(url);
        startLoading();

        setTimeout(() => {
            finishLoading();
        }, 2000);
    } catch (e) {
        console.error("Nav search failed", e);
    }
};



document.getElementById("nav-search").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        navSearch();
    }
});





document.addEventListener("DOMContentLoaded", () => {
    const dot = document.getElementById("navbar-dot");
    const nav = document.getElementById("nav-container");

    if (dot) dot.style.display = "none";
    if (nav) nav.style.display = "none";
});


document.addEventListener("mousemove", (e) => {
    document.body.style.setProperty("--x", e.clientX + "px");
    document.body.style.setProperty("--y", e.clientY + "px");
});








function toggleSimpleMode() {
    document.body.classList.toggle("simple-mode");
}



function toggleSimpleMode() {
    document.body.classList.toggle("simple-mode");

    if (document.body.classList.contains("simple-mode")) {
        document.getElementById("sj-address").focus();
    }
}