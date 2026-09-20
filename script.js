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
let attendance = JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || {
    wednesday: [],
    friday: []
};
let projectProgress =
    JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
let photos = JSON.parse(localStorage.getItem(PHOTOS_KEY)) || [];


// Convert old member objects into normal names
members = members.map(member => {
    if (typeof member === "string") {
        return member;
    }

    if (member && typeof member === "object") {
        return (
            member.name ||
            member.member ||
            member.fullName ||
            "Unnamed member"
        );
    }

    return String(member);
});

saveMembers();


// Make sure attendance uses normal names too
attendance.wednesday = attendance.wednesday.map(member => {
    if (typeof member === "string") return member;

    if (member && typeof member === "object") {
        return (
            member.name ||
            member.member ||
            member.fullName ||
            "Unnamed member"
        );
    }

    return String(member);
});

attendance.friday = attendance.friday.map(member => {
    if (typeof member === "string") return member;

    if (member && typeof member === "object") {
        return (
            member.name ||
            member.member ||
            member.fullName ||
            "Unnamed member"
        );
    }

    return String(member);
});

saveAttendance();


let currentDate = new Date();
let currentFilter = "all";

const categoryNames = {
    innovations: "Innovations",
    "robot-game": "Robot Game",
    "robot-design": "Robot Design",
    documentation: "Documentation",
    presentation: "Presentation"
};

const progressLevels = [
    { value: 0, label: "Haven't started" },
    { value: 10, label: "Just started" },
    { value: 20, label: "Procrastinated" },
    { value: 35, label: "Done a bit" },
    { value: 50, label: "Halfway there" },
    { value: 75, label: "Nearly done" },
    { value: 90, label: "Basically done" },
    { value: 100, label: "Competition ready" }
];

const loginScreen = document.getElementById("loginScreen");
const site = document.getElementById("site");
const passwordInput = document.getElementById("passwordInput");
const loginButton = document.getElementById("loginButton");
const loginError = document.getElementById("loginError");

function login() {
    if (passwordInput.value === PASSWORD) {
        sessionStorage.setItem(
            "ctrlaltelite_logged_in",
            "true"
        );

        loginScreen.classList.add("hidden");
        site.classList.remove("hidden");

        renderEverything();
    } else {
        loginError.textContent = "Incorrect password.";
        passwordInput.value = "";
    }
}

loginButton.addEventListener("click", login);

passwordInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        login();
    }
});

if (
    sessionStorage.getItem("ctrlaltelite_logged_in") ===
    "true"
) {
    loginScreen.classList.add("hidden");
    site.classList.remove("hidden");
}

function saveTasks() {
    localStorage.setItem(
        TASKS_KEY,
        JSON.stringify(tasks)
    );
}

function saveEvents() {
    localStorage.setItem(
        EVENTS_KEY,
        JSON.stringify(events)
    );
}

function saveMembers() {
    localStorage.setItem(
        MEMBERS_KEY,
        JSON.stringify(members)
    );
}

function saveAttendance() {
    localStorage.setItem(
        ATTENDANCE_KEY,
        JSON.stringify(attendance)
    );
}

function saveProgress() {
    localStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify(projectProgress)
    );
}

function savePhotos() {
    localStorage.setItem(
        PHOTOS_KEY,
        JSON.stringify(photos)
    );
}

document.querySelectorAll(".nav-button").forEach(button => {
    button.addEventListener("click", () => {
        const sectionName = button.dataset.section;

        document.querySelectorAll(".nav-button").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        document.querySelectorAll(".page-section").forEach(section => {
            section.classList.remove("active");
        });

        document
            .getElementById(sectionName)
            .classList.add("active");

        renderEverything();
    });
});

function openModal(id) {
    document
        .getElementById(id)
        .classList.remove("hidden");
}

function closeModal(id) {
    document
        .getElementById(id)
        .classList.add("hidden");
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


/* TASKS */

document
    .getElementById("dashboardAddTask")
    .addEventListener("click", () => {
        prepareTaskModal();
        openModal("taskModal");
    });

document
    .getElementById("tasksAddTask")
    .addEventListener("click", () => {
        prepareTaskModal();
        openModal("taskModal");
    });

function prepareTaskModal() {
    document
        .getElementById("taskForm")
        .reset();

    const assigneeBox =
        document.getElementById("taskAssignees");

    assigneeBox.innerHTML = "";

    if (members.length === 0) {
        assigneeBox.innerHTML = `
            <p class="muted">
                Add team members first.
            </p>
        `;
        return;
    }

    members.forEach(member => {
        const label = document.createElement("label");

        label.className = "assignee-option";

        label.innerHTML = `
            <input type="checkbox" value="${escapeHTML(member)}">
            <span>${escapeHTML(member)}</span>
        `;

        assigneeBox.appendChild(label);
    });
}

document
    .getElementById("taskForm")
    .addEventListener("submit", event => {
        event.preventDefault();

        const name =
            document
                .getElementById("taskName")
                .value
                .trim();

        const category =
            document.getElementById("taskCategory").value;

        const notes =
            document
                .getElementById("taskNotes")
                .value
                .trim();

        const dueDate =
            document.getElementById("taskDueDate").value;

        const assignees = [
            ...document.querySelectorAll(
                "#taskAssignees input:checked"
            )
        ].map(input => input.value);

        tasks.push({
            id: Date.now(),
            name,
            category,
            assignees,
            notes,
            dueDate,
            progress: 0,
            subtasks: []
        });

        saveTasks();

        closeModal("taskModal");

        renderEverything();
    });

function getProgressLabel(value) {
    let closest = progressLevels[0];

    progressLevels.forEach(level => {
        if (
            Math.abs(level.value - value) <
            Math.abs(closest.value - value)
        ) {
            closest = level;
        }
    });

    return closest.label;
}

function changeTaskProgress(taskId) {
    const task = tasks.find(
        task => task.id === taskId
    );

    if (!task) return;

    const currentIndex =
        progressLevels.findIndex(
            level => level.value === task.progress
        );

    const nextIndex =
        currentIndex >= progressLevels.length - 1
            ? 0
            : currentIndex + 1;

    task.progress =
        progressLevels[nextIndex].value;

    saveTasks();

    renderEverything();
}

function addSubtask(taskId) {
    const task = tasks.find(
        task => task.id === taskId
    );

    if (!task) return;

    const name = prompt("Subtask name:");

    if (!name || !name.trim()) return;

    task.subtasks.push({
        id: Date.now(),
        name: name.trim(),
        completed: false
    });

    saveTasks();

    renderEverything();
}

function toggleSubtask(taskId, subtaskId) {
    const task = tasks.find(
        task => task.id === taskId
    );

    if (!task) return;

    const subtask = task.subtasks.find(
        subtask => subtask.id === subtaskId
    );

    if (!subtask) return;

    subtask.completed = !subtask.completed;

    saveTasks();

    renderEverything();
}

function deleteTask(taskId) {
    const task = tasks.find(
        task => task.id === taskId
    );

    if (!task) return;

    if (
        !confirm(
            `Delete "${task.name}"?\n\nThis cannot be undone.`
        )
    ) {
        return;
    }

    tasks = tasks.filter(
        task => task.id !== taskId
    );

    saveTasks();

    renderEverything();
}


/* EVENTS */

document
    .getElementById("dashboardAddEvent")
    .addEventListener("click", () => {
        prepareEventModal();
        openModal("eventModal");
    });

document
    .getElementById("calendarAddEvent")
    .addEventListener("click", () => {
        prepareEventModal();
        openModal("eventModal");
    });

function prepareEventModal() {
    const form =
        document.getElementById("eventForm");

    form.reset();

    delete form.dataset.editingId;

    document.getElementById("eventDate").value =
        dateToISO(currentDate);
}

document
    .getElementById("eventForm")
    .addEventListener("submit", event => {
        event.preventDefault();

        const form = event.target;

        const name =
            document
                .getElementById("eventName")
                .value
                .trim();

        const type =
            document.getElementById("eventType").value;

        const date =
            document.getElementById("eventDate").value;

        const location =
            document
                .getElementById("eventLocation")
                .value
                .trim();

        const notes =
            document
                .getElementById("eventNotes")
                .value
                .trim();

        const editingId =
            form.dataset.editingId;

        if (editingId) {
            const existingEvent = events.find(
                event =>
                    event.id === Number(editingId)
            );

            if (existingEvent) {
                existingEvent.name = name;
                existingEvent.type = type;
                existingEvent.date = date;
                existingEvent.location = location;
                existingEvent.notes = notes;
            }

            delete form.dataset.editingId;
        } else {
            events.push({
                id: Date.now(),
                name,
                type,
                date,
                location,
                notes
            });
        }

        saveEvents();

        closeModal("eventModal");

        renderEverything();
    });

function deleteEvent(eventId) {
    const event = events.find(
        event => event.id === eventId
    );

    if (!event) return;

    if (
        !confirm(
            `Delete "${event.name}"?\n\nThis cannot be undone.`
        )
    ) {
        return;
    }

    events = events.filter(
        event => event.id !== eventId
    );

    saveEvents();

    renderEverything();
}

function editEvent(eventId) {
    const event = events.find(
        event => event.id === eventId
    );

    if (!event) return;

    const form =
        document.getElementById("eventForm");

    form.dataset.editingId = eventId;

    document.getElementById("eventName").value =
        event.name;

    document.getElementById("eventType").value =
        event.type;

    document.getElementById("eventDate").value =
        event.date;

    document.getElementById("eventLocation").value =
        event.location || "";

    document.getElementById("eventNotes").value =
        event.notes || "";

    openModal("eventModal");
}

function dateToISO(date) {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getCalendarItems(date) {
    const dateString = dateToISO(date);

    const items = [];

    events
        .filter(event => event.date === dateString)
        .forEach(event => {
            items.push({
                id: event.id,
                name: event.name,
                type: event.type,
                source: "event",
                location: event.location,
                notes: event.notes
            });
        });

    tasks
        .filter(task => task.dueDate === dateString)
        .forEach(task => {
            items.push({
                id: task.id,
                name: task.name,
                type: "task",
                source: "task",
                location: "",
                notes: task.notes
            });
        });

    if (date.getDay() === 3) {
        items.push({
            id: `club-wednesday-${dateString}`,
            name: "Wednesday Club",
            type: "club",
            source: "club"
        });
    }

    if (date.getDay() === 5) {
        items.push({
            id: `club-friday-${dateString}`,
            name: "Friday Club",
            type: "club",
            source: "club"
        });
    }

    return items;
}

function renderCalendar() {
    const calendarGrid =
        document.getElementById("calendarGrid");

    const calendarMonth =
        document.getElementById("calendarMonth");

    calendarGrid.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    calendarMonth.textContent =
        currentDate.toLocaleDateString(
            "en-AU",
            {
                month: "long",
                year: "numeric"
            }
        );

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {
        const blank =
            document.createElement("div");

        blank.className =
            "calendar-day empty";

        calendarGrid.appendChild(blank);
    }

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {
        const date =
            new Date(
                year,
                month,
                day
            );

        const dayBox =
            document.createElement("div");

        dayBox.className =
            "calendar-day";

        const dateNumber =
            document.createElement("div");

        dateNumber.className =
            "calendar-date";

        dateNumber.textContent = day;

        dayBox.appendChild(dateNumber);

        const items =
            getCalendarItems(date);

        items.forEach(item => {
            const itemBox =
                document.createElement("div");

            itemBox.className =
                `calendar-item ${item.type}`;

            itemBox.textContent =
                item.name;

            if (item.source === "event") {
                itemBox.title =
                    "Click to edit or delete";

                itemBox.addEventListener(
                    "click",
                    () => {
                        showEventActions(item.id);
                    }
                );
            }

            if (item.source === "task") {
                itemBox.title = "Task";

                itemBox.addEventListener(
                    "click",
                    () => {
                        const task =
                            tasks.find(
                                task =>
                                    task.id === item.id
                            );

                        if (!task) return;

                        alert(
                            `${task.name}\n\n` +
                            `Category: ${
                                categoryNames[
                                    task.category
                                ]
                            }\n` +
                            `Progress: ${
                                getProgressLabel(
                                    task.progress
                                )
                            }`
                        );
                    }
                );
            }

            if (item.source === "club") {
                itemBox.title =
                    "Club session";
            }

            dayBox.appendChild(itemBox);
        });

        calendarGrid.appendChild(dayBox);
    }
}

function showEventActions(eventId) {
    const event = events.find(
        event => event.id === eventId
    );

    if (!event) return;

    const choice = prompt(
        `"${event.name}"\n\n` +
        `Type "edit" to edit this event.\n` +
        `Type "delete" to delete it.\n` +
        `Type "cancel" to do nothing.`
    );

    if (!choice) return;

    const action =
        choice.trim().toLowerCase();

    if (action === "delete") {
        deleteEvent(eventId);
    }

    if (action === "edit") {
        editEvent(eventId);
    }
}

document
    .getElementById("previousMonth")
    .addEventListener("click", () => {
        currentDate.setMonth(
            currentDate.getMonth() - 1
        );

        renderCalendar();
        renderDashboard();
    });

document
    .getElementById("nextMonth")
    .addEventListener("click", () => {
        currentDate.setMonth(
            currentDate.getMonth() + 1
        );

        renderCalendar();
        renderDashboard();
    });


/* TASK FILTERS */

document.querySelectorAll(".filter-button")
    .forEach(button => {
        button.addEventListener(
            "click",
            () => {
                currentFilter =
                    button.dataset.filter;

                document
                    .querySelectorAll(
                        ".filter-button"
                    )
                    .forEach(btn => {
                        btn.classList.remove(
                            "active"
                        );
                    });

                button.classList.add(
                    "active"
                );

                renderTasks();
            }
        );
    });

function renderTasks() {
    const taskList =
        document.getElementById("taskList");

    taskList.innerHTML = "";

    let filteredTasks = tasks;

    if (currentFilter !== "all") {
        filteredTasks =
            tasks.filter(
                task =>
                    task.category ===
                    currentFilter
            );
    }

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                No tasks yet.
            </div>
        `;

        return;
    }

    filteredTasks.forEach(task => {
        const card =
            document.createElement("div");

        card.className =
            "task-card";

        let assigneeHTML = "";

        if (
            task.assignees &&
            task.assignees.length > 0
        ) {
            assigneeHTML = `
                <div class="task-assignees">
                    ${task.assignees
                        .map(
                            person =>
                                `<span>${escapeHTML(
                                    person
                                )}</span>`
                        )
                        .join("")}
                </div>
            `;
        }

        let subtasksHTML = "";

        if (
            task.subtasks &&
            task.subtasks.length > 0
        ) {
            subtasksHTML = `
                <div class="subtasks">
                    ${task.subtasks
                        .map(
                            subtask => `
                                <label class="subtask">
                                    <input
                                        type="checkbox"
                                        ${
                                            subtask.completed
                                                ? "checked"
                                                : ""
                                        }
                                        onchange="toggleSubtask(
                                            ${task.id},
                                            ${subtask.id}
                                        )"
                                    >

                                    <span class="${
                                        subtask.completed
                                            ? "completed"
                                            : ""
                                    }">
                                        ${escapeHTML(
                                            subtask.name
                                        )}
                                    </span>
                                </label>
                            `
                        )
                        .join("")}
                </div>
            `;
        }

        card.innerHTML = `
            <div class="task-top">
                <div>
                    <h3>
                        ${escapeHTML(task.name)}
                    </h3>

                    <span class="category-tag">
                        ${
                            categoryNames[
                                task.category
                            ]
                        }
                    </span>
                </div>

                <button
                    class="delete-button"
                    onclick="deleteTask(${task.id})"
                >
                    Delete
                </button>
            </div>

            ${assigneeHTML}

            ${
                task.notes
                    ? `
                        <p class="task-notes">
                            ${escapeHTML(task.notes)}
                        </p>
                    `
                    : ""
            }

            ${
                task.dueDate
                    ? `
                        <p class="task-date">
                            Due: ${task.dueDate}
                        </p>
                    `
                    : ""
            }

            <div class="task-progress">
                <div class="progress-header">
                    <span>Progress</span>

                    <button
                        class="progress-word"
                        onclick="changeTaskProgress(
                            ${task.id}
                        )"
                    >
                        ${getProgressLabel(
                            task.progress
                        )}
                    </button>
                </div>

                <div class="progress-track">
                    <div
                        class="progress-fill"
                        style="width: ${
                            task.progress
                        }%"
                    ></div>
                </div>
            </div>

            ${subtasksHTML}

            <button
                class="small-button"
                onclick="addSubtask(${task.id})"
            >
                + Add subtask
            </button>
        `;

        taskList.appendChild(card);
    });
}


/* DASHBOARD */

function renderDashboard() {
    const dashboardTasks =
        document.getElementById(
            "dashboardTasks"
        );

    const dashboardEvents =
        document.getElementById(
            "dashboardEvents"
        );

    dashboardTasks.innerHTML = "";
    dashboardEvents.innerHTML = "";

    const activeTasks =
        tasks
            .filter(
                task =>
                    task.progress < 100
            )
            .slice(0, 6);

    if (activeTasks.length === 0) {
        dashboardTasks.innerHTML = `
            <div class="empty-state">
                No active tasks.
            </div>
        `;
    } else {
        activeTasks.forEach(task => {
            const item =
                document.createElement("div");

            item.className =
                "dashboard-item";

            item.innerHTML = `
                <div>
                    <strong>
                        ${escapeHTML(task.name)}
                    </strong>

                    <small>
                        ${
                            categoryNames[
                                task.category
                            ]
                        }
                    </small>
                </div>

                <button
                    class="progress-word"
                    onclick="changeTaskProgress(
                        ${task.id}
                    )"
                >
                    ${getProgressLabel(
                        task.progress
                    )}
                </button>
            `;

            dashboardTasks.appendChild(item);
        });
    }

    const today = new Date();

    const todayStart =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );

    const upcomingEvents =
        events
            .filter(event => {
                const eventDate =
                    new Date(
                        event.date +
                        "T00:00:00"
                    );

                return eventDate >= todayStart;
            })
            .sort(
                (a, b) =>
                    a.date.localeCompare(
                        b.date
                    )
            )
            .slice(0, 6);

    if (upcomingEvents.length === 0) {
        dashboardEvents.innerHTML = `
            <div class="empty-state">
                No upcoming events.
            </div>
        `;
    } else {
        upcomingEvents.forEach(event => {
            const item =
                document.createElement("div");

            item.className =
                "dashboard-item";

            item.innerHTML = `
                <div>
                    <strong>
                        ${escapeHTML(event.name)}
                    </strong>

                    <small>
                        ${event.date}
                        ${
                            event.location
                                ? ` • ${escapeHTML(
                                    event.location
                                )}`
                                : ""
                        }
                    </small>
                </div>

                <div class="event-actions">

                    <button
                        class="small-button"
                        onclick="editEvent(
                            ${event.id}
                        )"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-button"
                        onclick="deleteEvent(
                            ${event.id}
                        )"
                    >
                        Delete
                    </button>

                </div>
            `;

            dashboardEvents.appendChild(item);
        });
    }

    updateStats();
}


/* PROJECT PROGRESS */

function renderProjectProgress() {
    const container =
        document.getElementById(
            "projectProgress"
        );

    container.innerHTML = "";

    Object.keys(categoryNames)
        .forEach(category => {
            const value =
                projectProgress[
                    category
                ] !== undefined
                    ? projectProgress[
                        category
                    ]
                    : 0;

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "project-progress-item";

            button.innerHTML = `
                <span>
                    ${
                        categoryNames[
                            category
                        ]
                    }
                </span>

                <strong>
                    ${getProgressLabel(
                        value
                    )}
                </strong>
            `;

            button.addEventListener(
                "click",
                () => {
                    chooseProjectProgress(
                        category
                    );
                }
            );

            container.appendChild(button);
        });
}

function chooseProjectProgress(category) {
    const currentValue =
        projectProgress[
            category
        ] !== undefined
            ? projectProgress[
                category
            ]
            : 0;

    const options =
        progressLevels
            .map(
                (level, index) =>
                    `${index + 1}. ${level.label}`
            )
            .join("\n");

    const answer = prompt(
        `${categoryNames[category]}\n\n` +
        `Current: ${getProgressLabel(
            currentValue
        )}\n\n` +
        `${options}\n\n` +
        `Enter a number from 1-${progressLevels.length}:`
    );

    if (!answer) return;

    const selectedIndex =
        Number(answer) - 1;

    if (
        Number.isNaN(selectedIndex) ||
        selectedIndex < 0 ||
        selectedIndex >=
            progressLevels.length
    ) {
        return;
    }

    projectProgress[
        category
    ] =
        progressLevels[
            selectedIndex
        ].value;

    saveProgress();

    renderProjectProgress();
}


/* TEAM */

document
    .getElementById("addMemberButton")
    .addEventListener("click", () => {
        const name =
            prompt(
                "Team member name:"
            );

        if (
            !name ||
            !name.trim()
        ) {
            return;
        }

        members.push(
            name.trim()
        );

        saveMembers();

        renderEverything();
    });

function renderTeam() {
    const teamMembers =
        document.getElementById(
            "teamMembers"
        );

    teamMembers.innerHTML = "";

    if (members.length === 0) {
        teamMembers.innerHTML = `
            <div class="empty-state">
                No team members yet.
            </div>
        `;
    } else {
        members.forEach(
            (member, index) => {
                const memberBox =
                    document.createElement(
                        "div"
                    );

                memberBox.className =
                    "team-member";

                memberBox.innerHTML = `
                    <span>
                        ${escapeHTML(member)}
                    </span>

                    <button
                        class="delete-button"
                        onclick="deleteMember(
                            ${index}
                        )"
                    >
                        Delete
                    </button>
                `;

                teamMembers.appendChild(
                    memberBox
                );
            }
        );
    }

    renderAttendance();
}

function deleteMember(index) {
    const member =
        members[index];

    if (!member) return;

    if (
        !confirm(
            `Remove ${member} from the team?`
        )
    ) {
        return;
    }

    members.splice(
        index,
        1
    );

    attendance.wednesday =
        attendance.wednesday.filter(
            name =>
                name !== member
        );

    attendance.friday =
        attendance.friday.filter(
            name =>
                name !== member
        );

    tasks.forEach(task => {
        task.assignees =
            task.assignees.filter(
                name =>
                    name !== member
            );
    });

    saveMembers();
    saveAttendance();
    saveTasks();

    renderEverything();
}

function renderAttendance() {
    const wednesday =
        document.getElementById(
            "wednesdayAttendance"
        );

    const friday =
        document.getElementById(
            "fridayAttendance"
        );

    wednesday.innerHTML = "";
    friday.innerHTML = "";

    members.forEach(member => {

        const wedLabel =
            document.createElement(
                "label"
            );

        wedLabel.className =
            "attendance-option";

        wedLabel.innerHTML = `
            <input
                type="checkbox"
                ${
                    attendance.wednesday.includes(
                        member
                    )
                        ? "checked"
                        : ""
                }
            >
            ${escapeHTML(member)}
        `;

        wedLabel
            .querySelector("input")
            .addEventListener(
                "change",
                event => {
                    updateAttendance(
                        "wednesday",
                        member,
                        event.target.checked
                    );
                }
            );

        wednesday.appendChild(
            wedLabel
        );

        const friLabel =
            document.createElement(
                "label"
            );

        friLabel.className =
            "attendance-option";

        friLabel.innerHTML = `
            <input
                type="checkbox"
                ${
                    attendance.friday.includes(
                        member
                    )
                        ? "checked"
                        : ""
                }
            >
            ${escapeHTML(member)}
        `;

        friLabel
            .querySelector("input")
            .addEventListener(
                "change",
                event => {
                    updateAttendance(
                        "friday",
                        member,
                        event.target.checked
                    );
                }
            );

        friday.appendChild(
            friLabel
        );
    });
}

function updateAttendance(
    day,
    member,
    attending
) {
    if (attending) {
        if (
            !attendance[day].includes(
                member
            )
        ) {
            attendance[day].push(
                member
            );
        }
    } else {
        attendance[day] =
            attendance[day].filter(
                name =>
                    name !== member
            );
    }

    saveAttendance();
}


/* PHOTOS */

document
    .getElementById("addPhotoButton")
    .addEventListener("click", () => {
        document
            .getElementById(
                "photoForm"
            )
            .reset();

        openModal("photoModal");
    });

document
    .getElementById("photoForm")
    .addEventListener(
        "submit",
        event => {
            event.preventDefault();

            const file =
                document.getElementById(
                    "photoFile"
                ).files[0];

            const notes =
                document.getElementById(
                    "photoNotes"
                ).value.trim();

            if (!file) return;

            const reader =
                new FileReader();

            reader.onload = function () {
                photos.push({
                    id: Date.now(),
                    image: reader.result,
                    notes
                });

                savePhotos();

                closeModal(
                    "photoModal"
                );

                renderPhotos();
            };

            reader.readAsDataURL(
                file
            );
        }
    );

function renderPhotos() {
    const photoGrid =
        document.getElementById(
            "photoGrid"
        );

    photoGrid.innerHTML = "";

    if (photos.length === 0) {
        photoGrid.innerHTML = `
            <div class="empty-state">
                No photos yet.
            </div>
        `;

        return;
    }

    photos.forEach(photo => {
        const card =
            document.createElement(
                "div"
            );

        card.className =
            "photo-card";

        card.innerHTML = `
            <img
                src="${photo.image}"
                alt="Team photo"
            >

            ${
                photo.notes
                    ? `
                        <p>
                            ${escapeHTML(
                                photo.notes
                            )}
                        </p>
                    `
                    : ""
            }

            <button
                class="delete-button"
                onclick="deletePhoto(
                    ${photo.id}
                )"
            >
                Delete
            </button>
        `;

        photoGrid.appendChild(
            card
        );
    });
}

function deletePhoto(photoId) {
    if (
        !confirm(
            "Delete this photo?"
        )
    ) {
        return;
    }

    photos =
        photos.filter(
            photo =>
                photo.id !== photoId
        );

    savePhotos();

    renderPhotos();
}


/* STATS */

function updateStats() {
    document.getElementById(
        "statTasks"
    ).textContent =
        tasks.length;

    const today =
        new Date();

    const todayStart =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );

    const upcomingCount =
        events.filter(event => {
            const date =
                new Date(
                    event.date +
                    "T00:00:00"
                );

            return date >= todayStart;
        }).length;

    document.getElementById(
        "statEvents"
    ).textContent =
        upcomingCount;

    const todayISO =
        dateToISO(today);

    const overdue =
        tasks.filter(task => {
            return (
                task.dueDate &&
                task.dueDate <
                    todayISO &&
                task.progress < 100
            );
        }).length;

    document.getElementById(
        "statOverdue"
    ).textContent =
        overdue;

    let progress = 0;

    if (tasks.length > 0) {
        progress =
            tasks.reduce(
                (
                    total,
                    task
                ) =>
                    total +
                    task.progress,
                0
            ) / tasks.length;
    }

    document.getElementById(
        "statProgress"
    ).textContent =
        `${Math.round(
            progress
        )}%`;
}


/* HELPERS */

function escapeHTML(value) {
    if (value === undefined || value === null) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderEverything() {
    renderCalendar();
    renderTasks();
    renderDashboard();
    renderProjectProgress();
    renderTeam();
    renderPhotos();
}

if (
    sessionStorage.getItem(
        "ctrlaltelite_logged_in"
    ) === "true"
) {
    renderEverything();
}