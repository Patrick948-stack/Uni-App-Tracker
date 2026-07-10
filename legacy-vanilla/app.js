/* =========================================
   University Application Hub (Vanilla JS)
   - localStorage persistence
   - loading -> onboarding -> app
   - routing (tabs)
   - theme toggle (light/dark)
   - universities CRUD (basic)
   - tasks (basic per-school + global)
   - essays (basic list + editor + word/char count + autosave)
   - export/import JSON
   ========================================= */

(() => {
    "use strict";

    /* -------------------------
       Utilities
    ------------------------- */
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const uid = () =>
        (crypto?.randomUUID?.() || `id_${Date.now()}_${Math.random().toString(16).slice(2)}`);

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

    const formatDate = (iso) => {
        if (!iso) return "—";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "—";
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    };

    const daysUntil = (iso) => {
        if (!iso) return null;
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return null;
        const now = new Date();
        // normalize to midnight
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const end = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const debounce = (fn, wait = 200) => {
        let t = null;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), wait);
        };
    };

    /* -------------------------
       Toasts
    ------------------------- */
    const toasts = $("#toasts");
    function toast(message, type = "info") {
        if (!toasts) return;
        const el = document.createElement("div");
        el.className = "toast";
        el.setAttribute("role", "status");
        el.dataset.type = type;
        el.textContent = message;

        toasts.appendChild(el);
        setTimeout(() => {
            el.style.opacity = "0";
            el.style.transform = "translateY(8px)";
            setTimeout(() => el.remove(), 250);
        }, 2400);
    }

    /* -------------------------
       Storage
    ------------------------- */
    const STORAGE_KEY = "uah:v1";

    const defaultState = () => ({
        meta: {
            version: 1,
            createdAt: new Date().toISOString(),
            theme: "light",
            focusSchoolId: null
        },
        universities: [],
        tasks: [],
        essays: [],
        storyVault: [],
        reusableBlocks: [],
        snapshots: [] // optional (we'll store essay snapshots here)
    });

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return defaultState();
            const parsed = JSON.parse(raw);
            // minimal migration safety
            return {
                ...defaultState(),
                ...parsed,
                meta: { ...defaultState().meta, ...(parsed.meta || {}) }
            };
        } catch {
            return defaultState();
        }
    }

    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    let state = loadState();

    /* -------------------------
       Theme
    ------------------------- */
    function applyTheme(theme) {
        const t = theme === "dark" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", t);
        state.meta.theme = t;
        saveState();
        // update aria-pressed on toggles if present
        const pressed = t === "dark";
        const t1 = $("#themeToggle");
        const t2 = $("#themeToggle2");
        if (t1) t1.setAttribute("aria-pressed", String(pressed));
        if (t2) t2.setAttribute("aria-pressed", String(pressed));
    }

    function toggleTheme() {
        applyTheme(state.meta.theme === "dark" ? "light" : "dark");
    }

    /* -------------------------
       Screens
    ------------------------- */
    const screenLoading = $("#screen-loading");
    const screenOnboarding = $("#screen-onboarding");
    const screenApp = $("#screen-app");

    function showScreen(which) {
        const all = [screenLoading, screenOnboarding, screenApp].filter(Boolean);
        for (const s of all) s.classList.remove("screen--active");
        if (which) which.classList.add("screen--active");
    }

    function bootFlow() {
        // If user already has data, skip onboarding.
        const hasData = state.universities.length > 0 || state.tasks.length > 0 || state.essays.length > 0;

        // show loading briefly for polish
        showScreen(screenLoading);

        // simulate "loading dashboard..."
        const ms = hasData ? 1000 : 1600;
        setTimeout(() => {
            if (hasData) {
                showScreen(screenApp);
                routeTo("overview");
                renderAll();
            } else {
                showScreen(screenOnboarding);
            }
        }, ms);
    }

    /* -------------------------
       Routing (pages)
    ------------------------- */
    function routeTo(routeName) {
        // nav buttons
        $$(".nav__item").forEach((btn) => {
            btn.classList.toggle("nav__item--active", btn.dataset.route === routeName);
        });

        // pages
        $$(".page").forEach((p) => {
            p.classList.toggle("page--active", p.dataset.page === routeName);
        });
    }

    /* -------------------------
       Data helpers
    ------------------------- */
    function getUniversityById(id) {
        return state.universities.find((u) => u.id === id) || null;
    }

    function upsertUniversity(u) {
        const idx = state.universities.findIndex((x) => x.id === u.id);
        if (idx >= 0) state.universities[idx] = u;
        else state.universities.push(u);
        saveState();
    }

    function upsertTask(t) {
        const idx = state.tasks.findIndex((x) => x.id === t.id);
        if (idx >= 0) state.tasks[idx] = t;
        else state.tasks.push(t);
        saveState();
    }

    function upsertEssay(e) {
        const idx = state.essays.findIndex((x) => x.id === e.id);
        if (idx >= 0) state.essays[idx] = e;
        else state.essays.push(e);
        saveState();
    }

    /* -------------------------
       Rendering
    ------------------------- */

    // Metrics
    function renderMetrics() {
        const elSchools = $("#metric-schools");
        const elTasks = $("#metric-tasks");
        const elEssays = $("#metric-essays");

        if (elSchools) elSchools.textContent = String(state.universities.length);

        const remainingTasks = state.tasks.filter((t) => t.status !== "done").length;
        if (elTasks) elTasks.textContent = String(remainingTasks);

        const inProgressEssays = state.essays.filter((e) => e.status !== "Final").length;
        if (elEssays) elEssays.textContent = String(inProgressEssays);
    }

    // Selects that list schools
    function renderSchoolSelects() {
        const selects = [
            $("#focusSchoolSelect"),
            $("#tasksSchoolSelect"),
            $("#essaysSchoolSelect"),
            $("#trackingSchoolSelect")
        ].filter(Boolean);

        for (const sel of selects) {
            const current = sel.value;
            sel.innerHTML = `<option value="" selected>Pick a school…</option>`;
            for (const u of state.universities) {
                const opt = document.createElement("option");
                opt.value = u.id;
                opt.textContent = u.name;
                sel.appendChild(opt);
            }
            // try restore selection if still valid
            if (state.universities.some((u) => u.id === current)) sel.value = current;
        }
    }

    // Dashboard: next deadlines
    function renderNextDeadlines() {
        const ul = $("#list-next-deadlines");
        if (!ul) return;

        ul.innerHTML = "";

        const list = [...state.universities]
            .filter((u) => !!u.deadline)
            .map((u) => ({ u, d: daysUntil(u.deadline) }))
            .filter((x) => x.d !== null)
            .sort((a, b) => a.d - b.d)
            .slice(0, 6);

        if (list.length === 0) {
            const li = document.createElement("li");
            li.textContent = "No deadlines yet. Add a university to start tracking.";
            ul.appendChild(li);
            return;
        }

        for (const item of list) {
            const li = document.createElement("li");
            const d = item.d;
            li.innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
          <div>
            <div style="font-weight:800;letter-spacing:-0.02em;">${escapeHtml(item.u.name)}</div>
            <div class="tiny muted">${escapeHtml(item.u.round || "—")} • ${formatDate(item.u.deadline)}</div>
          </div>
          <div style="font-weight:800;">
            ${d >= 0 ? `${d}d` : `+${Math.abs(d)}d`}
          </div>
        </div>
      `;
            ul.appendChild(li);
        }
    }

    // Dashboard: next actions (global tasks by urgency)
    function renderNextActions() {
        const ul = $("#list-next-actions");
        if (!ul) return;
        ul.innerHTML = "";

        const pending = state.tasks
            .filter((t) => t.status !== "done")
            .map((t) => ({
                t,
                due: t.dueDate ? daysUntil(t.dueDate) : 99999
            }))
            .sort((a, b) => a.due - b.due || priorityScore(b.t.priority) - priorityScore(a.t.priority))
            .slice(0, 6);

        if (pending.length === 0) {
            const li = document.createElement("li");
            li.textContent = "No tasks queued. Add tasks to stay on track.";
            ul.appendChild(li);
            return;
        }

        for (const { t, due } of pending) {
            const u = t.universityId ? getUniversityById(t.universityId) : null;
            const li = document.createElement("li");

            li.innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
          <div>
            <div style="font-weight:800;letter-spacing:-0.02em;">${escapeHtml(t.title)}</div>
            <div class="tiny muted">
              ${u ? escapeHtml(u.name) + " • " : ""}
              ${t.dueDate ? formatDate(t.dueDate) : "No due date"} • ${escapeHtml(t.priority || "normal")}
            </div>
          </div>
          <button class="btn btn--glass btn--small" data-action="quick-done" data-id="${t.id}" type="button">Done</button>
        </div>
      `;
            ul.appendChild(li);
        }
    }

    // Universities grid
    function renderUniversitiesGrid() {
        const grid = $("#universitiesGrid");
        if (!grid) return;
        grid.innerHTML = "";

        // basic filter/sort controls
        const statusFilter = $("#filterStatus")?.value || "";
        const sort = $("#sortUniversities")?.value || "soonest";

        let list = [...state.universities];

        if (statusFilter) list = list.filter((u) => u.status === statusFilter);

        if (sort === "alpha") list.sort((a, b) => a.name.localeCompare(b.name));
        if (sort === "soonest") {
            list.sort((a, b) => {
                const da = a.deadline ? daysUntil(a.deadline) : 99999;
                const db = b.deadline ? daysUntil(b.deadline) : 99999;
                return da - db;
            });
        }
        if (sort === "priority") list.sort((a, b) => priorityScore(b.priority) - priorityScore(a.priority));

        if (list.length === 0) {
            const empty = document.createElement("div");
            empty.className = "glass-card";
            empty.innerHTML = `
        <h2>No universities here yet</h2>
        <p class="muted">Add one, or clear filters.</p>
        <button id="btn-add-university-empty" class="btn btn--primary" type="button">+ Add University</button>
      `;
            grid.appendChild(empty);
            $("#btn-add-university-empty")?.addEventListener("click", () => openAddUniversityModal());
            return;
        }

        for (const u of list) {
            const done = countTasksDone(u.id);
            const total = countTasksTotal(u.id);
            const pct = total === 0 ? 0 : Math.round((done / total) * 100);
            const d = u.deadline ? daysUntil(u.deadline) : null;

            const card = document.createElement("article");
            card.className = "glass-card";
            card.innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
          <div style="min-width:0;">
            <div style="font-weight:900;letter-spacing:-0.02em;font-size:1.02rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${escapeHtml(u.name)}
            </div>
            <div class="tiny muted">
              ${escapeHtml(u.round || "—")}
              • ${u.deadline ? `${formatDate(u.deadline)} (${d !== null ? (d >= 0 ? `${d} days` : `${Math.abs(d)} days past`) : ""})` : "No deadline"}
            </div>
            <div class="tiny muted">Status: ${escapeHtml(u.status || "Researching")}</div>
          </div>
          <button class="btn btn--glass btn--small" type="button" data-action="open-profile" data-id="${u.id}">
            Open
          </button>
        </div>

        <div style="margin-top:12px;">
          <div class="tiny muted" style="display:flex;justify-content:space-between;">
            <span>Tasks</span><span>${done}/${total}</span>
          </div>
          <div class="progress" style="height:10px;margin:8px 0 0;">
            <div class="progress__bar" style="width:${pct}%;animation:none;"></div>
          </div>
        </div>
      `;
            grid.appendChild(card);
        }
    }

    // Tasks lists
    function renderTasks() {
        const globalList = $("#globalTaskList");
        const schoolList = $("#schoolTaskList");
        if (globalList) globalList.innerHTML = "";
        if (schoolList) schoolList.innerHTML = "";

        // global queue (sorted by due date)
        if (globalList) {
            const items = [...state.tasks]
                .sort((a, b) => {
                    const da = a.dueDate ? daysUntil(a.dueDate) : 99999;
                    const db = b.dueDate ? daysUntil(b.dueDate) : 99999;
                    return da - db || priorityScore(b.priority) - priorityScore(a.priority);
                });

            if (items.length === 0) {
                const li = document.createElement("li");
                li.textContent = "No tasks yet.";
                globalList.appendChild(li);
            } else {
                for (const t of items) globalList.appendChild(taskLi(t));
            }
        }

        // per-school
        const sel = $("#tasksSchoolSelect");
        if (schoolList && sel) {
            const schoolId = sel.value;
            const items = state.tasks.filter((t) => t.universityId === schoolId);

            if (!schoolId) {
                const li = document.createElement("li");
                li.textContent = "Pick a school to view tasks.";
                schoolList.appendChild(li);
            } else if (items.length === 0) {
                const li = document.createElement("li");
                li.textContent = "No tasks for this school yet.";
                schoolList.appendChild(li);
            } else {
                for (const t of items) schoolList.appendChild(taskLi(t));
            }
        }
    }

    function taskLi(t) {
        const li = document.createElement("li");
        const u = t.universityId ? getUniversityById(t.universityId) : null;

        li.innerHTML = `
      <div style="display:flex;gap:10px;align-items:flex-start;justify-content:space-between;">
        <div style="min-width:0;">
          <div style="font-weight:800;letter-spacing:-0.02em;">
            ${escapeHtml(t.title)}
          </div>
          <div class="tiny muted">
            ${u ? escapeHtml(u.name) + " • " : ""}
            ${t.dueDate ? formatDate(t.dueDate) : "No due date"} • ${escapeHtml(t.priority || "normal")}
          </div>
          ${t.notes ? `<div class="tiny muted" style="margin-top:6px;">${escapeHtml(t.notes)}</div>` : ""}
        </div>

        <div style="display:flex;gap:8px;flex:0 0 auto;">
          <button class="btn btn--glass btn--small" type="button" data-action="toggle-task" data-id="${t.id}">
            ${t.status === "done" ? "Undo" : "Done"}
          </button>
          <button class="btn btn--glass btn--small" type="button" data-action="edit-task" data-id="${t.id}">Edit</button>
        </div>
      </div>
    `;
        return li;
    }

    // Essays list
    let activeEssayId = null;

    function renderEssays() {
        const list = $("#essayList");
        if (!list) return;
        list.innerHTML = "";

        const schoolId = $("#essaysSchoolSelect")?.value || "";
        const items = schoolId ? state.essays.filter((e) => e.universityId === schoolId) : [];

        if (!schoolId) {
            const li = document.createElement("li");
            li.textContent = "Pick a school to see essays.";
            list.appendChild(li);
            clearEditor();
            return;
        }

        if (items.length === 0) {
            const li = document.createElement("li");
            li.textContent = "No essays yet. Add one.";
            list.appendChild(li);
            clearEditor();
            return;
        }

        for (const e of items) {
            const li = document.createElement("li");
            li.style.cursor = "pointer";
            li.innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;">
          <div style="min-width:0;">
            <div style="font-weight:900;letter-spacing:-0.02em;">
              ${escapeHtml(e.title)}
            </div>
            <div class="tiny muted">
              ${escapeHtml(e.status || "Not started")}
              • ${e.lastEdited ? `Edited: ${formatDate(e.lastEdited)}` : "Never edited"}
            </div>
          </div>
          <button class="btn btn--glass btn--small" type="button" data-action="open-essay" data-id="${e.id}">Open</button>
        </div>
      `;
            list.appendChild(li);
        }

        // if currently open essay is not in this list, clear
        if (activeEssayId && !items.some((e) => e.id === activeEssayId)) {
            clearEditor();
        }
    }

    function renderAll() {
        renderMetrics();
        renderSchoolSelects();
        renderNextDeadlines();
        renderNextActions();
        renderUniversitiesGrid();
        renderTasks();
        renderEssays();
    }

    /* -------------------------
       Modal helper
    ------------------------- */
    const modal = $("#modal");
    const modalTitle = $("#modalTitle");
    const modalBody = $("#modalBody");
    const modalConfirm = $("#modalConfirm");

    function openModal({ title, bodyHtml, onConfirm, confirmText = "Save" }) {
        if (!modal || !modalTitle || !modalBody || !modalConfirm) return;

        modalTitle.textContent = title;
        modalBody.innerHTML = bodyHtml;
        modalConfirm.textContent = confirmText;

        const handler = (ev) => {
            // "default" means confirm clicked, "cancel" or Esc closes
            if (modal.returnValue === "default") {
                try {
                    onConfirm?.();
                } catch (e) {
                    console.error(e);
                    toast("Something went wrong.", "error");
                }
            }
            modal.removeEventListener("close", handler);
        };

        modal.addEventListener("close", handler);
        modal.showModal();
    }

    /* -------------------------
       Onboarding: add first university
    ------------------------- */
    function handleOnboardingSubmit(e) {
        e.preventDefault();

        const name = $("#uniName")?.value.trim();
        if (!name) {
            toast("University name is required.");
            return;
        }

        const round = $("#appRound")?.value || "";
        const deadline = $("#deadline")?.value || "";
        const links = {
            admissions: $("#linkAdmissions")?.value.trim() || "",
            npc: $("#linkNPC")?.value.trim() || "",
            portal: $("#linkPortal")?.value.trim() || ""
        };

        const uni = makeUniversity({ name, round, deadline, links });
        state.universities.push(uni);
        saveState();

        toast("University added!");
        showScreen(screenApp);
        routeTo("overview");
        renderAll();
    }

    function makeUniversity({ name, round = "", deadline = "", links = {} }) {
        return {
            id: uid(),
            name,
            round,
            deadline: deadline || "",
            status: "Researching",
            priority: "normal",
            tags: [],
            links: {
                admissions: links.admissions || "",
                npc: links.npc || "",
                portal: links.portal || ""
            },
            notes: {
                admissions: "",
                academics: "",
                location: "",
                cost: "",
                outcomes: ""
            },
            lists: {
                courses: [],
                research: [],
                clubs: []
            },
            createdAt: new Date().toISOString()
        };
    }

    function loadDemoData() {
        const u1 = makeUniversity({
            name: "Example University",
            round: "RD",
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 40).toISOString().slice(0, 10),
            links: { admissions: "https://example.com/admissions" }
        });

        const u2 = makeUniversity({
            name: "North Valley College",
            round: "EA",
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18).toISOString().slice(0, 10),
            links: { npc: "https://example.com/npc" }
        });

        state.universities.push(u1, u2);

        state.tasks.push(
            {
                id: uid(),
                universityId: u2.id,
                title: "Request counselor recommendation",
                dueDate: u2.deadline,
                priority: "high",
                status: "todo",
                notes: ""
            },
            {
                id: uid(),
                universityId: u1.id,
                title: "Draft supplemental #1",
                dueDate: "",
                priority: "normal",
                status: "todo",
                notes: "Find prompt on admissions site."
            }
        );

        state.essays.push({
            id: uid(),
            universityId: u1.id,
            title: "Why this college?",
            prompt: "Describe why you want to attend.",
            wordLimit: 250,
            status: "Draft",
            bodyHtml: "<p>I’m excited about…</p>",
            lastEdited: new Date().toISOString()
        });

        saveState();
        toast("Demo data loaded!");
        showScreen(screenApp);
        routeTo("overview");
        renderAll();
    }

    /* -------------------------
       Universities: add + profile
    ------------------------- */
    function openAddUniversityModal() {
        openModal({
            title: "Add University",
            confirmText: "Add",
            bodyHtml: `
        <div class="form">
          <div class="form-row">
            <label for="m_uniName">University name <span class="req">*</span></label>
            <input id="m_uniName" type="text" placeholder="e.g., MIT" required />
          </div>

          <div class="form-row">
            <label for="m_round">Application round</label>
            <select id="m_round">
              <option value="" selected>Choose one</option>
              <option value="ED">ED</option>
              <option value="EA">EA</option>
              <option value="REA">REA</option>
              <option value="RD">RD</option>
              <option value="Rolling">Rolling</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="form-row">
            <label for="m_deadline">Deadline</label>
            <input id="m_deadline" type="date" />
          </div>

          <div class="form-row">
            <label for="m_status">Status</label>
            <select id="m_status">
              <option value="Researching" selected>Researching</option>
              <option value="Drafting">Drafting</option>
              <option value="Submitted">Submitted</option>
            </select>
          </div>

          <div class="form-row">
            <label for="m_adm">Admissions link</label>
            <input id="m_adm" type="url" placeholder="https://…" />
          </div>
          <div class="form-row">
            <label for="m_npc">Net price calculator</label>
            <input id="m_npc" type="url" placeholder="https://…" />
          </div>
          <div class="form-row">
            <label for="m_portal">Portal link</label>
            <input id="m_portal" type="url" placeholder="https://…" />
          </div>
        </div>
      `,
            onConfirm: () => {
                const name = $("#m_uniName")?.value.trim();
                if (!name) {
                    toast("University name is required.");
                    return;
                }

                const uni = makeUniversity({
                    name,
                    round: $("#m_round")?.value || "",
                    deadline: $("#m_deadline")?.value || "",
                    links: {
                        admissions: $("#m_adm")?.value.trim() || "",
                        npc: $("#m_npc")?.value.trim() || "",
                        portal: $("#m_portal")?.value.trim() || ""
                    }
                });

                uni.status = $("#m_status")?.value || "Researching";

                state.universities.push(uni);
                saveState();
                renderAll();
                toast("University added.");
            }
        });
    }

    const profilePanel = $("#schoolProfilePanel");
    const profileName = $("#schoolProfileName");
    const profileMeta = $("#schoolProfileMeta");

    let activeProfileSchoolId = null;

    function openSchoolProfile(schoolId) {
        const u = getUniversityById(schoolId);
        if (!u || !profilePanel) return;

        activeProfileSchoolId = u.id;
        profilePanel.hidden = false;

        if (profileName) profileName.textContent = u.name;
        if (profileMeta) profileMeta.textContent = `${u.round || "—"} • Deadline: ${formatDate(u.deadline)}`;

        // fill basic notes fields (if they exist)
        $("#admissionsNotes") && ($("#admissionsNotes").value = u.notes.admissions || "");
        $("#academicsNotes") && ($("#academicsNotes").value = u.notes.academics || "");
        $("#locationNotes") && ($("#locationNotes").value = u.notes.location || "");
        $("#costNotes") && ($("#costNotes").value = u.notes.cost || "");
        $("#outcomesNotes") && ($("#outcomesNotes").value = u.notes.outcomes || "");
        $("#profilePortal") && ($("#profilePortal").value = u.links.portal || "");
        $("#profileFee") && ($("#profileFee").value = u.feeNotes || "");

        // render small lists
        renderProfileLists(u);
    }

    function closeSchoolProfile() {
        if (!profilePanel) return;
        profilePanel.hidden = true;
        activeProfileSchoolId = null;
    }

    function renderProfileLists(u) {
        // Courses
        const courses = $("#coursesList");
        if (courses) {
            courses.innerHTML = "";
            if (!u.lists.courses.length) {
                const d = document.createElement("div");
                d.className = "tiny muted";
                d.textContent = "No courses saved yet.";
                courses.appendChild(d);
            } else {
                for (const c of u.lists.courses) {
                    const item = document.createElement("div");
                    item.className = "glass-subcard";
                    item.innerHTML = `
            <div style="font-weight:800;">${escapeHtml(c.name)}</div>
            <div class="tiny muted">${escapeHtml(c.tag || "—")}${c.link ? ` • ${escapeHtml(c.link)}` : ""}</div>
            ${c.notes ? `<div class="tiny muted" style="margin-top:6px;">${escapeHtml(c.notes)}</div>` : ""}
          `;
                    courses.appendChild(item);
                }
            }
        }

        // Research
        const research = $("#researchList");
        if (research) {
            research.innerHTML = "";
            if (!u.lists.research.length) {
                const d = document.createElement("div");
                d.className = "tiny muted";
                d.textContent = "No research notes saved yet.";
                research.appendChild(d);
            } else {
                for (const r of u.lists.research) {
                    const item = document.createElement("div");
                    item.className = "glass-subcard";
                    item.innerHTML = `
            <div style="font-weight:800;">${escapeHtml(r.title)}</div>
            <div class="tiny muted">${r.link ? escapeHtml(r.link) : "—"}</div>
            ${r.notes ? `<div class="tiny muted" style="margin-top:6px;">${escapeHtml(r.notes)}</div>` : ""}
          `;
                    research.appendChild(item);
                }
            }
        }

        // Clubs
        const clubs = $("#clubsList");
        if (clubs) {
            clubs.innerHTML = "";
            if (!u.lists.clubs.length) {
                const d = document.createElement("div");
                d.className = "tiny muted";
                d.textContent = "No clubs saved yet.";
                clubs.appendChild(d);
            } else {
                for (const c of u.lists.clubs) {
                    const item = document.createElement("div");
                    item.className = "glass-subcard";
                    item.innerHTML = `
            <div style="font-weight:800;">${escapeHtml(c.name)}</div>
            <div class="tiny muted">${escapeHtml(c.tag || "—")}${c.link ? ` • ${escapeHtml(c.link)}` : ""}</div>
            ${c.notes ? `<div class="tiny muted" style="margin-top:6px;">${escapeHtml(c.notes)}</div>` : ""}
          `;
                    clubs.appendChild(item);
                }
            }
        }
    }

    function saveProfileFieldChanges() {
        if (!activeProfileSchoolId) return;
        const u = getUniversityById(activeProfileSchoolId);
        if (!u) return;

        if ($("#admissionsNotes")) u.notes.admissions = $("#admissionsNotes").value;
        if ($("#academicsNotes")) u.notes.academics = $("#academicsNotes").value;
        if ($("#locationNotes")) u.notes.location = $("#locationNotes").value;
        if ($("#costNotes")) u.notes.cost = $("#costNotes").value;
        if ($("#outcomesNotes")) u.notes.outcomes = $("#outcomesNotes").value;

        if ($("#profilePortal")) u.links.portal = $("#profilePortal").value.trim();
        if ($("#profileFee")) u.feeNotes = $("#profileFee").value.trim();

        upsertUniversity(u);
        // keep meta updated
        if (profileMeta) profileMeta.textContent = `${u.round || "—"} • Deadline: ${formatDate(u.deadline)}`;
    }

    /* -------------------------
       Tasks: add/edit/toggle
    ------------------------- */
    function openTaskModal({ mode, task, universityId }) {
        const isEdit = mode === "edit";
        const t = task || {
            id: uid(),
            universityId: universityId || "",
            title: "",
            dueDate: "",
            priority: "normal",
            status: "todo",
            notes: ""
        };

        openModal({
            title: isEdit ? "Edit Task" : "Add Task",
            confirmText: isEdit ? "Save" : "Add",
            bodyHtml: `
        <div class="form">
          <div class="form-row">
            <label for="m_task_title">Title <span class="req">*</span></label>
            <input id="m_task_title" type="text" value="${escapeAttr(t.title)}" placeholder="e.g., Request transcript" />
          </div>

          <div class="form-row">
            <label for="m_task_school">School</label>
            <select id="m_task_school">
              <option value="">(Global / none)</option>
              ${state.universities
                    .map((u) => `<option value="${u.id}" ${u.id === t.universityId ? "selected" : ""}>${escapeHtml(u.name)}</option>`)
                    .join("")}
            </select>
          </div>

          <div class="form-row">
            <label for="m_task_due">Due date</label>
            <input id="m_task_due" type="date" value="${escapeAttr(t.dueDate)}" />
          </div>

          <div class="form-row">
            <label for="m_task_priority">Priority</label>
            <select id="m_task_priority">
              ${["low", "normal", "high"].map((p) => `<option value="${p}" ${p === (t.priority || "normal") ? "selected" : ""}>${p}</option>`).join("")}
            </select>
          </div>

          <div class="form-row">
            <label for="m_task_notes">Notes</label>
            <textarea id="m_task_notes" placeholder="Optional…">${escapeHtml(t.notes || "")}</textarea>
          </div>
        </div>
      `,
            onConfirm: () => {
                const title = $("#m_task_title")?.value.trim();
                if (!title) {
                    toast("Task title is required.");
                    return;
                }

                t.title = title;
                t.universityId = $("#m_task_school")?.value || "";
                t.dueDate = $("#m_task_due")?.value || "";
                t.priority = $("#m_task_priority")?.value || "normal";
                t.notes = $("#m_task_notes")?.value || "";

                upsertTask(t);
                renderAll();
                toast(isEdit ? "Task updated." : "Task added.");
            }
        });
    }

    function toggleTaskDone(taskId) {
        const t = state.tasks.find((x) => x.id === taskId);
        if (!t) return;
        t.status = t.status === "done" ? "todo" : "done";
        upsertTask(t);
        renderAll();
    }

    /* -------------------------
       Essays: add/open/save/snapshot
    ------------------------- */
    const richEditor = $("#richEditor");
    const essayPrompt = $("#essayPrompt");
    const wordLimitInput = $("#wordLimit");
    const editorStatus = $("#editorStatus");
    const wordCountEl = $("#wordCount");
    const charCountEl = $("#charCount");
    const limitWarning = $("#limitWarning");

    function clearEditor() {
        activeEssayId = null;
        if (essayPrompt) essayPrompt.value = "";
        if (wordLimitInput) wordLimitInput.value = "";
        if (richEditor) richEditor.innerHTML = "";
        if (editorStatus) editorStatus.textContent = "Not started";
        updateCounts();
    }

    function openAddEssayModal() {
        const schoolId = $("#essaysSchoolSelect")?.value || "";
        if (!schoolId) {
            toast("Pick a school first.");
            return;
        }

        openModal({
            title: "Add Essay",
            confirmText: "Add",
            bodyHtml: `
        <div class="form">
          <div class="form-row">
            <label for="m_essay_title">Title <span class="req">*</span></label>
            <input id="m_essay_title" type="text" placeholder="e.g., Why this college?" />
          </div>
          <div class="form-row">
            <label for="m_essay_prompt">Prompt</label>
            <textarea id="m_essay_prompt" placeholder="Paste the prompt…"></textarea>
          </div>
          <div class="form-row">
            <label for="m_essay_limit">Word limit</label>
            <input id="m_essay_limit" type="number" min="0" placeholder="e.g., 250" />
          </div>
          <div class="form-row">
            <label for="m_essay_status">Status</label>
            <select id="m_essay_status">
              <option>Not started</option>
              <option selected>Draft</option>
              <option>Revised</option>
              <option>Final</option>
            </select>
          </div>
        </div>
      `,
            onConfirm: () => {
                const title = $("#m_essay_title")?.value.trim();
                if (!title) {
                    toast("Essay title is required.");
                    return;
                }

                const e = {
                    id: uid(),
                    universityId: schoolId,
                    title,
                    prompt: $("#m_essay_prompt")?.value || "",
                    wordLimit: parseInt($("#m_essay_limit")?.value || "0", 10) || 0,
                    status: $("#m_essay_status")?.value || "Draft",
                    bodyHtml: "",
                    lastEdited: ""
                };

                upsertEssay(e);
                renderAll();
                toast("Essay added.");
            }
        });
    }

    function openEssay(essayId) {
        const e = state.essays.find((x) => x.id === essayId);
        if (!e) return;

        activeEssayId = e.id;

        if (essayPrompt) essayPrompt.value = e.prompt || "";
        if (wordLimitInput) wordLimitInput.value = e.wordLimit ? String(e.wordLimit) : "";
        if (richEditor) richEditor.innerHTML = e.bodyHtml || "";
        if (editorStatus) editorStatus.textContent = e.status || "Not started";

        updateCounts();
        toast("Essay loaded.");
    }

    function saveActiveEssay() {
        if (!activeEssayId) {
            toast("Open an essay first.");
            return;
        }

        const e = state.essays.find((x) => x.id === activeEssayId);
        if (!e) return;

        e.prompt = essayPrompt ? essayPrompt.value : "";
        e.wordLimit = parseInt(wordLimitInput?.value || "0", 10) || 0;
        e.bodyHtml = richEditor ? richEditor.innerHTML : "";
        e.lastEdited = new Date().toISOString();

        // auto status upgrade if empty -> Draft
        const text = getEditorPlainText();
        if (text.trim().length === 0) e.status = "Not started";
        else if (e.status === "Not started") e.status = "Draft";

        upsertEssay(e);
        renderAll();
        toast("Saved.");
    }

    function snapshotActiveEssay() {
        if (!activeEssayId) {
            toast("Open an essay first.");
            return;
        }
        const e = state.essays.find((x) => x.id === activeEssayId);
        if (!e) return;

        const snap = {
            id: uid(),
            essayId: e.id,
            title: `Snapshot • ${new Date().toLocaleString()}`,
            bodyHtml: richEditor ? richEditor.innerHTML : "",
            createdAt: new Date().toISOString()
        };

        state.snapshots.push(snap);
        saveState();
        toast("Snapshot saved.");
    }

    function getEditorPlainText() {
        if (!richEditor) return "";
        // innerText gives better “what you see” for contenteditable
        return richEditor.innerText || "";
    }

    function countWords(text) {
        const t = (text || "").trim();
        if (!t) return 0;
        return t.split(/\s+/).filter(Boolean).length;
    }

    function updateCounts() {
        const text = getEditorPlainText();
        const words = countWords(text);
        const chars = text.length;

        if (wordCountEl) wordCountEl.textContent = `${words} words`;
        if (charCountEl) charCountEl.textContent = `${chars} chars`;

        const limit = parseInt(wordLimitInput?.value || "0", 10) || 0;
        if (limitWarning) {
            if (!limit) {
                limitWarning.textContent = "";
            } else {
                const diff = limit - words;
                if (diff >= 0) limitWarning.textContent = `${diff} words remaining`;
                else limitWarning.textContent = `${Math.abs(diff)} words over limit`;
            }
        }
    }

    // toolbar actions (execCommand is deprecated but still widely supported for prototypes)
    function handleToolbarClick(btn) {
        if (!richEditor) return;
        const cmd = btn.dataset.cmd;
        if (!cmd) return;

        richEditor.focus();

        if (cmd === "formatBlock") {
            const value = btn.dataset.value || "p";
            document.execCommand("formatBlock", false, value);
            updateCounts();
            return;
        }

        document.execCommand(cmd, false, null);
        updateCounts();
    }

    /* -------------------------
       Export / Import / Reset
    ------------------------- */
    function exportJSON() {
        const payload = JSON.stringify(state, null, 2);
        const blob = new Blob([payload], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `university-application-hub-backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);
        toast("Exported JSON.");
    }

    function importJSONFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(String(reader.result || "{}"));
                // validate minimal shape
                if (!parsed || typeof parsed !== "object") throw new Error("Invalid JSON");

                state = {
                    ...defaultState(),
                    ...parsed,
                    meta: { ...defaultState().meta, ...(parsed.meta || {}) }
                };
                saveState();
                applyTheme(state.meta.theme);
                renderAll();
                toast("Import complete.");
                showScreen(screenApp);
                routeTo("overview");
            } catch (e) {
                console.error(e);
                toast("Import failed. Make sure it's a valid backup JSON.", "error");
            }
        };
        reader.readAsText(file);
    }

    function resetAllData() {
        openModal({
            title: "Reset all data?",
            confirmText: "Reset",
            bodyHtml: `
        <p class="muted">
          This will permanently clear your local data for this app on this device.
        </p>
      `,
            onConfirm: () => {
                localStorage.removeItem(STORAGE_KEY);
                state = defaultState();
                applyTheme("light");
                toast("Data reset.");
                showScreen(screenOnboarding);
            }
        });
    }

    /* -------------------------
       Focus mode (simple)
    ------------------------- */
    function startFocus() {
        const sel = $("#focusSchoolSelect");
        if (!sel || !sel.value) {
            toast("Pick a school first.");
            return;
        }
        state.meta.focusSchoolId = sel.value;
        saveState();
        toast("Focus mode enabled.");
    }

    function endFocus() {
        state.meta.focusSchoolId = null;
        saveState();
        toast("Focus mode ended.");
    }

    /* -------------------------
       Event wiring
    ------------------------- */
    function wireEvents() {
        // theme toggles
        $("#themeToggle")?.addEventListener("click", toggleTheme);
        $("#themeToggle2")?.addEventListener("click", toggleTheme);

        // onboarding
        $("#form-add-university")?.addEventListener("submit", handleOnboardingSubmit);
        $("#btn-demo-data")?.addEventListener("click", loadDemoData);

        // nav routing
        $$(".nav__item").forEach((btn) => {
            btn.addEventListener("click", () => {
                routeTo(btn.dataset.route);
                // render after switching
                renderAll();
            });
        });

        // top search (prototype: filter university grid + tasks + essays by keyword)
        $("#globalSearch")?.addEventListener(
            "input",
            debounce((e) => applySearch(e.target.value), 120)
        );

        $("#btn-clear-search")?.addEventListener("click", () => {
            const s = $("#globalSearch");
            if (s) s.value = "";
            applySearch("");
        });

        // export/import (topbar + storage page)
        $("#btn-export")?.addEventListener("click", exportJSON);
        $("#btn-export2")?.addEventListener("click", exportJSON);

        $("#importFile")?.addEventListener("change", (e) => importJSONFile(e.target.files?.[0]));
        $("#importFile2")?.addEventListener("change", (e) => importJSONFile(e.target.files?.[0]));

        $("#btn-reset")?.addEventListener("click", resetAllData);

        // dashboard buttons
        $("#btn-add-uni-quick")?.addEventListener("click", openAddUniversityModal);
        $("#btn-focus-next3")?.addEventListener("click", () => {
            routeTo("tasks");
            renderAll();
        });

        $("#btn-start-focus")?.addEventListener("click", startFocus);
        $("#btn-end-focus")?.addEventListener("click", endFocus);

        // universities controls
        $("#btn-add-university")?.addEventListener("click", openAddUniversityModal);
        $("#filterStatus")?.addEventListener("change", renderUniversitiesGrid);
        $("#sortUniversities")?.addEventListener("change", renderUniversitiesGrid);

        // open profile (delegated)
        $("#universitiesGrid")?.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-action='open-profile']");
            if (!btn) return;
            openSchoolProfile(btn.dataset.id);
        });

        $("#btn-close-profile")?.addEventListener("click", closeSchoolProfile);

        // profile subtabs
        $$(".tab").forEach((tab) => {
            tab.addEventListener("click", () => {
                const key = tab.dataset.subtab;
                $$(".tab").forEach((t) => t.classList.toggle("tab--active", t === tab));
                $$(".subpage").forEach((s) => s.classList.toggle("subpage--active", s.dataset.subpage === key));
            });
        });

        // profile fields autosave
        const profileInputs = [
            "#admissionsNotes",
            "#academicsNotes",
            "#locationNotes",
            "#costNotes",
            "#outcomesNotes",
            "#profilePortal",
            "#profileFee"
        ];
        profileInputs.forEach((sel) => {
            $(sel)?.addEventListener("input", debounce(saveProfileFieldChanges, 200));
        });

        // tasks page: selects + add buttons
        $("#tasksSchoolSelect")?.addEventListener("change", renderTasks);
        $("#btn-add-task-global")?.addEventListener("click", () => openTaskModal({ mode: "add" }));
        $("#btn-add-task-school")?.addEventListener("click", () => {
            const schoolId = $("#tasksSchoolSelect")?.value || "";
            if (!schoolId) return toast("Pick a school first.");
            openTaskModal({ mode: "add", universityId: schoolId });
        });

        // tasks list delegation
        $("#globalTaskList")?.addEventListener("click", handleTaskListClick);
        $("#schoolTaskList")?.addEventListener("click", handleTaskListClick);

        // dashboard quick done delegation
        $("#list-next-actions")?.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-action='quick-done']");
            if (!btn) return;
            toggleTaskDone(btn.dataset.id);
        });

        // essays
        $("#essaysSchoolSelect")?.addEventListener("change", () => {
            renderEssays();
        });

        $("#btn-add-essay")?.addEventListener("click", openAddEssayModal);

        $("#essayList")?.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-action='open-essay']");
            if (!btn) return;
            openEssay(btn.dataset.id);
        });

        // editor toolbar
        $$(".toolbar .icon-btn").forEach((btn) => {
            btn.addEventListener("click", () => handleToolbarClick(btn));
        });

        // editor autosave + counters
        const saveDebounced = debounce(() => {
            if (activeEssayId) saveActiveEssay();
        }, 500);

        richEditor?.addEventListener("input", () => {
            updateCounts();
            saveDebounced();
        });

        essayPrompt?.addEventListener("input", saveDebounced);
        wordLimitInput?.addEventListener("input", () => {
            updateCounts();
            saveDebounced();
        });

        $("#btn-save-essay")?.addEventListener("click", saveActiveEssay);
        $("#btn-save-snapshot")?.addEventListener("click", snapshotActiveEssay);

        // storage: autosnapshot toggle (simple)
        $("#toggle-autosnapshot")?.addEventListener("change", (e) => {
            state.meta.autoSnapshot = !!e.target.checked;
            saveState();
            toast(state.meta.autoSnapshot ? "Daily auto-snapshot enabled." : "Daily auto-snapshot disabled.");
        });
    }

    function handleTaskListClick(e) {
        const toggleBtn = e.target.closest("[data-action='toggle-task']");
        if (toggleBtn) return toggleTaskDone(toggleBtn.dataset.id);

        const editBtn = e.target.closest("[data-action='edit-task']");
        if (editBtn) {
            const t = state.tasks.find((x) => x.id === editBtn.dataset.id);
            if (!t) return;
            return openTaskModal({ mode: "edit", task: { ...t } });
        }
    }

    /* -------------------------
       Search (prototype filtering)
    ------------------------- */
    function applySearch(query) {
        const q = (query || "").trim().toLowerCase();

        // For v1: we just filter Universities grid & the dashboard lists
        // (tasks/essays are still accessible via their tabs).
        if (!q) {
            renderUniversitiesGrid();
            renderNextDeadlines();
            renderNextActions();
            return;
        }

        // filter universities
        const grid = $("#universitiesGrid");
        if (grid) {
            const matches = state.universities.filter((u) => {
                const hay = [
                    u.name,
                    u.round,
                    u.status,
                    ...(u.tags || []),
                    u.notes?.admissions,
                    u.notes?.academics,
                    u.notes?.cost
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                return hay.includes(q);
            });

            // temporarily render matching
            const prev = state.universities;
            // hack: render function reads state; easier: render manually here
            grid.innerHTML = "";
            if (matches.length === 0) {
                const empty = document.createElement("div");
                empty.className = "glass-card";
                empty.innerHTML = `<h2>No results</h2><p class="muted">Try a different search.</p>`;
                grid.appendChild(empty);
            } else {
                for (const u of matches) {
                    const done = countTasksDone(u.id);
                    const total = countTasksTotal(u.id);
                    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
                    const d = u.deadline ? daysUntil(u.deadline) : null;

                    const card = document.createElement("article");
                    card.className = "glass-card";
                    card.innerHTML = `
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
              <div style="min-width:0;">
                <div style="font-weight:900;letter-spacing:-0.02em;font-size:1.02rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${escapeHtml(u.name)}
                </div>
                <div class="tiny muted">
                  ${escapeHtml(u.round || "—")}
                  • ${u.deadline ? `${formatDate(u.deadline)} (${d !== null ? (d >= 0 ? `${d} days` : `${Math.abs(d)} days past`) : ""})` : "No deadline"}
                </div>
                <div class="tiny muted">Status: ${escapeHtml(u.status || "Researching")}</div>
              </div>
              <button class="btn btn--glass btn--small" type="button" data-action="open-profile" data-id="${u.id}">
                Open
              </button>
            </div>

            <div style="margin-top:12px;">
              <div class="tiny muted" style="display:flex;justify-content:space-between;">
                <span>Tasks</span><span>${done}/${total}</span>
              </div>
              <div class="progress" style="height:10px;margin:8px 0 0;">
                <div class="progress__bar" style="width:${pct}%;animation:none;"></div>
              </div>
            </div>
          `;
                    grid.appendChild(card);
                }
            }
            // keep prev untouched
            state.universities = prev;
        }

        // dashboard lists filtered (by school name & task title)
        const deadlinesUl = $("#list-next-deadlines");
        if (deadlinesUl) {
            deadlinesUl.innerHTML = "";
            const list = state.universities
                .filter((u) => (u.name || "").toLowerCase().includes(q))
                .filter((u) => !!u.deadline)
                .map((u) => ({ u, d: daysUntil(u.deadline) }))
                .filter((x) => x.d !== null)
                .sort((a, b) => a.d - b.d)
                .slice(0, 6);

            if (list.length === 0) {
                const li = document.createElement("li");
                li.textContent = "No deadline matches.";
                deadlinesUl.appendChild(li);
            } else {
                for (const item of list) {
                    const li = document.createElement("li");
                    const d = item.d;
                    li.innerHTML = `
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
              <div>
                <div style="font-weight:800;letter-spacing:-0.02em;">${escapeHtml(item.u.name)}</div>
                <div class="tiny muted">${escapeHtml(item.u.round || "—")} • ${formatDate(item.u.deadline)}</div>
              </div>
              <div style="font-weight:800;">
                ${d >= 0 ? `${d}d` : `+${Math.abs(d)}d`}
              </div>
            </div>
          `;
                    deadlinesUl.appendChild(li);
                }
            }
        }

        const actionsUl = $("#list-next-actions");
        if (actionsUl) {
            actionsUl.innerHTML = "";
            const pending = state.tasks
                .filter((t) => t.status !== "done")
                .filter((t) => (t.title || "").toLowerCase().includes(q))
                .map((t) => ({ t, due: t.dueDate ? daysUntil(t.dueDate) : 99999 }))
                .sort((a, b) => a.due - b.due)
                .slice(0, 6);

            if (pending.length === 0) {
                const li = document.createElement("li");
                li.textContent = "No task matches.";
                actionsUl.appendChild(li);
            } else {
                for (const { t } of pending) {
                    const u = t.universityId ? getUniversityById(t.universityId) : null;
                    const li = document.createElement("li");
                    li.innerHTML = `
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
              <div>
                <div style="font-weight:800;letter-spacing:-0.02em;">${escapeHtml(t.title)}</div>
                <div class="tiny muted">
                  ${u ? escapeHtml(u.name) + " • " : ""}
                  ${t.dueDate ? formatDate(t.dueDate) : "No due date"} • ${escapeHtml(t.priority || "normal")}
                </div>
              </div>
              <button class="btn btn--glass btn--small" data-action="quick-done" data-id="${t.id}" type="button">Done</button>
            </div>
          `;
                    actionsUl.appendChild(li);
                }
            }
        }
    }

    /* -------------------------
       Helpers: scoring & counts
    ------------------------- */
    function priorityScore(p) {
        if (p === "high") return 3;
        if (p === "normal") return 2;
        if (p === "low") return 1;
        return 2;
    }

    function countTasksTotal(universityId) {
        return state.tasks.filter((t) => t.universityId === universityId).length;
    }

    function countTasksDone(universityId) {
        return state.tasks.filter((t) => t.universityId === universityId && t.status === "done").length;
    }

    /* -------------------------
       XSS-safe helpers for HTML injection
    ------------------------- */
    function escapeHtml(str) {
        return String(str ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function escapeAttr(str) {
        // same as escapeHtml, used for value=""
        return escapeHtml(str).replaceAll("\n", " ");
    }

    /* -------------------------
       Init
    ------------------------- */
    function init() {
        applyTheme(state.meta.theme || "light");
        wireEvents();
        bootFlow();

        // daily auto-snapshot (optional): check once on load
        maybeDailySnapshot();
    }

    function maybeDailySnapshot() {
        if (!state.meta.autoSnapshot) return;

        const key = "uah:lastSnapshotDate";
        const today = new Date().toISOString().slice(0, 10);
        const last = localStorage.getItem(key);

        if (last !== today) {
            // store a lightweight snapshot (full state is okay for prototype)
            state.snapshots.push({
                id: uid(),
                title: `Daily snapshot • ${today}`,
                createdAt: new Date().toISOString(),
                state: JSON.parse(JSON.stringify(state))
            });
            localStorage.setItem(key, today);
            saveState();
            toast("Daily snapshot saved.");
        }

        // reflect toggle UI
        const t = $("#toggle-autosnapshot");
        if (t) t.checked = !!state.meta.autoSnapshot;
    }

    // run
    document.addEventListener("DOMContentLoaded", init);
})();
