(function () {
  "use strict";

  var triggers = [];

  function setPanel(trigger, open) {
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
    var panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (panel) panel.hidden = !open;
  }
  function closePanels(except) {
    triggers.forEach(function (t) { if (t !== except) setPanel(t, false); });
  }

  function initMenus() {
    triggers = Array.prototype.slice.call(document.querySelectorAll(".nav-trigger"));
    var desktopHover = window.matchMedia("(hover: hover) and (min-width: 961px)");
    var closeTimer = null;

    triggers.forEach(function (trigger) {
      var item = trigger.parentElement;
      trigger.addEventListener("click", function () {
        var open = trigger.getAttribute("aria-expanded") !== "true";
        closePanels(trigger);
        setPanel(trigger, open);
      });
      item.addEventListener("mouseenter", function () {
        if (!desktopHover.matches) return;
        clearTimeout(closeTimer);
        closePanels(trigger);
        setPanel(trigger, true);
      });
      item.addEventListener("mouseleave", function () {
        if (!desktopHover.matches) return;
        closeTimer = setTimeout(function () { setPanel(trigger, false); }, 180);
      });
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest(".nav-item")) closePanels(null);
      if (event.target.closest(".mega a")) closePanels(null);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      var open = triggers.filter(function (t) { return t.getAttribute("aria-expanded") === "true"; })[0];
      if (open) { setPanel(open, false); open.focus(); }
    });
  }

  function initMobileNav() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.getElementById("site-nav");
    if (!button || !nav) return;
    function setOpen(open) {
      nav.setAttribute("data-open", open ? "true" : "false");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.textContent = open ? "Close" : "Menu";
      if (!open) closePanels(null);
    }
    button.addEventListener("click", function () { setOpen(nav.getAttribute("data-open") !== "true"); });
    nav.addEventListener("click", function (event) { if (event.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.getAttribute("data-open") === "true" && !triggers.some(function (t) {
        return t.getAttribute("aria-expanded") === "true";
      })) {
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

    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[data-tab]");
      if (!link) return;
      var target = document.getElementById("tab-" + link.getAttribute("data-tab"));
      var index = tabs.indexOf(target);
      if (index >= 0) select(index, false);
    });

    select(0, false);
  }

  function initYear() {
    var el = document.querySelector("[data-year]");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function start() {
    initMenus();
    initMobileNav();
    initTabs();
    initYear();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
