const botToken = "8543757949:AAHkb7EeGKgHpNsH7DJN0sc3jgoM-3U4Ibg";
const chatId = "385632170";

const storageKey = "en-test-bbc-parakeets-2026-v5";

/** Ключ 2A: два слова на каждую часть программы (порядок в паре как в ключе). */
const matchCorrectPairs = {
  1: ["breakfast", "rice"],
  2: ["forest", "steps"],
  3: ["lake", "rivers"],
};

function matchCorrectSet(groupNumber) {
  return new Set(matchCorrectPairs[groupNumber]);
}

function formatMatchCorrectLabel(groupNumber) {
  return matchCorrectPairs[groupNumber].join(" + ");
}

const matchWordOptions = [
  { value: "breakfast", label: "breakfast" },
  { value: "forest", label: "forest" },
  { value: "lake", label: "lake" },
  { value: "rice", label: "rice" },
  { value: "rivers", label: "rivers" },
  { value: "steps", label: "steps" },
];

const matchProgrammeTitles = {
  1: "Joseph Sekar and the parakeets",
  2: "Billy Ellis, the fire lookout",
  3: "Elvira and the manatee",
};

const gapChoices = [
  { value: "come", label: "come" },
  { value: "get up", label: "get up" },
  { value: "live", label: "live" },
  { value: "makes", label: "makes" },
  { value: "watches", label: "watches" },
  { value: "sees", label: "sees" },
  { value: "says", label: "says" },
];

const gapCorrect = {
  gap1: "makes",
  gap2: "come",
  gap3: "get up",
  gap4: "watches",
  gap5: "sees",
  gap6: "live",
  gap7: "says",
};

const matchSelectIds = ["match1a", "match1b", "match2a", "match2b", "match3a", "match3b"];
const gapSelectIds = ["gap1", "gap2", "gap3", "gap4", "gap5", "gap6", "gap7"];

const quizRadioNames = ["quiz1", "quiz2", "quiz3"];

/** Ключ викторины: 1 — b, 2 — b, 3 — c. */
const quizConfig = [
  {
    name: "quiz1",
    correctValue: "b",
    labelShort: "Quiz 1 · live in",
    choices: { a: "the USA?", b: "India?", c: "Pakistan?" },
  },
  {
    name: "quiz2",
    correctValue: "b",
    labelShort: "Quiz 2 · get up at",
    choices: { a: "five o'clock?", b: "half past five?", c: "six o'clock?" },
  },
  {
    name: "quiz3",
    correctValue: "c",
    labelShort: "Quiz 3 · he says",
    choices: {
      a: "he loves animals?",
      b: "he loves all living things?",
      c: "all living things are important?",
    },
  },
];

const writingFieldIds = [
  "write_joseph_yesno",
  "write_joseph_wh",
  "write_joseph_or",
  "write_billy_yesno",
  "write_billy_wh",
  "write_billy_or",
  "write_elvira_yesno",
  "write_elvira_wh",
  "write_elvira_or",
];

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function fillSelectOptions(selectElement, options, placeholderLabel) {
  selectElement.replaceChildren();
  const fragment = document.createDocumentFragment();
  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = placeholderLabel;
  fragment.appendChild(emptyOption);
  for (const optionItem of options) {
    const optionNode = document.createElement("option");
    optionNode.value = optionItem.value;
    optionNode.textContent = optionItem.label;
    fragment.appendChild(optionNode);
  }
  selectElement.appendChild(fragment);
}

function readStoredState() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeStoredState(stateObject) {
  localStorage.setItem(storageKey, JSON.stringify(stateObject));
}

function collectFormValues() {
  const values = {};
  for (const selectId of matchSelectIds) {
    const element = document.getElementById(selectId);
    if (element) {
      values[selectId] = element.value;
    }
  }
  for (const selectId of gapSelectIds) {
    const element = document.getElementById(selectId);
    if (element) {
      values[selectId] = element.value;
    }
  }
  for (const quizName of quizRadioNames) {
    const chosen = document.querySelector(`input[name="${quizName}"]:checked`);
    values[quizName] = chosen ? chosen.value : "";
  }
  for (const fieldId of writingFieldIds) {
    const element = document.getElementById(fieldId);
    values[fieldId] = element ? element.value : "";
  }
  const nameInput = document.getElementById("studentName");
  values.studentName = nameInput ? nameInput.value.trim() : "";
  return values;
}

function applyFormValues(values) {
  if (!values) {
    return;
  }
  for (const selectId of [...matchSelectIds, ...gapSelectIds]) {
    const element = document.getElementById(selectId);
    if (element && Object.prototype.hasOwnProperty.call(values, selectId)) {
      element.value = values[selectId];
    }
  }
  for (const quizName of quizRadioNames) {
    if (Object.prototype.hasOwnProperty.call(values, quizName) && values[quizName]) {
      const radioInput = document.querySelector(
        `input[name="${quizName}"][value="${values[quizName]}"]`,
      );
      if (radioInput) {
        radioInput.checked = true;
      }
    }
  }
  for (const fieldId of writingFieldIds) {
    const element = document.getElementById(fieldId);
    if (element && Object.prototype.hasOwnProperty.call(values, fieldId)) {
      element.value = values[fieldId];
    }
  }
  const nameInput = document.getElementById("studentName");
  if (nameInput && typeof values.studentName === "string") {
    nameInput.value = values.studentName;
  }
}

function getMatchGroupValues(groupNumber) {
  const suffixes = ["a", "b"];
  const picked = [];
  for (const suffix of suffixes) {
    const element = document.getElementById(`match${groupNumber}${suffix}`);
    picked.push(element ? element.value : "");
  }
  return picked;
}

function scoreMatching() {
  const allPicked = [];
  for (const selectId of matchSelectIds) {
    const element = document.getElementById(selectId);
    allPicked.push(element ? element.value : "");
  }
  const filled = allPicked.every((value) => value.length > 0);
  const unique = new Set(allPicked);
  const noDuplicates = unique.size === allPicked.length;

  const rows = [];
  let points = 0;

  for (let groupNumber = 1; groupNumber <= 3; groupNumber += 1) {
    const pairValues = getMatchGroupValues(groupNumber);
    const correctSet = matchCorrectSet(groupNumber);
    const title = matchProgrammeTitles[groupNumber];
    const correctLabel = formatMatchCorrectLabel(groupNumber);

    let isCorrect = false;
    if (filled && noDuplicates) {
      const studentSet = new Set(pairValues);
      if (studentSet.size === 2 && [...correctSet].every((word) => studentSet.has(word))) {
        isCorrect = true;
      }
    }

    if (isCorrect) {
      points += 1;
    }

    const studentDisplay =
      pairValues[0] && pairValues[1] ? `${pairValues[0]} + ${pairValues[1]}` : "—";

    rows.push({
      key: `2A-${groupNumber}`,
      labelShort: `2A · ${groupNumber}) ${title}`,
      correctDisplay: correctLabel,
      studentDisplay,
      isCorrect,
    });
  }

  return { points, max: 3, rows, filled, noDuplicates };
}

function scoreGaps() {
  const rows = [];
  let points = 0;
  const max = gapSelectIds.length;

  for (const gapId of gapSelectIds) {
    const element = document.getElementById(gapId);
    const studentValue = element ? element.value : "";
    const expected = gapCorrect[gapId];
    const isCorrect = Boolean(studentValue) && studentValue === expected;
    if (isCorrect) {
      points += 1;
    }
    rows.push({
      key: gapId,
      labelShort: `C · ${gapId.replace("gap", "")}`,
      correctDisplay: expected,
      studentDisplay: studentValue || "—",
      isCorrect,
    });
  }

  return { points, max, rows };
}

function scoreQuiz() {
  const rows = [];
  let points = 0;
  for (const item of quizConfig) {
    const chosen = document.querySelector(`input[name="${item.name}"]:checked`);
    const studentValue = chosen ? chosen.value : "";
    const isCorrect = studentValue === item.correctValue;
    if (isCorrect) {
      points += 1;
    }
    const correctLetter = item.correctValue;
    const correctPhrase = item.choices[correctLetter];
    const correctDisplay = `${correctLetter}) ${correctPhrase}`;
    let studentDisplay = "—";
    if (studentValue) {
      const studentPhrase = item.choices[studentValue];
      studentDisplay = `${studentValue}) ${studentPhrase}`;
    }
    rows.push({
      key: item.name,
      correctDisplay: `${item.labelShort}: ${correctDisplay}`,
      studentDisplay,
      isCorrect,
    });
  }
  return { points, max: quizConfig.length, rows };
}

function clearSelectMarks() {
  for (const selectId of [...matchSelectIds, ...gapSelectIds]) {
    const element = document.getElementById(selectId);
    if (element) {
      element.classList.remove("is-correct", "is-wrong");
    }
  }
}

function clearQuizMarks() {
  document.querySelectorAll(".quiz-option").forEach((label) => {
    label.classList.remove("is-correct", "is-wrong");
  });
  document.querySelectorAll(".quiz-question--missed").forEach((fieldset) => {
    fieldset.classList.remove("quiz-question--missed");
  });
}

function applyQuizMarks(quizResult) {
  for (const row of quizResult.rows) {
    const fieldset = document.querySelector(`fieldset[data-quiz="${row.key}"]`);
    if (!fieldset) {
      continue;
    }
    const chosen = fieldset.querySelector("input:checked");
    if (!chosen) {
      fieldset.classList.add("quiz-question--missed");
      continue;
    }
    fieldset.querySelectorAll("label.quiz-option").forEach((label) => {
      const input = label.querySelector("input");
      if (input && input.checked) {
        label.classList.add(row.isCorrect ? "is-correct" : "is-wrong");
      }
    });
  }
}

function applySelectMarks(matchingResult, gapsResult, quizResult) {
  clearSelectMarks();
  clearQuizMarks();

  for (let groupNumber = 1; groupNumber <= 3; groupNumber += 1) {
    const pairValues = getMatchGroupValues(groupNumber);
    const correctSet = matchCorrectSet(groupNumber);
    const studentSet = new Set(pairValues);
    const bothFilled = pairValues[0] && pairValues[1];
    const multisetOk =
      bothFilled &&
      [...correctSet].every((word) => studentSet.has(word)) &&
      studentSet.size === 2;

    for (const suffix of ["a", "b"]) {
      const element = document.getElementById(`match${groupNumber}${suffix}`);
      if (!element || !element.value) {
        element?.classList.add("is-wrong");
        continue;
      }
      if (multisetOk) {
        element.classList.add("is-correct");
      } else {
        element.classList.add("is-wrong");
      }
    }
  }

  for (const gapId of gapSelectIds) {
    const element = document.getElementById(gapId);
    if (!element) {
      continue;
    }
    if (!element.value) {
      element.classList.add("is-wrong");
      continue;
    }
    if (element.value === gapCorrect[gapId]) {
      element.classList.add("is-correct");
    } else {
      element.classList.add("is-wrong");
    }
  }

  if (!matchingResult.noDuplicates || !matchingResult.filled) {
    for (const selectId of matchSelectIds) {
      const element = document.getElementById(selectId);
      element?.classList.remove("is-correct");
      element?.classList.add("is-wrong");
    }
  }

  if (quizResult) {
    applyQuizMarks(quizResult);
  }
}

function buildTelegramHtml(studentName, totalPoints, maxPoints, detailRows) {
  const safeName = escapeHtml(studentName || "—");
  const columnWidth = 40;
  const tableWidth = 3 + columnWidth * 2;
  const headerLines = [
    `<b>Студент:</b> ${safeName}`,
    `<b>Балл:</b> ${totalPoints} из ${maxPoints}`,
    "",
    "<pre>",
    padColumn("№", 3) +
      padColumn("Правильный ответ", columnWidth) +
      padColumn("Ответ студента", columnWidth),
    "-".repeat(tableWidth),
  ];

  let index = 1;
  for (const row of detailRows) {
    const correctCell = `${row.correctDisplay}`;
    let studentCell = row.studentDisplay;
    studentCell = `${studentCell} ${row.isCorrect ? "✅" : "❌"}`;
    headerLines.push(
      padColumn(String(index), 3) +
        padColumn(correctCell, columnWidth) +
        padColumn(studentCell, columnWidth),
    );
    index += 1;
  }
  headerLines.push("</pre>");
  return headerLines.join("\n");
}

function padColumn(text, width) {
  const slice = String(text).slice(0, width);
  return slice.padEnd(width, " ");
}

const writingTelegramStories = [
  {
    title: "Joseph Sekar and the parakeets",
    fields: [
      { key: "write_joseph_yesno", label: "Yes/No" },
      { key: "write_joseph_wh", label: "Wh-" },
      { key: "write_joseph_or", label: "or" },
    ],
  },
  {
    title: "Billy Ellis, the fire lookout",
    fields: [
      { key: "write_billy_yesno", label: "Yes/No" },
      { key: "write_billy_wh", label: "Wh-" },
      { key: "write_billy_or", label: "or" },
    ],
  },
  {
    title: "Elvira and the manatee",
    fields: [
      { key: "write_elvira_yesno", label: "Yes/No" },
      { key: "write_elvira_wh", label: "Wh-" },
      { key: "write_elvira_or", label: "or" },
    ],
  },
];

const telegramWrittenMaxChars = 3500;

function buildWrittenTelegramHtml(values) {
  const lines = [];
  for (const story of writingTelegramStories) {
    lines.push(story.title);
    for (const field of story.fields) {
      const raw = typeof values[field.key] === "string" ? values[field.key].trim() : "";
      const displayText = raw.length > 0 ? raw : "—";
      lines.push(`  ${field.label}: ${displayText}`);
    }
    lines.push("");
  }
  let bodyText = lines.join("\n").trimEnd();
  if (bodyText.length > telegramWrittenMaxChars) {
    bodyText = `${bodyText.slice(0, telegramWrittenMaxChars)}\n… (обрезано)`;
  }
  return `<b>Письменные вопросы (без автобаллов):</b>\n<pre>${escapeHtml(bodyText)}</pre>`;
}

async function sendTelegramMessage(htmlMessage) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: htmlMessage,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }
  return response.json();
}

function setLocked(isLocked) {
  document.body.classList.toggle("is-locked", isLocked);
  const submitButton = document.getElementById("submitBtn");
  if (submitButton) {
    submitButton.disabled = isLocked;
  }
  for (const fieldId of writingFieldIds) {
    const element = document.getElementById(fieldId);
    if (element) {
      element.readOnly = isLocked;
    }
  }
}

function initThemeImage() {
  const themeImage = document.getElementById("themeImage");
  const placeholder = document.getElementById("themeImagePlaceholder");
  if (!themeImage || !placeholder) {
    return;
  }

  function showImage() {
    themeImage.hidden = false;
    placeholder.hidden = true;
  }

  function showPlaceholder() {
    themeImage.hidden = true;
    placeholder.hidden = false;
  }

  themeImage.addEventListener("load", () => {
    if (themeImage.naturalWidth > 0) {
      showImage();
    } else {
      showPlaceholder();
    }
  });
  themeImage.addEventListener("error", () => {
    showPlaceholder();
  });

  if (themeImage.complete) {
    if (themeImage.naturalWidth > 0) {
      showImage();
    } else {
      showPlaceholder();
    }
  }
}

function applyGap1DefaultIfNeeded() {
  const gap1 = document.getElementById("gap1");
  if (!gap1) {
    return;
  }
  const stored = readStoredState();
  if (stored?.isLocked) {
    return;
  }
  const hasGap1Key = Boolean(
    stored?.values && Object.prototype.hasOwnProperty.call(stored.values, "gap1"),
  );
  if (!hasGap1Key && gap1.value === "") {
    gap1.value = "makes";
  }
}

function initFormPersistence() {
  const stored = readStoredState();
  if (stored && stored.values) {
    applyFormValues(stored.values);
  }
  if (stored && stored.isLocked) {
    setLocked(true);
    const matchingResult = scoreMatching();
    const gapsResult = scoreGaps();
    const quizResult = scoreQuiz();
    applySelectMarks(matchingResult, gapsResult, quizResult);
    const statusMessage = document.getElementById("statusMessage");
    if (statusMessage) {
      statusMessage.textContent = "Тест уже отправлен; ответы заблокированы.";
      statusMessage.classList.add("status--ok");
    }
  }

  const trackedIds = ["studentName", ...matchSelectIds, ...gapSelectIds, ...writingFieldIds];
  for (const elementId of trackedIds) {
    const element = document.getElementById(elementId);
    if (!element) {
      continue;
    }
    element.addEventListener("input", persistDraft);
    element.addEventListener("change", persistDraft);
  }

  for (const quizName of quizRadioNames) {
    document.querySelectorAll(`input[name="${quizName}"]`).forEach((radioInput) => {
      radioInput.addEventListener("change", persistDraft);
    });
  }

  applyGap1DefaultIfNeeded();
  persistDraft();
}

function persistDraft() {
  const previous = readStoredState() || {};
  if (previous.isLocked) {
    return;
  }
  writeStoredState({
    values: collectFormValues(),
    isLocked: false,
    updatedAt: Date.now(),
  });
}

function wireSubmit() {
  const submitButton = document.getElementById("submitBtn");
  const statusMessage = document.getElementById("statusMessage");
  if (!submitButton) {
    return;
  }

  submitButton.addEventListener("click", async () => {
    const values = collectFormValues();
    if (!values.studentName) {
      if (statusMessage) {
        statusMessage.textContent = "Введите ФИО перед отправкой.";
        statusMessage.classList.add("status--error");
      }
      return;
    }

    const matchingResult = scoreMatching();
    const gapsResult = scoreGaps();
    const quizResult = scoreQuiz();

    const detailRows = [];
    for (const row of matchingResult.rows) {
      detailRows.push({
        correctDisplay: row.labelShort + ": " + row.correctDisplay,
        studentDisplay: row.studentDisplay,
        isCorrect: row.isCorrect,
      });
    }
    for (const row of gapsResult.rows) {
      detailRows.push({
        correctDisplay: row.labelShort + ": " + row.correctDisplay,
        studentDisplay: row.studentDisplay,
        isCorrect: row.isCorrect,
      });
    }
    for (const row of quizResult.rows) {
      detailRows.push({
        correctDisplay: row.correctDisplay,
        studentDisplay: row.studentDisplay,
        isCorrect: row.isCorrect,
      });
    }

    const totalPoints = matchingResult.points + gapsResult.points + quizResult.points;
    const maxPoints = matchingResult.max + gapsResult.max + quizResult.max;

    applySelectMarks(matchingResult, gapsResult, quizResult);
    setLocked(true);

    writeStoredState({
      values,
      isLocked: true,
      submittedAt: Date.now(),
      score: { totalPoints, maxPoints },
    });

    if (statusMessage) {
      statusMessage.classList.remove("status--error", "status--ok");
    }

    const telegramHtml = buildTelegramHtml(values.studentName, totalPoints, maxPoints, detailRows);
    const writtenHtml = buildWrittenTelegramHtml(values);

    try {
      await sendTelegramMessage(telegramHtml);
      await sendTelegramMessage(writtenHtml);
      if (statusMessage) {
        statusMessage.textContent = `Готово. Балл: ${totalPoints} из ${maxPoints}. Результаты отправлены в Telegram.`;
        statusMessage.classList.add("status--ok");
      }
    } catch (error) {
      if (statusMessage) {
        statusMessage.textContent =
          "Ответы зафиксированы, но отправка в Telegram не удалась. Проверьте сеть или токен бота.";
        statusMessage.classList.add("status--error");
      }
      console.error(error);
    }
  });
}

function initSelects() {
  for (const selectId of matchSelectIds) {
    const element = document.getElementById(selectId);
    if (element) {
      fillSelectOptions(element, matchWordOptions, "— выберите слово —");
    }
  }
  for (const selectId of gapSelectIds) {
    const element = document.getElementById(selectId);
    if (element) {
      fillSelectOptions(element, gapChoices, "—");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initSelects();
  initThemeImage();
  initFormPersistence();
  wireSubmit();
});
