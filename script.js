
const form = document.getElementById("analyze-form");
const screenshotInput = document.getElementById("screenshot");
const preview = document.getElementById("preview");
const placeholder = document.getElementById("placeholder");
const dropArea = document.getElementById("drop-area");
const removeButton = document.getElementById("remove-image");
const problemInput = document.getElementById("problem");
const analyzeButton = document.getElementById("analyze-btn");
const buttonText = document.getElementById("btn-text");
const results = document.getElementById("results");
const answer = document.getElementById("answer");
const resetButton = document.getElementById("reset-btn");

let selectedFile = null;

function showError(message) {
  answer.textContent = message;
  results.hidden = false;
}

function setFile(file) {
  if (!file) return;

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    showError("Please upload a PNG, JPG or WEBP image.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showError("Image is too large. Maximum size is 5 MB.");
    return;
  }

  selectedFile = file;

  preview.src = URL.createObjectURL(file);
  preview.hidden = false;
  placeholder.hidden = true;
  removeButton.hidden = false;

  results.hidden = true;
}

screenshotInput.addEventListener("change", () => {
  setFile(screenshotInput.files[0]);
});

removeButton.addEventListener("click", () => {
  selectedFile = null;
  screenshotInput.value = "";
  preview.removeAttribute("src");
  preview.hidden = true;
  placeholder.hidden = false;
  removeButton.hidden = true;
});

dropArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropArea.classList.add("dragging");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("dragging");
});

dropArea.addEventListener("drop", (event) => {
  event.preventDefault();
  dropArea.classList.remove("dragging");

  const file = event.dataTransfer.files[0];

  if (file) {
    setFile(file);

    // Keep the dropped file in the input too.
    const transfer = new DataTransfer();
    transfer.items.add(file);
    screenshotInput.files = transfer.files;
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!selectedFile) {
    showError("Please upload a screenshot first.");
    return;
  }

  const formData = new FormData();
  formData.append("screenshot", selectedFile);
  formData.append("problem", problemInput.value.trim());

  analyzeButton.disabled = true;
  buttonText.textContent = "✦ Analyzing your screen...";
  answer.textContent = "DOJJO is checking your screenshot. Please wait.";
  results.hidden = false;

  try {
    const response = await fetch("/analyze", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Analysis failed. Please try again.");
    }

    // Display the AI response safely.
    answer.textContent = data.answer;
  } catch (error) {
    answer.textContent =
      error.message ||
      "Could not connect to DOJJO. Please check your server.";
  } finally {
    analyzeButton.disabled = false;
    buttonText.textContent = "✦ Analyze my screen";
  }
});

resetButton.addEventListener("click", () => {
  form.reset();
  selectedFile = null;
  screenshotInput.value = "";
  preview.removeAttribute("src");
  preview.hidden = true;
  placeholder.hidden = false;
  removeButton.hidden = true;
  results.hidden = true;
  answer.textContent = "";
});