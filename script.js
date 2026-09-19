// ==========================================
// CtrlAltElite FLL Dashboard
// ==========================================


// ---------- DATA ----------

let tasks =
    JSON.parse(
        localStorage.getItem("ctrlaltelite_tasks")
    ) || [];


let events =
    JSON.parse(
        localStorage.getItem("ctrlaltelite_events")
    ) || [];


let members =
    JSON.parse(
        localStorage.getItem("ctrlaltelite_members")
    ) || [];


let attendance =
    JSON.parse(
        localStorage.getItem("ctrlaltelite_attendance")
    ) || {
        wednesday: [],
        friday: []
    };


// ---------- SAVE DATA ----------

function saveData() {

    localStorage.setItem(
        "ctrlaltelite_tasks",
        JSON.stringify(tasks)
    );

    localStorage.setItem(
        "ctrlaltelite_events",
        JSON.stringify(events)
    );

    localStorage.setItem(
        "ctrlaltelite_members",
        JSON.stringify(members)
    );

    localStorage.setItem(
        "ctrlaltelite_attendance",
        JSON.stringify(attendance)
    );
}


// ---------- NAVIGATION ----------

const navButtons =
    document.querySelectorAll(".nav-button");


const sections =
    document.querySelectorAll(".page-section");


navButtons.forEach(button => {

    button.addEventListener("click", () => {

        const sectionName =
            button.dataset.section;


        navButtons.forEach(btn =>
            btn.classList.remove("active")
        );


        sections.forEach(section =>
            section.classList.remove("active-section")
        );


        button.classList.add("active");


        document
            .getElementById(sectionName)
            .classList.add("active-section");


        if (sectionName === "calendar") {
            renderCalendar();
        }

    });

});


// ---------- TASK MODAL ----------

const taskModal =
    document.getElementById("task-modal");


function openTaskModal() {

    taskModal.classList.remove("hidden");

}


function closeTaskModal() {

    taskModal.classList.add("hidden");

    document
        .getElementById("task-form")
        .reset();

}


document
    .getElementById("add-task")
    .addEventListener("click", openTaskModal);


document
    .getElementById("add-task-dashboard")
    .addEventListener("click", openTaskModal);


document
    .getElementById("close-task-modal")
    .addEventListener("click", closeTaskModal);


document
    .getElementById("cancel-task")
    .addEventListener("click", closeTaskModal);


// ---------- CREATE TASK ----------

document
    .getElementById("task-form")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const task = {

            id: Date.now(),

            name:
                document
                    .getElementById("task-name")
                    .value,

            category:
                document
                    .getElementById("task-category")
                    .value,

            assignee:
                document
                    .getElementById("task-assignee")
                    .value,

            notes:
                document
                    .getElementById("task-notes")
                    .value,

            dueDate:
                document
                    .getElementById("task-due-date")
                    .value,

            progress: 0,

            subtasks: []

        };


        tasks.push(task);

        saveData();

        closeTaskModal();

        renderEverything();

    });


// ---------- TASK FILTER ----------

document
    .getElementById("task-filter")
    .addEventListener("change", renderTasks);


// ---------- TASK RENDERING ----------

function renderTasks() {

    const container =
        document.getElementById("task-container");


    const filter =
        document.getElementById("task-filter").value;


    let filteredTasks = tasks;


    if (filter !== "all") {

        filteredTasks =
            tasks.filter(
                task => task.category === filter
            );

    }


    if (filteredTasks.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <h4>No tasks found</h4>

                <p>
                    Add a task or change the category filter.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =

        filteredTasks.map(task => {

            const overdue =
                task.dueDate &&
                new Date(
                    task.dueDate + "T23:59:59"
                ) < new Date() &&
                task.progress < 100;


            const completed =
                task.progress === 100;


            return `

                <div class="task-card">

                    <div class="task-top">

                        <div>

                            <div class="task-title">
                                ${escapeHTML(task.name)}
                            </div>


                            <div class="task-meta">

                                <span class="tag">
                                    ${formatCategory(task.category)}
                                </span>


                                ${
                                    task.assignee
                                    ?
                                    `
                                    <span class="tag">
                                        ${escapeHTML(task.assignee)}
                                    </span>
                                    `
                                    :
                                    ""
                                }


                                ${
                                    task.dueDate
                                    ?
                                    `
                                    <span class="tag ${
                                        overdue ? "overdue" : ""
                                    }">

                                        ${
                                            overdue
                                            ? "Overdue • "
                                            : "Due • "
                                        }

                                        ${formatDate(task.dueDate)}

                                    </span>
                                    `
                                    :
                                    ""
                                }


                                ${
                                    completed
                                    ?
                                    `
                                    <span class="tag completed">
                                        Completed
                                    </span>
                                    `
                                    :
                                    ""
                                }

                            </div>

                        </div>

                    </div>


                    ${
                        task.notes
                        ?
                        `
                        <div class="task-notes">
                            ${escapeHTML(task.notes)}
                        </div>
                        `
                        :
                        ""
                    }


                    <div class="task-progress-info">

                        <span>
                            Progress
                        </span>

                        <strong>
                            ${task.progress}%
                        </strong>

                    </div>


                    <div class="progress-bar">

                        <div
                            style="width: ${task.progress}%"
                        ></div>

                    </div>


                    <div class="task-actions">

                        <button
                            class="small-button"
                            onclick="changeProgress(${task.id}, -10)"
                        >
                            −10%
                        </button>


                        <button
                            class="small-button"
                            onclick="changeProgress(${task.id}, 10)"
                        >
                            +10%
                        </button>


                        <button
                            class="small-button"
                            onclick="addSubtask(${task.id})"
                        >
                            + Subtask
                        </button>


                        <button
                            class="small-button"
                            onclick="deleteTask(${task.id})"
                        >
                            Delete
                        </button>

                    </div>


                    ${
                        task.subtasks.length > 0
                        ?
                        `

                        <div class="subtasks">

                            <h4>
                                Subtasks
                            </h4>


                            ${
                                task.subtasks.map(
                                    (subtask, index) => `

                                    <div class="subtask">

                                        <input
                                            type="checkbox"
                                            ${
                                                subtask.completed
                                                ? "checked"
                                                : ""
                                            }
                                            onchange="
                                                toggleSubtask(
                                                    ${task.id},
                                                    ${index}
                                                )
                                            "
                                        >


                                        <span
                                            class="
                                                subtask-name
                                                ${
                                                    subtask.completed
                                                    ? "completed"
                                                    : ""
                                                }
                                            "
                                        >
                                            ${escapeHTML(subtask.name)}
                                        </span>


                                        <button
                                            class="small-button"
                                            onclick="
                                                deleteSubtask(
                                                    ${task.id},
                                                    ${index}
                                                )
                                            "
                                        >
                                            ×
                                        </button>

                                    </div>

                                `
                                ).join("")
                            }

                        </div>

                        `
                        :
                        ""
                    }

                </div>

            `;

        }).join("");
}


// ---------- TASK PROGRESS ----------

function changeProgress(id, amount) {

    const task =
        tasks.find(task => task.id === id);


    if (!task) return;


    task.progress += amount;


    if (task.progress < 0) {
        task.progress = 0;
    }


    if (task.progress > 100) {
        task.progress = 100;
    }


    saveData();

    renderEverything();

}


// ---------- DELETE TASK ----------

function deleteTask(id) {

    if (!confirm("Delete this task?")) {
        return;
    }


    tasks =
        tasks.filter(task => task.id !== id);


    saveData();

    renderEverything();

}


// ---------- SUBTASKS ----------

function addSubtask(taskId) {

    const name =
        prompt("What is the subtask?");


    if (!name || name.trim() === "") {
        return;
    }


    const task =
        tasks.find(task => task.id === taskId);


    if (!task) return;


    task.subtasks.push({

        name: name.trim(),

        completed: false

    });


    updateTaskProgressFromSubtasks(task);

    saveData();

    renderEverything();

}


function toggleSubtask(taskId, subtaskIndex) {

    const task =
        tasks.find(task => task.id === taskId);


    if (!task) return;


    task.subtasks[subtaskIndex].completed =
        !task.subtasks[subtaskIndex].completed;


    updateTaskProgressFromSubtasks(task);

    saveData();

    renderEverything();

}


function deleteSubtask(taskId, subtaskIndex) {

    const task =
        tasks.find(task => task.id === taskId);


    if (!task) return;


    task.subtasks.splice(subtaskIndex, 1);


    updateTaskProgressFromSubtasks(task);

    saveData();

    renderEverything();

}


function updateTaskProgressFromSubtasks(task) {

    if (task.subtasks.length === 0) {
        return;
    }


    const completed =
        task.subtasks.filter(
            subtask => subtask.completed
        ).length;


    task.progress =
        Math.round(
            (completed / task.subtasks.length) * 100
        );

}


// ---------- EVENT MODAL ----------

const eventModal =
    document.getElementById("event-modal");


function openEventModal() {

    eventModal.classList.remove("hidden");

}


function closeEventModal() {

    eventModal.classList.add("hidden");

    document
        .getElementById("event-form")
        .reset();

}


document
    .getElementById("add-event")
    .addEventListener("click", openEventModal);


document
    .getElementById("add-event-dashboard")
    .addEventListener("click", openEventModal);


document
    .getElementById("close-event-modal")
    .addEventListener("click", closeEventModal);


document
    .getElementById("cancel-event")
    .addEventListener("click", closeEventModal);


// ---------- CREATE EVENT ----------

document
    .getElementById("event-form")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const newEvent = {

            id: Date.now(),

            name:
                document
                    .getElementById("event-name")
                    .value,

            type:
                document
                    .getElementById("event-type")
                    .value,

            date:
                document
                    .getElementById("event-date")
                    .value,

            location:
                document
                    .getElementById("event-location")
                    .value,

            notes:
                document
                    .getElementById("event-notes")
                    .value

        };


        events.push(newEvent);

        saveData();

        closeEventModal();

        renderEverything();

    });


// ---------- CALENDAR ----------

let calendarDate =
    new Date();


document
    .getElementById("previous-month")
    .addEventListener("click", () => {

        calendarDate.setMonth(
            calendarDate.getMonth() - 1
        );

        renderCalendar();

    });


document
    .getElementById("next-month")
    .addEventListener("click", () => {

        calendarDate.setMonth(
            calendarDate.getMonth() + 1
        );

        renderCalendar();

    });


function renderCalendar() {

    const grid =
        document.getElementById("calendar-grid");


    const year =
        calendarDate.getFullYear();


    const month =
        calendarDate.getMonth();


    document.getElementById("calendar-month")
        .textContent =

        calendarDate.toLocaleDateString(
            "en-AU",
            {
                month: "long",
                year: "numeric"
            }
        );


    const dayNames = [

        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"

    ];


    let html =

        dayNames.map(day => `

            <div class="calendar-day-name">
                ${day}
            </div>

        `).join("");


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


    const previousMonthDays =
        new Date(
            year,
            month,
            0
        ).getDate();


    for (let i = 0; i < 42; i++) {

        const dayNumber =
            i - firstDay + 1;


        let cellDate;

        let displayNumber;

        let otherMonth = false;


        if (dayNumber <= 0) {

            displayNumber =
                previousMonthDays + dayNumber;


            cellDate =
                new Date(
                    year,
                    month - 1,
                    displayNumber
                );


            otherMonth = true;

        }

        else if (
            dayNumber > daysInMonth
        ) {

            displayNumber =
                dayNumber - daysInMonth;


            cellDate =
                new Date(
                    year,
                    month + 1,
                    displayNumber
                );


            otherMonth = true;

        }

        else {

            displayNumber =
                dayNumber;


            cellDate =
                new Date(
                    year,
                    month,
                    dayNumber
                );

        }


        const dateString =
            formatISODate(cellDate);


        const todaysEvents =
            events.filter(
                event =>
                    event.date === dateString
            );


        const isToday =
            dateString ===
            formatISODate(new Date());


        html += `

            <div class="
                calendar-cell
                ${otherMonth ? "other-month" : ""}
            ">

                <div class="
                    calendar-number
                    ${isToday ? "today" : ""}
                ">

                    ${displayNumber}

                </div>


                ${
                    todaysEvents.map(
                        event => `

                        <div
                            class="
                                calendar-event
                                ${event.type}
                            "
                            onclick="
                                showEvent(${event.id})
                            "
                            title="${escapeHTML(event.name)}"
                        >

                            ${escapeHTML(event.name)}

                        </div>

                    `
                    ).join("")
                }

            </div>

        `;

    }


    grid.innerHTML = html;

}


// ---------- SHOW EVENT ----------

function showEvent(id) {

    const event =
        events.find(
            event => event.id === id
        );


    if (!event) return;


    const location =
        event.location
        ? `\nLocation: ${event.location}`
        : "";


    const notes =
        event.notes
        ? `\n\n${event.notes}`
        : "";


    alert(

        `${event.name}\n\n` +

        `${formatDate(event.date)}` +

        `${location}` +

        `${notes}`

    );

}


// ---------- TEAM MEMBERS ----------

document
    .getElementById("add-member")
    .addEventListener("click", () => {

        const name =
            prompt(
                "Enter team member's name:"
            );


        if (!name || name.trim() === "") {
            return;
        }


        members.push({

            id: Date.now(),

            name: name.trim()

        });


        saveData();

        renderEverything();

    });


function renderTeam() {

    const container =
        document.getElementById("team-members");


    if (members.length === 0) {

        container.className =
            "empty-state";


        container.innerHTML = `

            <h4>
                No team members yet
            </h4>

            <p>
                Add your team members here.
            </p>

        `;

    }

    else {

        container.className = "";


        container.innerHTML =

            members.map(member => `

                <div class="member-row">

                    <span class="member-name">

                        ${escapeHTML(member.name)}

                    </span>


                    <button
                        class="small-button"
                        onclick="
                            deleteMember(${member.id})
                        "
                    >
                        Remove
                    </button>

                </div>

            `).join("");

    }


    updateAssigneeDropdown();

    renderAttendance();

}


// ---------- DELETE MEMBER ----------

function deleteMember(id) {

    if (!confirm("Remove this team member?")) {
        return;
    }


    const member =
        members.find(
            member => member.id === id
        );


    members =
        members.filter(
            member => member.id !== id
        );


    if (member) {

        attendance.wednesday =
            attendance.wednesday.filter(
                name => name !== member.name
            );


        attendance.friday =
            attendance.friday.filter(
                name => name !== member.name
            );

    }


    saveData();

    renderEverything();

}


// ---------- ASSIGNEE DROPDOWN ----------

function updateAssigneeDropdown() {

    const dropdown =
        document.getElementById(
            "task-assignee"
        );


    dropdown.innerHTML = `

        <option value="">
            Unassigned
        </option>

        ${
            members.map(
                member => `

                <option
                    value="${escapeHTML(member.name)}"
                >
                    ${escapeHTML(member.name)}
                </option>

            `
            ).join("")
        }

    `;

}


// ---------- CLUB ATTENDANCE ----------

let selectedClubDay =
    "wednesday";


document
    .querySelectorAll(".club-day")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                selectedClubDay =
                    button.dataset.day;


                document
                    .querySelectorAll(".club-day")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );


                button.classList.add("active");


                renderAttendance();

            }
        );

    });


function renderAttendance() {

    const container =
        document.getElementById(
            "club-attendance"
        );


    const attending =
        attendance[selectedClubDay] || [];


    if (members.length === 0) {

        container.className =
            "empty-state";


        container.innerHTML = `

            <h4>
                Add team members first
            </h4>

            <p>
                Once members are added,
                they can opt in to club sessions.
            </p>

        `;

        return;
    }


    container.className = "";


    container.innerHTML =

        members.map(member => {

            const isAttending =
                attending.includes(
                    member.name
                );


            return `

                <div class="attendance-row">

                    <span class="member-name">

                        ${escapeHTML(member.name)}

                    </span>


                    <button
                        class="small-button"
                        onclick="
                            toggleAttendance(
                                '${escapeAttribute(member.name)}'
                            )
                        "
                    >

                        ${
                            isAttending
                            ? "Going ✓"
                            : "I'm going"
                        }

                    </button>

                </div>

            `;

        }).join("");

}


// ---------- TOGGLE ATTENDANCE ----------

function toggleAttendance(name) {

    const list =
        attendance[selectedClubDay];


    const index =
        list.indexOf(name);


    if (index === -1) {

        list.push(name);

    }

    else {

        list.splice(index, 1);

    }


    saveData();

    renderAttendance();

}


// ---------- DASHBOARD ----------

function renderDashboard() {

    document.getElementById(
        "task-count"
    ).textContent =
        tasks.length;


    document.getElementById(
        "event-count"
    ).textContent =

        events.filter(
            event =>
                new Date(
                    event.date + "T23:59:59"
                ) >= new Date()
        ).length;


    const overdue =
        tasks.filter(
            task =>

                task.dueDate &&

                new Date(
                    task.dueDate + "T23:59:59"
                ) < new Date() &&

                task.progress < 100

        ).length;


    document.getElementById(
        "overdue-count"
    ).textContent =
        overdue;


    let overall = 0;


    if (tasks.length > 0) {

        overall =
            Math.round(

                tasks.reduce(
                    (sum, task) =>
                        sum + task.progress,
                    0
                ) / tasks.length

            );

    }


    document.getElementById(
        "overall-progress"
    ).textContent =
        `${overall}%`;


    renderCurrentTasks();

    renderUpcomingEvents();

    renderCategoryProgress();

}


// ---------- CURRENT TASKS ----------

function renderCurrentTasks() {

    const container =
        document.getElementById(
            "current-tasks"
        );


    const activeTasks =
        tasks
            .filter(
                task => task.progress < 100
            )
            .slice(0, 5);


    if (activeTasks.length === 0) {

        container.className =
            "empty-state";


        container.innerHTML = `

            <h4>
                No active tasks
            </h4>

            <p>
                Add a task when your team
                starts working on something.
            </p>

        `;

        return;
    }


    container.className =
        "task-container";


    container.innerHTML =

        activeTasks.map(task => `

            <div class="task-card">

                <div class="task-title">

                    ${escapeHTML(task.name)}

                </div>


                <div class="task-meta">

                    <span class="tag">

                        ${formatCategory(task.category)}

                    </span>


                    ${
                        task.assignee
                        ?
                        `
                        <span class="tag">

                            ${escapeHTML(task.assignee)}

                        </span>
                        `
                        :
                        ""
                    }

                </div>


                <div class="task-progress-info">

                    <span>
                        Progress
                    </span>

                    <strong>
                        ${task.progress}%
                    </strong>

                </div>


                <div class="progress-bar">

                    <div
                        style="width:${task.progress}%"
                    ></div>

                </div>

            </div>

        `).join("");

}


// ---------- UPCOMING EVENTS ----------

function renderUpcomingEvents() {

    const container =
        document.getElementById(
            "upcoming-events"
        );


    const today =
        new Date();


    const upcoming =
        events
            .filter(
                event =>
                    new Date(
                        event.date + "T23:59:59"
                    ) >= today
            )
            .sort(
                (a, b) =>
                    a.date.localeCompare(b.date)
            )
            .slice(0, 5);


    if (upcoming.length === 0) {

        container.className =
            "empty-state";


        container.innerHTML = `

            <h4>
                No upcoming events
            </h4>

            <p>
                Add deadlines, meetings,
                competitions and other events.
            </p>

        `;

        return;
    }


    container.className =
        "event-list";


    container.innerHTML =

        upcoming.map(event => `

            <div class="event-item">

                <strong>

                    ${escapeHTML(event.name)}

                </strong>


                <p>

                    ${formatDate(event.date)}

                    ${
                        event.location
                        ?
                        ` • ${escapeHTML(event.location)}`
                        :
                        ""
                    }

                </p>

            </div>

        `).join("");

}


// ---------- CATEGORY PROJECT PROGRESS ----------

function renderCategoryProgress() {

    const categories = [

        "innovations",
        "robot-game",
        "robot-design",
        "documentation",
        "presentation"

    ];


    categories.forEach(category => {

        const categoryTasks =
            tasks.filter(
                task =>
                    task.category === category
            );


        let progress = 0;


        if (categoryTasks.length > 0) {

            progress =
                Math.round(

                    categoryTasks.reduce(
                        (sum, task) =>
                            sum + task.progress,
                        0
                    ) / categoryTasks.length

                );

        }


        let wording;


        if (progress === 0) {

            wording =
                "Haven't started";

        }

        else if (progress <= 10) {

            wording =
                "Just started";

        }

        else if (progress <= 20) {

            wording =
                "Procrastinated";

        }

        else if (progress <= 35) {

            wording =
                "Done a bit";

        }

        else if (progress <= 55) {

            wording =
                "Halfway there";

        }

        else if (progress <= 75) {

            wording =
                "Nearly done";

        }

        else if (progress < 100) {

            wording =
                "Basically done";

        }

        else {

            wording =
                "Competition ready";

        }


        const element =
            document.getElementById(
                `progress-${category}`
            );


        if (element) {

            element.textContent =
                wording;

        }

    });

}


// ---------- UTILITY FUNCTIONS ----------

function formatCategory(category) {

    const names = {

        "innovations":
            "Innovations",

        "robot-game":
            "Robot Game",

        "robot-design":
            "Robot Design",

        "documentation":
            "Documentation",

        "presentation":
            "Presentation"

    };


    return names[category] || category;

}


function formatDate(dateString) {

    if (!dateString) {
        return "No date";
    }


    return new Date(
        dateString + "T00:00:00"
    ).toLocaleDateString(
        "en-AU",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


function formatISODate(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(value) {

    return String(value)

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        );

}


// ---------- RENDER EVERYTHING ----------

function renderEverything() {

    renderTasks();

    renderTeam();

    renderDashboard();

    renderCalendar();

}


// ---------- START ----------

renderEverything();