const $ = (selector) => document.querySelector(selector);

const state = {
  endpoint:
    localStorage.getItem("listingStudioEndpoint") ||
    "http://localhost:11434/api/generate",

  model:
    localStorage.getItem("listingStudioModel") ||
    "llama3.2",

  lastListing: null,
  photoUrl: null
};

const form = $("#listingForm");
const toast = $("#toast");

const savedTheme = localStorage.getItem("listingStudioTheme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
}

updateThemeButton();

function updateThemeButton() {
  const isDark = document.body.classList.contains("dark");

  $("#themeIcon").textContent = isDark ? "☀" : "☾";

  $("#themeToggle").setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode"
  );
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button");

  if (!target || target.disabled) {
    return;
  }

  target.classList.add("ripple-host");

  const ripple = document.createElement("span");
  const bounds = target.getBoundingClientRect();

  ripple.className = "ripple";
  ripple.style.left = `${event.clientX - bounds.left - 7}px`;
  ripple.style.top = `${event.clientY - bounds.top - 7}px`;

  target.appendChild(ripple);

  ripple.addEventListener(
    "animationend",
    () => ripple.remove(),
    { once: true }
  );
});

$("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");

  localStorage.setItem(
    "listingStudioTheme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );

  updateThemeButton();
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(showToast.timeout);

  showToast.timeout = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function getFormData() {
  return {
    productName: $("#productName").value.trim(),
    category: $("#category").value,
    condition: $("#condition").value,
    details: $("#details").value.trim(),
    price: $("#price").value,
    platform: $("#platform").value,
    tone: $("#tone").value
  };
}

function cleanText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function makeFallbackListing(data) {
  const name = cleanText(data.productName);
  const details = cleanText(data.details);

  const words = details
    .split(/[,\s]+/)
    .filter((word) => word.length > 3)
    .slice(0, 8);

  const titleTail =
    data.category === "Fashion & accessories"
      ? " | timeless everyday style"
      : ` | ${data.category.toLowerCase()}`;

  const title = `${name}${titleTail}`.slice(0, 140);

  const lead =
    data.tone === "Playful"
      ? `Meet your new favorite ${data.category.toLowerCase()} find.`
      : data.tone === "Minimal"
        ? `${name}, made to be kept.`
        : `A thoughtful ${data.category.toLowerCase()} piece for the things that make home feel like yours.`;

  const description = `${lead}

${details}

${data.condition}. Every detail has been considered, so it is ready to become part of your everyday. A lovely choice for gifting, collecting, or keeping all to yourself.

Ships with care from a small independent shop. Please reach out with any questions — I am happy to help.`;

  const baseTags = [
    name,
    data.category,
    data.condition,
    "gift idea",
    "small business",
    "handmade"
  ];

  const tags = [
    ...new Set([...baseTags, ...words])
  ]
    .map((tag) =>
      tag
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
    )
    .filter(Boolean)
    .slice(0, 10);

  return {
    title,
    description,
    tags,
    price: data.price || "0",
    source: "local fallback"
  };
}

async function makeOllamaListing(data) {
  const prompt = `You write marketplace listings for ${data.platform}. Return ONLY valid JSON with these keys: title (max 140 characters), description (plain text, 2-3 short paragraphs), tags (array of 8-10 short strings), priceAdvice (short phrase). Do not use markdown or extra keys.
Product: ${data.productName}
Category: ${data.category}
Condition: ${data.condition}
Details: ${data.details}
Price: $${data.price}
Voice: ${data.tone}`;

  const response = await fetch(state.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: state.model,
      prompt,
      stream: false,
      format: "json"
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama returned ${response.status}`);
  }

  const payload = await response.json();
  const parsed = JSON.parse(payload.response);

  if (
    !parsed.title ||
    !parsed.description ||
    !Array.isArray(parsed.tags)
  ) {
    throw new Error("The local model returned an incomplete listing.");
  }

  return {
    ...parsed,
    price: data.price || "0",
    source: `local ${state.model}`
  };
}

function renderListing(listing, data) {
  state.lastListing = listing;

  $("#emptyState").classList.add("hidden");
  $("#result").classList.remove("hidden");

  $("#titleOutput").textContent = listing.title;
  $("#descriptionOutput").textContent = listing.description;

  $("#tagList").innerHTML = listing.tags
    .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
    .join("");

  $("#priceOutput").textContent =
    `$${Number(listing.price || data.price || 0).toFixed(2)}`;

  $("#priceAdvice").textContent =
    listing.priceAdvice || priceAdvice(data);

  $("#platformLabel").textContent = data.platform;
  $("#aiModeLabel").textContent = listing.source;

  updateTitleCount();

  $("#result").classList.remove("swapping");

  void $("#result").offsetWidth;

  $("#result").classList.add("swapping");
}

function priceAdvice(data) {
  const price = Number(data.price);

  if (!price) {
    return "Add a price to get a nudge";
  }

  if (price < 15) {
    return "A friendly entry point for browsing";
  }

  if (price < 60) {
    return "Feels right for this category";
  }

  return "Premium positioning — show the details";
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]
  );
}

async function generateListing() {
  const data = getFormData();
  const button = form.querySelector(".primary-button");
  const original = button.innerHTML;

  button.disabled = true;
  button.innerHTML =
    '<span class="button-spark">✦</span> Writing your listing…';

  try {
    let listing;

    try {
      listing = await makeOllamaListing(data);
    } catch (error) {
      listing = makeFallbackListing(data);
      showToast(
        "Ollama unavailable — used the private offline writer."
      );
    }

    renderListing(listing, data);
  } finally {
    button.disabled = false;
    button.innerHTML = original;
  }
}

function updateTitleCount() {
  $("#titleCount").textContent =
    $("#titleOutput").textContent.length;
}

function copyText(text, message = "Copied to clipboard") {
  navigator.clipboard
    .writeText(text)
    .then(() => showToast(message))
    .catch(() =>
      showToast("Select the text and copy it manually.")
    );
}

function listingAsText() {
  const tags = [...document.querySelectorAll(".tag")]
    .map((tag) => tag.textContent)
    .join(" ");

  return `${$("#titleOutput").textContent}

${$("#descriptionOutput").textContent}

Tags: ${tags}`;
}

$("#details").addEventListener("input", (event) => {
  if (event.target.value.length > 500) {
    event.target.value = event.target.value.slice(0, 500);
  }

  $("#charCount").textContent = event.target.value.length;
});

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".segment")
      .forEach((item) => item.classList.remove("active"));

    button.classList.add("active");
    $("#tone").value = button.dataset.tone;
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generateListing();
});

$("#regenerateButton").addEventListener(
  "click",
  generateListing
);

$("#copyButton").addEventListener("click", () => {
  copyText(listingAsText(), "Listing copied");
});

$("#titleOutput").addEventListener("input", updateTitleCount);

document.querySelectorAll(".mini-copy").forEach((button) => {
  button.addEventListener("click", () => {
    copyText(
      $(`#${button.dataset.copy}`).textContent,
      "Description copied"
    );
  });
});

$("#photoDrop").addEventListener("click", () => {
  $("#photoInput").click();
});

function setPhoto(file) {
  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    showToast("Please choose an image file.");
    return;
  }

  if (state.photoUrl) {
    URL.revokeObjectURL(state.photoUrl);
  }

  state.photoUrl = URL.createObjectURL(file);

  $("#photoPreview").src = state.photoUrl;
  $("#photoPreview").classList.remove("hidden");
  $("#photoPlaceholder").classList.add("hidden");
  $("#removePhoto").classList.remove("hidden");
}

$("#photoInput").addEventListener("change", (event) => {
  setPhoto(event.target.files[0]);
});

["dragenter", "dragover"].forEach((eventName) => {
  $("#photoDrop").addEventListener(eventName, (event) => {
    event.preventDefault();
    $("#photoDrop").style.borderColor = "var(--orange)";
  });
});

["dragleave", "drop"].forEach((eventName) => {
  $("#photoDrop").addEventListener(eventName, (event) => {
    event.preventDefault();
    $("#photoDrop").style.borderColor = "";
  });
});

$("#photoDrop").addEventListener("drop", (event) => {
  setPhoto(event.dataTransfer.files[0]);
});

$("#removePhoto").addEventListener("click", (event) => {
  event.stopPropagation();

  $("#photoInput").value = "";
  $("#photoPreview").classList.add("hidden");
  $("#photoPlaceholder").classList.remove("hidden");
  event.currentTarget.classList.add("hidden");
});

function closeSettings() {
  $("#settingsModal").classList.add("hidden");
}

$("#settingsButton").addEventListener("click", () => {
  $("#ollamaEndpoint").value = state.endpoint;
  $("#ollamaModel").value = state.model;
  $("#connectionStatus").textContent = "";
  $("#settingsModal").classList.remove("hidden");
});

$("#closeSettings").addEventListener(
  "click",
  closeSettings
);

$("#settingsModal").addEventListener("click", (event) => {
  if (event.target === $("#settingsModal")) {
    closeSettings();
  }
});

$("#saveSettings").addEventListener("click", () => {
  state.endpoint =
    $("#ollamaEndpoint").value.trim() || state.endpoint;

  state.model =
    $("#ollamaModel").value.trim() || state.model;

  localStorage.setItem(
    "listingStudioEndpoint",
    state.endpoint
  );

  localStorage.setItem(
    "listingStudioModel",
    state.model
  );

  closeSettings();
  showToast("Local AI settings saved");
});

$("#testConnection").addEventListener("click", async () => {
  const status = $("#connectionStatus");

  status.style.color = "var(--muted)";
  status.textContent = "Checking local model…";

  try {
    const response = await fetch(
      $("#ollamaEndpoint").value.trim(),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: $("#ollamaModel").value.trim(),
          prompt: "Reply with the word ready.",
          stream: false
        })
      }
    );

    if (!response.ok) {
      throw new Error();
    }

    status.style.color = "var(--green)";
    status.textContent =
      "Connected — your local model is ready.";
  } catch {
    status.style.color = "var(--orange-dark)";
    status.textContent =
      "Could not connect. The offline writer will still work.";
  }
});
