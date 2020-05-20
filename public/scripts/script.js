let menuDropdownBtn = document.querySelectorAll(".menu-dropdown-item");
let navBtn = document.querySelector("#navBtn");
let menuItems = document.querySelectorAll(".menu-item-link");
let dropdownBtn = document.querySelector(".user-dropdown button");

menuDropdownBtn.forEach(function(item) {
    // item.addEventListener("click", toggleDropdown);
    item.onclick = toggleDropdown;
});

navBtn.onclick = function() {
    let sidebar = document.querySelector(".sidebar");
    // let main = document.querySelector("main");
    let main = document.querySelector("section");
    // main.classList.toggle("shift-main");
    main.classList.toggle("shift-section");
    if (sidebar.classList.contains("showSidebar")) {
        sidebar.classList.remove("showSidebar");
        sidebar.classList.add("closeSidebar");
        toggleHamburgerMenu();
    } else {
        sidebar.classList.remove("closeSidebar");
        sidebar.classList.add("showSidebar");
        toggleHamburgerMenu();
    }
}

menuItems.forEach(function(item) {
    // item.onclick = changeSection;
    item.onclick = pageRedirect;
});

dropdownBtn.onclick = dropdownToggle;

function toggleDropdown() {
    let listNumber = this.dataset.list;
    let arrow = document.querySelector("#dd-arrow-" + listNumber);
    let ul = document.querySelector("#submenu-" + listNumber);
    if (ul.hidden) {
        ul.hidden = false;
        arrow.classList.remove("fa-caret-down");
        arrow.classList.add("fa-caret-up");
    } else {
        ul.hidden = true;
        arrow.classList.remove("fa-caret-up");
        arrow.classList.add("fa-caret-down");
    }
}

function toggleHamburgerMenu() {
    let menu = document.querySelector(".hamburger-menu");
    menu.classList.toggle("change");
}

function pageRedirect() {
    let target = this.dataset.target;
    window.location.href = target;
}

function dropdownToggle() {
    let ul = document.querySelector(".dropdown-ul");
    let arrow = document.getElementById("dd-arrow");
    if (ul.hidden) {
        ul.hidden = false;
        arrow.classList.remove("fa-caret-down");
        arrow.classList.add("fa-caret-up");
    } else {
        ul.hidden = true;
        arrow.classList.remove("fa-caret-up");
        arrow.classList.add("fa-caret-down");
    }
}



// File Input Field
function myFunction3() {
    document.getElementById("file-input").click();
}

function myFunction4() {
    const realFileBtn = document.getElementById("file-input");
    const fileTxt = document.getElementById("file-text");
    if (realFileBtn.value) {
        fileTxt.innerHTML = realFileBtn.value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1];
    } else {
        fileTxt.innerHTML = "No file chosen, yet.";
    }
}