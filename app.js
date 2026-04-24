const courseGrid = document.getElementById("courseGrid");
const template = document.getElementById("courseCardTemplate");
const resultsCount = document.getElementById("resultsCount");
const searchInput = document.getElementById("searchInput");
const previewModal = document.getElementById("previewModal");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const previewVideo = document.getElementById("previewVideo");
const modalCloseButton = document.getElementById("modalCloseButton");

let courses = [];
let lastFocusedButton = null;

function inferTypeLabel(course) {
  if (course.type) {
    return course.type;
  }

  try {
    const pathname = new URL(course.url).pathname;
    const extension = pathname.split(".").pop()?.toLowerCase();

    if (!extension) {
      return "Preview";
    }

    return extension.toUpperCase();
  } catch {
    return "Preview";
  }
}

function buildMeta(course) {
  const bits = [];

  if (course.duration) {
    bits.push(course.duration);
  }

  if (course.level) {
    bits.push(course.level);
  }

  return bits.join(" • ") || "Public preview";
}

function createCard(course) {
  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector(".course-card");
  const type = fragment.querySelector(".course-type");
  const title = fragment.querySelector(".course-title");
  const description = fragment.querySelector(".course-description");
  const tags = fragment.querySelector(".course-tags");
  const meta = fragment.querySelector(".course-meta");
  const action = fragment.querySelector(".button-card");

  type.textContent = inferTypeLabel(course);
  title.textContent = course.title;
  description.textContent = course.description;
  meta.textContent = buildMeta(course);
  action.textContent = course.ctaLabel || "Watch preview";
  action.setAttribute("aria-label", `Watch preview for ${course.title}`);
  action.addEventListener("click", () => openPreview(course, action));

  (course.tags || []).forEach((tagLabel) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = tagLabel;
    tags.appendChild(tag);
  });

  if (!(course.tags || []).length) {
    tags.remove();
  }

  card.style.animation = "fadeUp 420ms ease both";
  return fragment;
}

function openPreview(course, triggerButton) {
  lastFocusedButton = triggerButton;
  modalTitle.textContent = course.title;
  modalDescription.textContent = course.description || "Course preview video";
  previewVideo.src = course.url;
  previewVideo.poster = course.poster || "";
  previewModal.hidden = false;
  document.body.classList.add("modal-open");
  modalCloseButton.focus();
}

function closePreview() {
  previewModal.hidden = true;
  document.body.classList.remove("modal-open");
  previewVideo.pause();
  previewVideo.removeAttribute("src");
  previewVideo.load();

  if (lastFocusedButton) {
    lastFocusedButton.focus();
  }
}

function renderCourses(items) {
  courseGrid.innerHTML = "";

  if (!items.length) {
    courseGrid.innerHTML = '<div class="empty-state">No courses match this search yet.</div>';
    resultsCount.textContent = "0 courses shown";
    return;
  }

  items.forEach((course) => courseGrid.appendChild(createCard(course)));
  resultsCount.textContent = `${items.length} course${items.length === 1 ? "" : "s"} shown`;
}

function filterCourses(query) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    renderCourses(courses);
    return;
  }

  const filtered = courses.filter((course) => {
    const haystack = [course.title, course.description, ...(course.tags || [])]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });

  renderCourses(filtered);
}

async function loadCourses() {
  try {
    const response = await fetch("data/courses.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const payload = await response.json();
    courses = Array.isArray(payload.courses) ? payload.courses : [];
    renderCourses(courses);
  } catch (error) {
    courseGrid.innerHTML = `
      <div class="empty-state">
        Failed to load course data. Check <code>data/courses.json</code> and confirm your GitHub Pages deployment includes it.
      </div>
    `;
    resultsCount.textContent = "Courses unavailable";
    console.error(error);
  }
}

searchInput.addEventListener("input", (event) => {
  filterCourses(event.target.value);
});

previewModal.addEventListener("click", (event) => {
  if (event.target instanceof HTMLElement && event.target.dataset.closeModal === "true") {
    closePreview();
  }
});

modalCloseButton.addEventListener("click", closePreview);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !previewModal.hidden) {
    closePreview();
  }
});

loadCourses();