"use strict";


/**
 * Elements
 */
const form = document.getElementById("sj-form");
const address = document.getElementById("sj-address");
const error = document.getElementById("sj-error");
const errorCode = document.getElementById("sj-error-code");

/**
 * Globals
 */




/**
 * Globals
 */
/**
 * Globals
 */
/**
 * Globals
 */
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
        console.error("[LessonFinder] Search failed: proxy is not initialized.");
        return;
    }

    const query = address.value.trim();
    if (!query) return;

    try {
        await registerSW();
    } catch (err) {
        error.textContent = "Service worker failed.";
        errorCode.textContent = err.toString();
        console.error("[LessonFinder] Search failed: service worker registration failed.", err);
        return;
    }

    const engine = currentEngine;
    const url = search(query, engine);
    console.info("[LessonFinder] Search submitted:", { query });

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
console.info("[LessonFinder] Search navigation started successfully:", url);

setTimeout(() => {
    finishLoading();
}, 2000); // fallback
document.getElementById("nav-container").style.display = "flex";
document.getElementById("navbar-dot").style.display = "none";
window.navOpen = true;

    } catch (err) {
        error.textContent = "Failed to load page.";
        errorCode.textContent = err.toString();
        console.error("[LessonFinder] Search failed:", { query, url, error: err });
    }
});

const favoritesStorageKey = "lessonFinderFavorites";
let savedFavorites = [];

function setFavoriteError(message) {
    document.getElementById("favorite-error").textContent = message;
}

function renderFavorites() {
    const favoritesContainer = document.getElementById("custom-favorites");
    favoritesContainer.replaceChildren();

    savedFavorites.forEach((favorite, index) => {
        const entry = document.createElement("div");
        entry.className = "favorite-entry";

        const visitButton = document.createElement("button");
        visitButton.className = "custom-favorite";
        visitButton.type = "button";
        visitButton.setAttribute("aria-label", `Visit ${favorite.name}`);

        const icon = document.createElement("img");
        icon.className = "favorite-icon";
        icon.src = "/ela/fav.png";
        icon.alt = "";

        const name = document.createElement("span");
        name.className = "favorite-name";
        name.textContent = favorite.name;

        visitButton.append(icon, name);
        visitButton.addEventListener("click", () => {
            address.value = favorite.url;
            form.requestSubmit();
        });

        const removeButton = document.createElement("button");
        removeButton.className = "remove-favorite";
        removeButton.type = "button";
        removeButton.textContent = "×";
        removeButton.setAttribute("aria-label", `Remove ${favorite.name}`);
        removeButton.addEventListener("click", () => {
            const updatedFavorites = savedFavorites.filter((_, itemIndex) => itemIndex !== index);
            if (saveFavorites(updatedFavorites)) {
                savedFavorites = updatedFavorites;
                renderFavorites();
            }
        });

        entry.append(visitButton, removeButton);
        favoritesContainer.append(entry);
    });
}

function saveFavorites(favorites) {
    try {
        localStorage.setItem(favoritesStorageKey, JSON.stringify(favorites));
        setFavoriteError("");
        return true;
    } catch (err) {
        setFavoriteError(`Could not save favorites: ${err.message}`);
        return false;
    }
}

function initializeFavorites() {
    const favoriteForm = document.getElementById("favorite-form");
    const addFavoriteButton = document.getElementById("add-favorite-button");
    const cancelFavoriteButton = document.getElementById("cancel-favorite-button");
    const favoriteName = document.getElementById("favorite-name");
    const favoriteUrl = document.getElementById("favorite-url");

    try {
        const storedFavorites = localStorage.getItem(favoritesStorageKey);
        if (storedFavorites) {
            const parsedFavorites = JSON.parse(storedFavorites);
            if (
                !Array.isArray(parsedFavorites) ||
                parsedFavorites.some(
                    (favorite) =>
                        !favorite ||
                        typeof favorite.name !== "string" ||
                        typeof favorite.url !== "string"
                )
            ) {
                throw new Error("Saved favorites have an invalid format.");
            }
            savedFavorites = parsedFavorites;
        }
    } catch (err) {
        setFavoriteError(`Could not load favorites: ${err.message}`);
    }

    renderFavorites();

    addFavoriteButton.addEventListener("click", () => {
        favoriteForm.hidden = false;
        favoriteName.focus();
    });

    cancelFavoriteButton.addEventListener("click", () => {
        favoriteForm.reset();
        favoriteForm.hidden = true;
        setFavoriteError("");
    });

    favoriteForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = favoriteName.value.trim();
        const rawUrl = favoriteUrl.value.trim();
        if (!name || !rawUrl) {
            setFavoriteError("Enter both a button name and website address.");
            return;
        }

        let url;
        try {
            url = new URL(/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(rawUrl) ? rawUrl : `https://${rawUrl}`);
        } catch {
            setFavoriteError("Enter a valid website address.");
            return;
        }

        if (!["http:", "https:"].includes(url.protocol)) {
            setFavoriteError("Website addresses must use http or https.");
            return;
        }

        const updatedFavorites = [...savedFavorites, { name, url: url.toString() }];
        if (!saveFavorites(updatedFavorites)) return;

        savedFavorites = updatedFavorites;
        renderFavorites();
        favoriteForm.reset();
        favoriteForm.hidden = true;
    });
}

document.addEventListener("DOMContentLoaded", initializeFavorites);

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

   const engine = currentEngine;
    const url = search(query, engine);
    console.info("[LessonFinder] Navigation search submitted:", { query, url });

    try {
        currentUrl = url;
        currentFrame.go(url);
        console.info("[LessonFinder] Navigation search started successfully:", url);
        startLoading();

        setTimeout(() => {
            finishLoading();
        }, 2000);
    } catch (e) {
        console.error("[LessonFinder] Navigation search failed:", { query, url, error: e });
    }
};



document.getElementById("nav-search").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        navSearch();
    }

});




window.goBack = function () {
    resetInactivityTimer();

    try {
        currentFrame?.frame.contentWindow.history.back();
    } catch (e) {
        console.warn("Back failed", e);
    }
};

window.goForward = function () {
    resetInactivityTimer();

    try {
        currentFrame?.frame.contentWindow.history.forward();
    } catch (e) {
        console.warn("Forward failed", e);
    }
};

window.refreshPage = function () {
    resetInactivityTimer();

    try {
        if (currentFrame && currentUrl) {
            currentFrame.go(currentUrl);
        }
    } catch (e) {
        console.warn("Refresh failed", e);
    }
};







document.addEventListener("DOMContentLoaded", () => {
    const dot = document.getElementById("navbar-dot");
    const nav = document.getElementById("nav-container");

    if (dot) dot.style.display = "none";
    if (nav) nav.style.display = "none";
});




let mouseX = 0;
let mouseY = 0;
let mouseFrame = null;

document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!mouseFrame) {
        mouseFrame = requestAnimationFrame(() => {
            document.body.style.setProperty("--x", mouseX + "px");
            document.body.style.setProperty("--y", mouseY + "px");

            mouseFrame = null;
        });
    }
});








function toggleSimpleMode() {
    document.body.classList.toggle("simple-mode");

    if (document.body.classList.contains("simple-mode")) {
        document.getElementById("sj-address").focus();
    }
}



document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("sj-address").focus();
});




let currentEngine = "https://duckduckgo.com/?q=%s";

function setEngine(el, url) {
    currentEngine = url;

    const img = el.querySelector("img").src;
    document.getElementById("engine-icon").src = img;

    
    document.getElementById("engine-menu").classList.remove("open");

    showToast("Successful  😼");
}




function showTimeoutToast() {
    if (toastEl) toastEl.remove();

    toastEl = document.createElement("div");
    toastEl.className = "mouse-toast";
    toastEl.textContent = "Session timed out 😾.";

    document.body.appendChild(toastEl);

    // Put it near the current mouse position
    document.addEventListener("mousemove", moveToast);

    // Keep it visible for 3 seconds
    setTimeout(() => {
        if (!toastEl) return;

        toastEl.classList.add("fade-out");
    }, 2500);

    setTimeout(() => {
        if (toastEl) {
            toastEl.remove();
            toastEl = null;
        }

        document.removeEventListener("mousemove", moveToast);
    }, 3200);
}





















function toggleEngineMenu() {
    const menu = document.getElementById("engine-menu");
    menu.classList.toggle("open");
}





let toastEl = null;

function showToast(text) {
    // remove old toast if exists
    if (toastEl) toastEl.remove();

    toastEl = document.createElement("div");
    toastEl.className = "mouse-toast";
    toastEl.textContent = text;

    document.body.appendChild(toastEl);

    // follow mouse
    document.addEventListener("mousemove", moveToast);

    // fade out after delay
    setTimeout(() => {
        toastEl.classList.add("fade-out");
    }, 800);

    // remove after animation
    setTimeout(() => {
        toastEl.remove();
        document.removeEventListener("mousemove", moveToast);
        toastEl = null;
    }, 1800);
}

function moveToast(e) {
    if (!toastEl) return;

    toastEl.style.left = e.clientX + 10 + "px";
    toastEl.style.top = e.clientY - 20 + "px";
}