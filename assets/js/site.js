const CONTENT_FILE = "/content/portfolio-content.json";

const page = document.body.dataset.page;
const pageTitles = {
  home: "Portfolio",
  skills: "Technical Skills",
  outages: "Incidents and Outages",
  projects: "Projects and Innovations",
  experience: "Experience",
};

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return map[char];
  });

const setText = (selector, value) => {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value;
  }
};

const setHtml = (selector, value) => {
  const element = document.querySelector(selector);

  if (element) {
    element.innerHTML = value;
  }
};

const setLink = (selector, href, label) => {
  const element = document.querySelector(selector);

  if (!element) {
    return;
  }

  element.href = href;

  if (label) {
    element.textContent = label;
  }
};

const createListItems = (items = []) =>
  items
    .filter(Boolean)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

const renderEmptyState = (message) =>
  `<div class="empty-state">${escapeHtml(message)}</div>`;

const renderListEmptyState = (message) =>
  `<li class="empty-state">${escapeHtml(message)}</li>`;

const formatOptionalLink = (label, value) => {
  if (!value) {
    return "";
  }

  const safeValue = escapeHtml(value);
  const href = label === "Email" ? `mailto:${safeValue}` : safeValue;

  return `
    <li class="contact-item">
      <a class="muted-link" href="${href}" ${
        label === "Email" ? "" : 'target="_blank" rel="noreferrer"'
      }>
        ${escapeHtml(label)}: ${safeValue}
      </a>
    </li>
  `;
};

const renderSharedContent = (data) => {
  const site = data.site || {};

  const baseName = site.name || "DevOps Portfolio";
  const pageTitle = pageTitles[page] || "Portfolio";

  document.title =
    page === "home" ? `${baseName} | ${pageTitle}` : `${pageTitle} | ${baseName}`;

  document.querySelectorAll(".js-site-name").forEach((element) => {
    element.textContent = site.name || "Your Name";
  });

  setText(".js-site-role", site.role || "DevOps Engineer | Platform Engineer");

  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    if (link.dataset.nav === page) {
      link.setAttribute("aria-current", "page");
    }
  });
};

const renderHome = (data) => {
  const site = data.site || {};
  const skills = data.skills?.categories || [];
  const outages = data.outages?.items || [];
  const projects = data.projects?.items || [];
  const experience = data.experience?.items || [];

  setText("#hero-summary", site.heroSummary || "");
  setLink("#resume-link", site.resumeFile || "/uploads/resume.pdf", site.resumeLabel || "Download Resume");
  setLink("#email-link", `mailto:${site.email || "your.email@example.com"}`, "Contact by Email");

  setHtml(
    "#contact-list",
    [
      formatOptionalLink("Email", site.email),
      site.location ? `<li class="contact-item">${escapeHtml(site.location)}</li>` : "",
      formatOptionalLink("LinkedIn", site.linkedin),
      formatOptionalLink("Website", site.website),
    ]
      .filter(Boolean)
      .join("") || renderListEmptyState("Add your contact details in the content file.")
  );

  setHtml(
    "#about-content",
    (site.about || [])
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join("") || renderEmptyState("Add your profile summary paragraphs in the content file.")
  );

  setHtml(
    "#stats-grid",
    [
      {
        label: "Skill Categories",
        value: skills.length,
      },
      {
        label: "Handled Outages",
        value: outages.length,
      },
      {
        label: "Projects",
        value: projects.length,
      },
      {
        label: "Experience Entries",
        value: experience.length,
      },
    ]
      .map(
        (item) => `
          <article class="stat-card">
            <p class="stat-label">${escapeHtml(item.label)}</p>
            <p class="stat-value">${escapeHtml(item.value)}</p>
          </article>
        `
      )
      .join("")
  );

  const previewCards = [
    {
      title: "Technical Skills",
      copy: data.skills?.intro || "List the technologies, tooling, and platform areas you work with.",
      link: "/skills/",
    },
    {
      title: "Issues and Outages",
      copy: data.outages?.intro || "Highlight incidents you investigated, stabilized, and closed out.",
      link: "/outages/",
    },
    {
      title: "Projects and Innovations",
      copy: data.projects?.intro || "Show the automation, platforms, and improvements you have delivered.",
      link: "/projects/",
    },
    {
      title: "Professional Experience",
      copy: data.experience?.intro || "Summarize the environments, teams, and outcomes you have worked on.",
      link: "/experience/",
    },
  ];

  setHtml(
    "#page-previews",
    previewCards
      .map(
        (item) => `
          <article class="preview-card">
            <h3>${escapeHtml(item.title)}</h3>
            <p class="card-copy">${escapeHtml(item.copy)}</p>
            <a class="card-link" href="${item.link}">Open Page</a>
          </article>
        `
      )
      .join("")
  );
};

const renderSkills = (data) => {
  const skills = data.skills || {};
  const categories = skills.categories || [];

  setText("#skills-intro", skills.intro || "");

  if (!categories.length) {
    setHtml("#skills-grid", renderEmptyState("Add at least one skills category in the content file."));
    return;
  }

  setHtml(
    "#skills-grid",
    categories
      .map(
        (category) => `
          <article class="content-card">
            <p class="chip-label">${escapeHtml(category.title)}</p>
            <h2>${escapeHtml(category.title)}</h2>
            <ul class="skill-list">
              ${createListItems(category.items)}
            </ul>
          </article>
        `
      )
      .join("")
  );
};

const renderOutages = (data) => {
  const outages = data.outages || {};
  const items = outages.items || [];

  setText("#outages-intro", outages.intro || "");

  if (!items.length) {
    setHtml("#outages-list", renderEmptyState("Add at least one outage or incident entry in the content file."));
    return;
  }

  setHtml(
    "#outages-list",
    items
      .map(
        (item) => `
          <article class="timeline-card">
            <div class="timeline-head">
              <div>
                <p class="timeline-label">Incident</p>
                <h2>${escapeHtml(item.title)}</h2>
              </div>
              <div class="timeline-meta">
                ${item.company ? `<span class="meta-pill">${escapeHtml(item.company)}</span>` : ""}
                ${item.period ? `<span class="meta-pill">${escapeHtml(item.period)}</span>` : ""}
                ${item.impact ? `<span class="meta-pill">${escapeHtml(item.impact)}</span>` : ""}
              </div>
            </div>
            ${
              item.situation
                ? `<p class="body-copy">${escapeHtml(item.situation)}</p>`
                : ""
            }
            ${
              item.actions?.length
                ? `
                  <ul class="detail-list">
                    ${createListItems(item.actions)}
                  </ul>
                `
                : ""
            }
            ${
              item.outcome
                ? `<p class="body-copy"><strong>Outcome:</strong> ${escapeHtml(item.outcome)}</p>`
                : ""
            }
          </article>
        `
      )
      .join("")
  );
};

const renderProjects = (data) => {
  const projects = data.projects || {};
  const items = projects.items || [];

  setText("#projects-intro", projects.intro || "");

  if (!items.length) {
    setHtml("#projects-grid", renderEmptyState("Add at least one project or innovation entry in the content file."));
    return;
  }

  setHtml(
    "#projects-grid",
    items
      .map(
        (item) => `
          <article class="content-card">
            <p class="chip-label">${escapeHtml(item.subtitle || "Project")}</p>
            <h2>${escapeHtml(item.title)}</h2>
            ${
              item.summary
                ? `<p class="card-copy">${escapeHtml(item.summary)}</p>`
                : ""
            }
            <div class="timeline-meta">
              ${item.period ? `<span class="meta-pill">${escapeHtml(item.period)}</span>` : ""}
              ${item.stack ? `<span class="meta-pill">${escapeHtml(item.stack)}</span>` : ""}
            </div>
            ${
              item.outcomes?.length
                ? `<ul class="detail-list">${createListItems(item.outcomes)}</ul>`
                : ""
            }
            ${
              item.linkUrl && item.linkLabel
                ? `<a class="card-link" href="${escapeHtml(item.linkUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.linkLabel)}</a>`
                : ""
            }
          </article>
        `
      )
      .join("")
  );
};

const renderExperience = (data) => {
  const experience = data.experience || {};
  const items = experience.items || [];

  setText("#experience-intro", experience.intro || "");

  if (!items.length) {
    setHtml("#experience-list", renderEmptyState("Add at least one experience entry in the content file."));
    return;
  }

  setHtml(
    "#experience-list",
    items
      .map(
        (item) => `
          <article class="timeline-card">
            <div class="timeline-head">
              <div>
                <p class="timeline-label">${escapeHtml(item.company || "Experience")}</p>
                <h2>${escapeHtml(item.role || "Role")}</h2>
              </div>
              <div class="timeline-meta">
                ${item.period ? `<span class="meta-pill">${escapeHtml(item.period)}</span>` : ""}
                ${item.location ? `<span class="meta-pill">${escapeHtml(item.location)}</span>` : ""}
              </div>
            </div>
            ${
              item.summary
                ? `<p class="body-copy">${escapeHtml(item.summary)}</p>`
                : ""
            }
            ${
              item.highlights?.length
                ? `<ul class="detail-list">${createListItems(item.highlights)}</ul>`
                : ""
            }
          </article>
        `
      )
      .join("")
  );
};

const renderErrorState = (message) => {
  const targets = {
    home: ["#contact-list", "#about-content", "#stats-grid", "#page-previews"],
    skills: ["#skills-grid"],
    outages: ["#outages-list"],
    projects: ["#projects-grid"],
    experience: ["#experience-list"],
  };

  (targets[page] || []).forEach((selector) => {
    if (selector === "#contact-list") {
      setHtml(selector, renderListEmptyState(message));
      return;
    }

    setHtml(selector, renderEmptyState(message));
  });
};

const init = async () => {
  try {
    const response = await fetch(CONTENT_FILE);

    if (!response.ok) {
      throw new Error(`Could not load ${CONTENT_FILE}`);
    }

    const data = await response.json();
    renderSharedContent(data);

    if (page === "home") {
      renderHome(data);
    }

    if (page === "skills") {
      renderSkills(data);
    }

    if (page === "outages") {
      renderOutages(data);
    }

    if (page === "projects") {
      renderProjects(data);
    }

    if (page === "experience") {
      renderExperience(data);
    }
  } catch (error) {
    console.error(error);
    renderErrorState(
      "The portfolio content file could not be loaded. Check /content/portfolio-content.json and make sure it is valid JSON."
    );
  }
};

init();
