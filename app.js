const courseGrid = document.getElementById("courseGrid");
const template = document.getElementById("courseCardTemplate");
const resultsCount = document.getElementById("resultsCount");
const searchInput = document.getElementById("searchInput");

let courses = [];

function getManifestUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("manifest") || "courses.json";
}

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
  action.href = course.url;
  action.textContent = course.ctaLabel || "Open preview";
  action.setAttribute("aria-label", `Open preview for ${course.title}`);

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
    const manifestUrl = getManifestUrl();
    const response = await fetch(manifestUrl, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const payload = await response.json();
    courses = Array.isArray(payload.courses) ? payload.courses : [];
    renderCourses(courses);
  } catch (error) {
    courseGrid.innerHTML = `
      <div class="empty-state">
        Failed to load course data. Check your manifest file and confirm it is publicly reachable from the browser.
      </div>
    `;
    resultsCount.textContent = "Courses unavailable";
    console.error(error);
  }
}

searchInput.addEventListener("input", (event) => {
  filterCourses(event.target.value);
});

loadCourses();