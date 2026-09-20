const PASSWORD = "CALFLL!";

const TASKS_KEY = "ctrlaltelite_tasks";
const EVENTS_KEY = "ctrlaltelite_events";
const MEMBERS_KEY = "ctrlaltelite_members";
const ATTENDANCE_KEY = "ctrlaltelite_attendance";
const PROGRESS_KEY = "ctrlaltelite_project_progress";
const PHOTOS_KEY = "ctrlaltelite_photos";

let tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
let events = JSON.parse(localStorage.getItem(EVENTS_KEY)) || [];
let members = JSON.parse(localStorage.getItem(MEMBERS_KEY)) || [];
let attendance = JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || {};
let projectProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {
    innovations: 0,
    "robot-game": 0,
    "robot-design": 0,
    documentation: 0,
    presentation: 0
};
let photos = JSON.parse(localStorage.getItem(PHOTOS_KEY)) || [];

let currentMonth = new Date();
let currentFilter = "all";


/* LOGIN */

const loginScreen = document.getElementById("loginScreen");
const site = document.getElementById("site");
const passwordInput = document.getElementById("passwordInput");
const loginButton = document.getElementById("loginButton");
const loginError = document.getElementById("loginError");

function checkLogin() {
    if (sessionStorage.getItem("ctrlaltelite_logged_in") === "true") {
        loginScreen.classList.add("hidden");
        site.classList.remove("hidden");
    }
}

function login() {
    if (passwordInput.value === PASSWORD) {
        sessionStorage.setItem("ctrlaltelite_logged_in", "true");
        loginScreen.classList.add("hidden");
        site.classList.remove("hidden");
        passwordInput.value = "";
        loginError.textContent = "";
    } else {
        loginError.textContent = "Incorrect password.";
        passwordInput.value = "";
    }
}

loginButton.addEventListener("click", login);

passwordInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        login();
    }
});

checkLogin();


/* STORAGE */

function saveTasks() {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function saveEvents() {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

function saveMembers() {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

function saveAttendance() {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
}

function saveProgress() {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(projectProgress));
}

function savePhotos() {
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
}


/* NAVIGATION */

document.querySelectorAll(".nav-button").forEach(button => {
    button.addEventListener("click", () => {

        document.querySelectorAll(".nav-button").forEach(btn => {
            btn.classList.remove("active");
        });

        document.querySelectorAll(".page-section").forEach(section => {
            section.classList.remove("active");
        });

        button.classList.add("active");

        const section = document.getElementById(button.dataset.section);

        if (section) {
            section.classList.add("active");
        }

        renderEverything();
    });
});


/* MODALS */

function openModal(id) {
    document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
}

document.querySelectorAll(".close-modal").forEach(button => {
    button.addEventListener("click", () => {
        closeModal(button.dataset.close);
    });
});

document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            modal.classList.add("hidden");
        }
    });
});


/* TASK MODAL */

document.getElementById("dashboardAddTask").addEventListener("click", () => {
    openModal("taskModal");
});

document.getElementById("tasksAddTask").addEventListener("click", () => {
    openModal("taskModal");
});


/* TASK CREATION */

document.getElementById("taskForm").addEventListener("submit", event => {

    event.preventDefault();

    const task = {
        id: Date.now(),
        name: document.getElementById("taskName").value.trim(),
        category: document.getElementById("taskCategory").value,
        assignee: document.getElementById("taskAssignee").value,
        notes: document.getElementById("taskNotes").value.trim(),
        dueDate: document.getElementById("taskDueDate").value,
        progress: 0,
        subtasks: []
    };

    tasks.push(task);

    saveTasks();

    event.target.reset();

    closeModal("taskModal");

    renderEverything();
});


/* EVENT MODAL */

document.getElementById("dashboardAddEvent").addEventListener("click", () => {
    openModal("eventModal");
});

document.getElementById("calendarAddEvent").addEventListener("click", () => {
    openModal("eventModal");
});


/* EVENT CREATION */

document.getElementById("eventForm").addEventListener("submit", event => {

    event.preventDefault();

    const newEvent = {
        id: Date.now(),
        name: document.getElementById("eventName").value.trim(),
        type: document.getElementById("eventType").value,
        date: document.getElementById("eventDate").value,
        location: document.getElementById("eventLocation").value.trim(),
        notes: document.getElementById("eventNotes").value.trim()
    };

    events.push(newEvent);

    saveEvents();

    event.target.reset();

    closeModal("eventModal");

    renderEverything();
});


/* TASK HELPERS */

function categoryName(category) {

    const names = {
        innovations: "Innovations",
        "robot-game": "Robot Game",
        "robot-design": "Robot Design",
        documentation: "Documentation",
        presentation: "Presentation"
    };

    return names[category] || category;
}

function formatDate(dateString) {

    if (!dateString) {
        return "No due date";
    }

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function isOverdue(task) {

    if (!task.dueDate || task.progress >= 100) {
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(task.dueDate + "T00:00:00");

    return due < today;
}

function updateTaskProgress(task) {

    if (!task.subtasks || task.subtasks.length === 0) {
        return;
    }

    const completed = task.subtasks.filter(subtask => subtask.completed).length;

    task.progress = Math.round(
        (completed / task.subtasks.length) * 100
    );
}


/* TASK RENDER */

function renderTasks() {

    const taskList = document.getElementById("taskList");

    let filteredTasks = [...tasks];

    if (currentFilter !== "all") {
        filteredTasks = filteredTasks.filter(
            task => task.category === currentFilter
        );
    }

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<div class="panel empty">No tasks yet.</div>`;
        return;
    }

    taskList.innerHTML = filteredTasks.map(task => {

        updateTaskProgress(task);

        const overdue = isOverdue(task);

        return `
            <div class="task-card">

                <div class="task-top">
                    <div>
                        <span class="task-category">
                            ${escapeHTML(categoryName(task.category))}
                        </span>

                        <h3>${escapeHTML(task.name)}</h3>
                    </div>
                </div>

                ${task.notes ? `
                    <div class="task-notes">
                        ${escapeHTML(task.notes)}
                    </div>
                ` : ""}

                <div class="task-meta">
                    ${task.assignee
                        ? `Assigned to: ${escapeHTML(task.assignee)}<br>`
                        : ""
                    }

                    Due:
                    <span class="${overdue ? "overdue" : ""}">
                        ${formatDate(task.dueDate)}
                        ${overdue ? " • OVERDUE" : ""}
                    </span>
                </div>

                <div>
                    <strong>${task.progress}%</strong>
                </div>

                <div class="task-progress">
                    <div
                        class="task-progress-fill"
                        style="width:${task.progress}%"
                    ></div>
                </div>

                <div class="task-actions">
                    <button onclick="changeTaskProgress(${task.id}, -10)">−10%</button>
                    <button onclick="changeTaskProgress(${task.id}, 10)">+10%</button>
                    <button onclick="addSubtask(${task.id})">+ Subtask</button>
                    <button class="delete-button" onclick="deleteTask(${task.id})">
                        Delete
                    </button>
                </div>

                ${renderSubtasks(task)}

            </div>
        `;

    }).join("");

    saveTasks();
}

function renderSubtasks(task) {

    if (!task.subtasks || task.subtasks.length === 0) {
        return "";
    }

    return `
        <div class="subtasks">

            <strong>Subtasks</strong>

            ${task.subtasks.map(subtask => `
                <div class="subtask ${subtask.completed ? "completed" : ""}">

                    <input
                        type="checkbox"
                        ${subtask.completed ? "checked" : ""}
                        onchange="toggleSubtask(${task.id}, ${subtask.id})"
                    >

                    <span>${escapeHTML(subtask.name)}</span>

                    <button onclick="deleteSubtask(${task.id}, ${subtask.id})">
                        ×
                    </button>

                </div>
            `).join("")}

        </div>
    `;
}

function changeTaskProgress(id, amount) {

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }

    if (task.subtasks && task.subtasks.length > 0) {
        alert("This task uses subtasks, so its progress is calculated from them.");
        return;
    }

    task.progress += amount;

    if (task.progress < 0) {
        task.progress = 0;
    }

    if (task.progress > 100) {
        task.progress = 100;
    }

    saveTasks();
    renderEverything();
}

function deleteTask(id) {

    if (!confirm("Delete this task?")) {
        return;
    }

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderEverything();
}

function addSubtask(taskId) {

    const name = prompt("Subtask name:");

    if (!name || !name.trim()) {
        return;
    }

    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        return;
    }

    task.subtasks.push({
        id: Date.now(),
        name: name.trim(),
        completed: false
    });

    updateTaskProgress(task);

    saveTasks();
    renderEverything();
}

function toggleSubtask(taskId, subtaskId) {

    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        return;
    }

    const subtask = task.subtasks.find(
        subtask => subtask.id === subtaskId
    );

    if (!subtask) {
        return;
    }

    subtask.completed = !subtask.completed;

    updateTaskProgress(task);

    saveTasks();
    renderEverything();
}

function deleteSubtask(taskId, subtaskId) {

    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        return;
    }

    task.subtasks = task.subtasks.filter(
        subtask => subtask.id !== subtaskId
    );

    updateTaskProgress(task);

    saveTasks();
    renderEverything();
}


/* FILTERS */

document.querySelectorAll(".filter-button").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".filter-button").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderTasks();
    });

});


/* PROJECT PROGRESS */

const progressLevels = [
    { percent: 0, text: "Haven't started" },
    { percent: 10, text: "Just started" },
    { percent: 20, text: "Procrastinated" },
    { percent: 35, text: "Done a bit" },
    { percent: 50, text: "Halfway there" },
    { percent: 75, text: "Nearly done" },
    { percent: 90, text: "Basically done" },
    { percent: 100, text: "Competition ready" }
];

function getProgressText(percent) {

    const level = progressLevels.find(
        level => level.percent === percent
    );

    return level ? level.text : `${percent}%`;
}

function renderProjectProgress() {

    const container = document.getElementById("projectProgress");

    const categories = [
        "innovations",
        "robot-game",
        "robot-design",
        "documentation",
        "presentation"
    ];

    container.innerHTML = categories.map(category => {

        const percent = projectProgress[category] || 0;

        return `
            <div class="project-card">

                <h3>${categoryName(category)}</h3>

                <button
                    class="progress-word"
                    onclick="chooseProjectProgress('${category}')"
                >
                    ${getProgressText(percent)}
                </button>

            </div>
        `;

    }).join("");
}

function chooseProjectProgress(category) {

    let choices = progressLevels.map(
        (level, index) =>
            `${index + 1}. ${level.text}`
    ).join("\n");

    const answer = prompt(
        `Set ${categoryName(category)} progress:\n\n${choices}\n\nEnter 1-8:`
    );

    if (answer === null) {
        return;
    }

    const number = Number(answer);

    if (!Number.isInteger(number) || number < 1 || number > 8) {
        alert("Please enter a number from 1 to 8.");
        return;
    }

    projectProgress[category] =
        progressLevels[number - 1].percent;

    saveProgress();

    renderEverything();
}


/* CALENDAR */

function renderCalendar() {

    const grid = document.getElementById("calendarGrid");
    const monthTitle = document.getElementById("calendarMonth");

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    monthTitle.textContent = currentMonth.toLocaleDateString(
        "en-AU",
        {
            month: "long",
            year: "numeric"
        }
    );

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = "";

    for (let i = 0; i < firstDay; i++) {
        html += `<div class="calendar-day"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {

        const date = new Date(year, month, day);

        const isoDate =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const today = new Date();

        const isToday =
            date.toDateString() === today.toDateString();

        let calendarItems = [];

        /* NORMAL EVENTS */

        events
            .filter(event => event.date === isoDate)
            .forEach(event => {

                calendarItems.push({
                    type: event.type,
                    name: event.name,
                    action: () => showEvent(event)
                });

            });


        /* TASKS */

        tasks
            .filter(task => task.dueDate === isoDate)
            .forEach(task => {

                calendarItems.push({
                    type: "task",
                    name: `📋 ${task.name}`,
                    action: () => showTask(task)
                });

            });


        /* WEDNESDAY + FRIDAY CLUB */

        if (date.getDay() === 3 || date.getDay() === 5) {

            calendarItems.push({
                type: "club",
                name: "Club",
                action: () => showClub(date)
            });

        }


        html += `
            <div class="calendar-day ${isToday ? "today" : ""}">

                <div class="calendar-day-number">
                    ${day}
                </div>

                ${calendarItems.map((item, index) => `
                    <div
                        class="calendar-event ${item.type}"
                        data-calendar-item="${isoDate}-${index}"
                    >
                        ${escapeHTML(item.name)}
                    </div>
                `).join("")}

            </div>
        `;
    }

    grid.innerHTML = html;


    /* Add event listeners after rendering */

    const allDays = grid.querySelectorAll(".calendar-day");

    let eventCounter = 0;

    for (let day = 1; day <= daysInMonth; day++) {

        const date = new Date(year, month, day);

        const isoDate =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const dayElement = allDays[firstDay + day - 1];

        if (!dayElement) {
            continue;
        }

        let items = [];

        events
            .filter(event => event.date === isoDate)
            .forEach(event => {
                items.push(() => showEvent(event));
            });

        tasks
            .filter(task => task.dueDate === isoDate)
            .forEach(task => {
                items.push(() => showTask(task));
            });

        if (date.getDay() === 3 || date.getDay() === 5) {
            items.push(() => showClub(date));
        }

        const eventElements =
            dayElement.querySelectorAll(".calendar-event");

        eventElements.forEach((element, index) => {

            if (items[index]) {
                element.addEventListener("click", items[index]);
            }

        });

        eventCounter++;
    }
}

function showEvent(event) {

    let message = event.name;

    if (event.location) {
        message += `\n\nLocation: ${event.location}`;
    }

    if (event.notes) {
        message += `\n\n${event.notes}`;
    }

    alert(message);
}

function showTask(task) {

    let message = task.name;

    message += `\n\nCategory: ${categoryName(task.category)}`;

    if (task.assignee) {
        message += `\nAssigned to: ${task.assignee}`;
    }

    if (task.dueDate) {
        message += `\nDue: ${formatDate(task.dueDate)}`;
    }

    if (task.notes) {
        message += `\n\n${task.notes}`;
    }

    alert(message);
}

function showClub(date) {

    const day = date.getDay() === 3
        ? "Wednesday"
        : "Friday";

    alert(`${day} club session`);
}

document.getElementById("previousMonth").addEventListener("click", () => {

    currentMonth.setMonth(currentMonth.getMonth() - 1);

    renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {

    currentMonth.setMonth(currentMonth.getMonth() + 1);

    renderCalendar();
});


/* PHOTOS */

document.getElementById("addPhotoButton").addEventListener("click", () => {
    openModal("photoModal");
});

document.getElementById("photoForm").addEventListener("submit", event => {

    event.preventDefault();

    const file = document.getElementById("photoFile").files[0];

    if (!file) {
        return;
    }

    const notes =
        document.getElementById("photoNotes").value.trim();

    const reader = new FileReader();

    reader.onload = function(e) {

        const photo = {
            id: Date.now(),
            image: e.target.result,
            notes: notes,
            name: file.name
        };

        photos.unshift(photo);

        savePhotos();

        event.target.reset();

        closeModal("photoModal");

        renderPhotos();
    };

    reader.readAsDataURL(file);
});

function renderPhotos() {

    const grid = document.getElementById("photoGrid");

    if (photos.length === 0) {

        grid.innerHTML = `
            <div class="panel empty">
                No photos yet.
            </div>
        `;

        return;
    }

    grid.innerHTML = photos.map(photo => `

        <div class="photo-card">

            <img
                src="${photo.image}"
                alt="${escapeAttribute(photo.name)}"
            >

            <div class="photo-info">

                ${photo.notes
                    ? `
                        <div class="photo-notes">
                            ${escapeHTML(photo.notes)}
                        </div>
                    `
                    : ""
                }

                <button
                    class="photo-delete"
                    onclick="deletePhoto(${photo.id})"
                >
                    Delete
                </button>

            </div>

        </div>

    `).join("");
}

function deletePhoto(id) {

    if (!confirm("Delete this photo?")) {
        return;
    }

    photos = photos.filter(photo => photo.id !== id);

    savePhotos();

    renderPhotos();
}


/* TEAM */

document.getElementById("addMemberButton").addEventListener("click", () => {

    const name = prompt("Team member name:");

    if (!name || !name.trim()) {
        return;
    }

    members.push({
        id: Date.now(),
        name: name.trim()
    });

    saveMembers();

    renderEverything();
});


function renderTeam() {

    const container = document.getElementById("teamMembers");

    if (members.length === 0) {

        container.innerHTML = `
            <div class="empty">
                No team members added yet.
            </div>
        `;

    } else {

        container.innerHTML = members.map(member => `

            <div class="member-card">

                <span>${escapeHTML(member.name)}</span>

                <button onclick="deleteMember(${member.id})">
                    ×
                </button>

            </div>

        `).join("");

    }

    updateAssigneeDropdown();

    renderAttendance("Wednesday", "wednesdayAttendance");
    renderAttendance("Friday", "fridayAttendance");
}

function deleteMember(id) {

    members = members.filter(member => member.id !== id);

    saveMembers();

    renderEverything();
}

function updateAssigneeDropdown() {

    const select = document.getElementById("taskAssignee");

    const currentValue = select.value;

    select.innerHTML = `
        <option value="">Nobody</option>
        ${members.map(member => `
            <option value="${escapeAttribute(member.name)}">
                ${escapeHTML(member.name)}
            </option>
        `).join("")}
    `;

    if (
        members.some(member => member.name === currentValue)
    ) {
        select.value = currentValue;
    }
}


/* ATTENDANCE */

function renderAttendance(dayName, containerId) {

    const container = document.getElementById(containerId);

    if (members.length === 0) {

        container.innerHTML =
            `<div class="empty">Add team members first.</div>`;

        return;
    }

    container.innerHTML = `
        <div class="attendance-list">

            ${members.map(member => {

                const key = `${dayName}_${member.id}`;

                const going = attendance[key] === true;

                return `
                    <div class="attendance-person">

                        <span>${escapeHTML(member.name)}</span>

                        <button
                            class="${going ? "going" : ""}"
                            onclick="toggleAttendance('${dayName}', ${member.id})"
                        >
                            ${going ? "Going ✓" : "I'm going"}
                        </button>

                    </div>
                `;

            }).join("")}

        </div>
    `;
}

function toggleAttendance(dayName, memberId) {

    const key = `${dayName}_${memberId}`;

    attendance[key] = !attendance[key];

    saveAttendance();

    renderTeam();
}


/* DASHBOARD */

function renderDashboard() {

    const overdueCount =
        tasks.filter(task => isOverdue(task)).length;

    const averageProgress =
        tasks.length === 0
            ? 0
            : Math.round(
                tasks.reduce(
                    (sum, task) => sum + task.progress,
                    0
                ) / tasks.length
            );

    document.getElementById("statTasks").textContent =
        tasks.length;

    document.getElementById("statEvents").textContent =
        events.length;

    document.getElementById("statOverdue").textContent =
        overdueCount;

    document.getElementById("statProgress").textContent =
        `${averageProgress}%`;


    /* Working on now */

    const dashboardTasks =
        document.getElementById("dashboardTasks");

    const activeTasks = tasks
        .filter(task => task.progress < 100)
        .slice(0, 5);

    if (activeTasks.length === 0) {

        dashboardTasks.innerHTML =
            `<div class="empty">No tasks yet.</div>`;

    } else {

        dashboardTasks.innerHTML =
            activeTasks.map(task => `

                <div class="dashboard-item">

                    <strong>${escapeHTML(task.name)}</strong>

                    <small>
                        ${categoryName(task.category)}
                        • ${task.progress}%
                    </small>

                </div>

            `).join("");
    }


    /* Next up */

    const dashboardEvents =
        document.getElementById("dashboardEvents");

    const upcomingEvents = [...events]
        .filter(event => event.date >= getTodayISO())
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

    if (upcomingEvents.length === 0) {

        dashboardEvents.innerHTML =
            `<div class="empty">No upcoming events.</div>`;

    } else {

        dashboardEvents.innerHTML =
            upcomingEvents.map(event => `

                <div class="dashboard-item">

                    <strong>${escapeHTML(event.name)}</strong>

                    <small>
                        ${formatDate(event.date)}
                        ${event.location
                            ? ` • ${escapeHTML(event.location)}`
                            : ""
                        }
                    </small>

                </div>

            `).join("");
    }
}


/* UTILITIES */

function getTodayISO() {

    const today = new Date();

    return `${today.getFullYear()}-${String(
        today.getMonth() + 1
    ).padStart(2, "0")}-${String(
        today.getDate()
    ).padStart(2, "0")}`;
}

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHTML(value);
}


/* RENDER EVERYTHING */

function renderEverything() {

    renderDashboard();
    renderTasks();
    renderProjectProgress();
    renderCalendar();
    renderPhotos();
    renderTeam();
}

renderEverything();