(function () {
  "use strict";

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.getElementById("site-nav");
    if (!button || !nav) return;
    function setOpen(open) {
      nav.setAttribute("data-open", open ? "true" : "false");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.textContent = open ? "Close" : "Menu";
    }
    button.addEventListener("click", function () { setOpen(nav.getAttribute("data-open") !== "true"); });
    nav.addEventListener("click", function (event) { if (event.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.getAttribute("data-open") === "true") {
        setOpen(false);
        button.focus();
      }
    });
  }

  function initTabs() {
    var list = document.querySelector("[data-tabs]");
    if (!list) return;
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;

    function select(index, focus) {
      tabs.forEach(function (tab, i) {
        var selected = i === index;
        tab.setAttribute("aria-selected", selected ? "true" : "false");
        tab.tabIndex = selected ? 0 : -1;
        var panel = document.getElementById(tab.getAttribute("aria-controls"));
        if (panel) panel.hidden = !selected;
      });
      if (focus) {
        tabs[index].focus();
        tabs[index].scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(i, false); });
      tab.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowRight") next = (i + 1) % tabs.length;
        else if (event.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        if (next !== null) {
          event.preventDefault();
          select(next, true);
        }
      });
    });
    select(0, false);
  }

  function initYear() {
    var el = document.querySelector("[data-year]");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function start() {
    initMenu();
    initTabs();
    initYear();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
