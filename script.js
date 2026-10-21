
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const subjectInput = document.getElementById("subject");
const deadlineInput = document.getElementById("deadline");
const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const taskCount = document.getElementById("taskCount");
const filterButtons = document.querySelectorAll(".filter-button");

let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem("studyPlannerTasks") || "[]"
    );

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(
            task =>
                task &&
                typeof task.id === "string" &&
                typeof task.title === "string" &&
                typeof task.subject === "string" &&
                typeof task.deadline === "string" &&
                typeof task.completed === "boolean"
        );
    }
} catch (error) {
    tasks = [];
}

let currentFilter = "all";

const today = new Date();
const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

deadlineInput.min = localToday;

function saveTasks() {
    localStorage.setItem("studyPlannerTasks", JSON.stringify(tasks));
}

function formatDate(dateString) {
    if (!dateString) return "No deadline";

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return "Invalid date";
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function updateStats() {
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;

    totalTasks.textContent = tasks.length;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
    taskCount.textContent = `${tasks.length} ${
        tasks.length === 1 ? "task" : "tasks"
    }`;
}

function createTaskElement(task) {
    const item = document.createElement("article");
    item.className = `task-item${task.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete ${task.title}`);

    checkbox.addEventListener("change", () => {
        toggleTask(task.id);
    });

    const details = document.createElement("div");
    details.className = "task-details";

    const title = document.createElement("p");
    title.className = "task-title";
    title.textContent = task.title;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const subject = document.createElement("span");
    subject.className = "subject-tag";
    subject.textContent = task.subject;

    const deadline = document.createElement("span");
    deadline.className = "deadline";
    deadline.textContent = `Due ${formatDate(task.deadline)}`;

    if (!task.completed && task.deadline < localToday) {
        deadline.classList.add("overdue");
        deadline.textContent += " · Overdue";
    }

    meta.append(subject, deadline);
    details.append(title, meta);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Delete ${task.title}`);

    deleteButton.addEventListener("click", () => {
        deleteTask(task.id);
    });

    item.append(checkbox, details, deleteButton);

    return item;
}

function renderTasks() {
    taskList.replaceChildren();

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "pending") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";

        const icon = document.createElement("span");
        icon.className = "empty-icon";
        icon.textContent = "✎";

        const heading = document.createElement("h3");
        const message = document.createElement("p");

        if (tasks.length === 0) {
            heading.textContent = "Your study space is ready!";
            message.textContent = "Add your first task to get started.";
        } else if (currentFilter === "pending") {
            heading.textContent = "All caught up!";
            message.textContent = "There are no pending tasks.";
        } else if (currentFilter === "completed") {
            heading.textContent = "Nothing completed yet";
            message.textContent = "Complete a task to see it here.";
        } else {
            heading.textContent = "No tasks found";
            message.textContent = "Add a task to get started.";
        }

        emptyState.append(icon, heading, message);
        taskList.append(emptyState);
    } else {
        filteredTasks
            .slice()
            .sort((a, b) => a.deadline.localeCompare(b.deadline))
            .forEach(task => {
                taskList.append(createTaskElement(task));
            });
    }

    updateStats();
}

function addTask(title, subject, deadline) {
    tasks.push({
        id: crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
        title,
        subject,
        deadline,
        completed: false
    });

    saveTasks();
    renderTasks();
}

function toggleTask(id) {
    tasks = tasks.map(task =>
        task.id === id
            ? { ...task, completed: !task.completed }
            : task
    );

    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
}

taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const title = taskTitle.value.trim();
    const subject = subjectInput.value;
    const deadline = deadlineInput.value;

    if (!title || !subject || !deadline) {
        alert("Please fill in all fields.");
        return;
    }

    if (deadline < localToday) {
        alert("Please select today or a future date.");
        return;
    }

    addTask(title, subject, deadline);

    taskForm.reset();
    deadlineInput.min = localToday;
    taskTitle.focus();
});

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(filterButton => {
            const isActive = filterButton === button;

            filterButton.classList.toggle("active", isActive);
            filterButton.setAttribute("aria-pressed", String(isActive));
        });

        renderTasks();
    });
});

filterButtons.forEach(button => {
    button.setAttribute(
        "aria-pressed",
        String(button.dataset.filter === currentFilter)
    );
});

renderTasks();
