"use strict";

const STORAGE_KEY = "taoi-homepage-data-v1";

const users = [
  { username: "superadmin", password: "TAOI@2026", role: "superadmin", displayName: "Super Admin" },
  { username: "publisher", password: "TAOI@2026", role: "publisher", displayName: "Announcement Publisher" },
  { username: "employee", password: "TAOI@2026", role: "employee", displayName: "Employee" },
];

const defaultData = {
  links: [
    { id: "l1", label: "Takaful Oman Website", url: "https://www.takafuloman.om" },
    { id: "l2", label: "Email Portal", url: "https://mail.google.com" },
    { id: "l3", label: "HR System", url: "https://example.com/hr" },
  ],
  announcements: [
    {
      id: "a1",
      title: "Welcome to the employee homepage",
      message: "Use this page as your daily start page for links, announcements, and search.",
      createdAt: new Date().toISOString(),
      author: "System",
    },
  ],
};

let state = loadState();
let currentUser = null;

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const linksList = document.getElementById("linksList");
const announcementsList = document.getElementById("announcementsList");

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const authError = document.getElementById("authError");
const authCard = document.getElementById("authCard");

const sessionStatus = document.getElementById("sessionStatus");
const logoutButton = document.getElementById("logoutButton");
const adminPanel = document.getElementById("adminPanel");
const roleDescription = document.getElementById("roleDescription");

const announcementForm = document.getElementById("announcementForm");
const announcementTitle = document.getElementById("announcementTitle");
const announcementMessage = document.getElementById("announcementMessage");

const linkForm = document.getElementById("linkForm");
const linkLabel = document.getElementById("linkLabel");
const linkUrl = document.getElementById("linkUrl");

init();

function init() {
  attachListeners();
  render();
}

function attachListeners() {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(googleUrl, "_blank", "noopener");
    searchInput.value = "";
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleLogin();
  });

  logoutButton.addEventListener("click", () => {
    currentUser = null;
    authError.classList.add("hidden");
    render();
  });

  announcementForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!canPublish()) return;

    const title = announcementTitle.value.trim();
    const message = announcementMessage.value.trim();
    if (!title || !message) return;

    state.announcements.unshift({
      id: `a-${Date.now()}`,
      title,
      message,
      createdAt: new Date().toISOString(),
      author: currentUser.displayName,
    });

    saveState();
    announcementForm.reset();
    renderAnnouncements();
  });

  linkForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!canManageLinks()) return;

    const label = linkLabel.value.trim();
    const url = normalizeUrl(linkUrl.value.trim());
    if (!label || !url) return;

    state.links.push({
      id: `l-${Date.now()}`,
      label,
      url,
    });

    saveState();
    linkForm.reset();
    renderLinks();
  });

  linksList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches("button[data-link-id]")) return;
    if (!canManageLinks()) return;

    const linkId = target.dataset.linkId;
    state.links = state.links.filter((item) => item.id !== linkId);
    saveState();
    renderLinks();
  });
}

function handleLogin() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  const matchedUser = users.find(
    (user) => user.username.toLowerCase() === username.toLowerCase() && user.password === password,
  );

  if (!matchedUser) {
    authError.textContent = "Invalid username or password.";
    authError.classList.remove("hidden");
    return;
  }

  currentUser = matchedUser;
  authError.classList.add("hidden");
  loginForm.reset();
  render();
}

function render() {
  renderSession();
  renderLinks();
  renderAnnouncements();
  renderAdminPanel();
}

function renderSession() {
  if (!currentUser) {
    sessionStatus.textContent = "Signed in as: Guest";
    logoutButton.classList.add("hidden");
    authCard.classList.remove("hidden");
    return;
  }

  const roleLabel = currentUser.role === "superadmin"
    ? "Super Admin"
    : currentUser.role === "publisher"
      ? "Publisher"
      : "Employee";

  sessionStatus.textContent = `Signed in as: ${currentUser.displayName} (${roleLabel})`;
  logoutButton.classList.remove("hidden");
  authCard.classList.remove("hidden");
}

function renderLinks() {
  linksList.replaceChildren();

  if (state.links.length === 0) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "No links available yet.";
    linksList.append(empty);
    return;
  }

  for (const link of state.links) {
    const card = document.createElement("div");
    card.className = "item";

    const head = document.createElement("div");
    head.className = "item-head";

    const anchor = document.createElement("a");
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = link.label;

    head.append(anchor);

    if (canManageLinks()) {
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.dataset.linkId = link.id;
      removeButton.className = "danger";
      removeButton.textContent = "Remove";
      head.append(removeButton);
    }

    card.append(head);

    const urlLine = document.createElement("p");
    urlLine.className = "announcement-meta";
    urlLine.textContent = link.url;
    card.append(urlLine);

    linksList.append(card);
  }
}

function renderAnnouncements() {
  announcementsList.replaceChildren();

  if (state.announcements.length === 0) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "No announcements published yet.";
    announcementsList.append(empty);
    return;
  }

  for (const post of sortAnnouncementsByDate(state.announcements)) {
    const card = document.createElement("div");
    card.className = "item";

    const title = document.createElement("strong");
    title.textContent = post.title;
    card.append(title);

    const body = document.createElement("p");
    body.textContent = post.message;
    card.append(body);

    const meta = document.createElement("p");
    meta.className = "announcement-meta";
    meta.textContent = `Published ${formatDate(post.createdAt)} by ${post.author}`;
    card.append(meta);

    announcementsList.append(card);
  }
}

function renderAdminPanel() {
  const hasAdminAccess = canPublish() || canManageLinks();

  if (!hasAdminAccess) {
    adminPanel.classList.add("hidden");
    return;
  }

  adminPanel.classList.remove("hidden");

  if (currentUser.role === "superadmin") {
    roleDescription.textContent =
      "You are a super admin. You can publish announcements and add or remove important links.";
    announcementForm.classList.remove("hidden");
    linkForm.classList.remove("hidden");
    return;
  }

  roleDescription.textContent =
    "You can publish announcements. Link management is restricted to super admin users.";
  announcementForm.classList.remove("hidden");
  linkForm.classList.add("hidden");
}

function canManageLinks() {
  return currentUser?.role === "superadmin";
}

function canPublish() {
  return currentUser?.role === "superadmin" || currentUser?.role === "publisher";
}

function loadState() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return structuredClone(defaultData);

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed.links) || !Array.isArray(parsed.announcements)) {
      return structuredClone(defaultData);
    }

    return parsed;
  } catch (error) {
    return structuredClone(defaultData);
  }
}

function saveState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function sortAnnouncementsByDate(items) {
  return [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function formatDate(isoString) {
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function normalizeUrl(value) {
  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}
