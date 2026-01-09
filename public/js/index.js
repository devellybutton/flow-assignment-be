// const API_BASE = "http://localhost:3000";
const API_BASE = "http://3.38.191.18:3000/api";

// 상태
const state = {
  fixedExtensions: [],
  customExtensions: [],
  MAX_EXTENSIONS: 200,
  MAX_LENGTH: 20,
};

// DOM
const elements = {
  input: document.getElementById("customExtension"),
  addBtn: document.getElementById("addBtn"),
  counter: document.getElementById("counter"),
  tagsContainer: document.getElementById("tagsContainer"),
  errorMessage: document.getElementById("errorMessage"),
  fixedCheckboxes: document.querySelectorAll('input[name="fixed-ext"]'),
};

/* ------------------ 공통 ------------------ */

function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorMessage.classList.add("show");
  setTimeout(() => {
    elements.errorMessage.classList.remove("show");
  }, 3000);
}

function updateCounter() {
  elements.counter.textContent = `${state.customExtensions.length}/${state.MAX_EXTENSIONS}`;
}

/* ------------------ API ------------------ */

async function fetchAllExtensions() {
  try {
    const res = await fetch(`${API_BASE}/extensions`);
    const data = await res.json();

    state.fixedExtensions = data.fixedExtensions;
    state.customExtensions = data.customExtensions.map((e) => e.name);

    renderFixedExtensions();
    renderTags();
    updateCounter();
  } catch (err) {
    showError("확장자 목록을 불러오지 못했습니다.");
    console.error(err);
  }
}

async function updateFixedExtension(name, isBlocked) {
  try {
    await fetch(`${API_BASE}/extensions/fixed`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        is_blocked: isBlocked,
      }),
    });
  } catch (err) {
    showError("고정 확장자 변경 실패");
    console.error(err);
  }
}

async function addCustomExtension(name) {
  try {
    const res = await fetch(`${API_BASE}/extensions/custom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.msg || "추가 실패");
    }

    state.customExtensions.push(name);
    renderTags();
    updateCounter();
  } catch (err) {
    showError(err.message);
  }
}

async function deleteCustomExtension(name) {
  try {
    await fetch(`${API_BASE}/extensions/custom/${name}`, {
      method: "DELETE",
    });

    state.customExtensions = state.customExtensions.filter(
      (ext) => ext !== name
    );
    renderTags();
    updateCounter();
  } catch (err) {
    showError("삭제 실패");
  }
}

/* ------------------ 렌더 ------------------ */

function renderFixedExtensions() {
  state.fixedExtensions.forEach(({ name, is_blocked }) => {
    const checkbox = document.getElementById(name);
    if (checkbox) checkbox.checked = is_blocked;
  });
}

function renderTags() {
  elements.tagsContainer.innerHTML = state.customExtensions
    .map(
      (ext) => `
      <div class="tag" role="listitem">
        <span>${ext}</span>
        <button
          class="tag-remove"
          data-ext="${ext}"
          aria-label="${ext} 확장자 삭제"
        >×</button>
      </div>
    `
    )
    .join("");
}

/* ------------------ 이벤트 ------------------ */

// 고정 확장자 체크
elements.fixedCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", (e) => {
    const name = e.target.value;
    const isBlocked = e.target.checked;
    updateFixedExtension(name, isBlocked);
  });
});

// 커스텀 추가
elements.addBtn.addEventListener("click", () => {
  const value = elements.input.value.trim().toLowerCase();

  if (!value) return showError("확장자를 입력해주세요.");
  if (!/^[a-z0-9]+$/.test(value))
    return showError("영문 소문자 혹은 숫자만 입력 가능합니다.");
  if (value.length > state.MAX_LENGTH)
    return showError(`최대 ${state.MAX_LENGTH}자까지 가능합니다.`);
  if (state.customExtensions.length >= state.MAX_EXTENSIONS)
    return showError("최대 200개까지 추가할 수 있습니다.");
  if (state.customExtensions.includes(value))
    return showError("이미 등록된 확장자입니다.");

  addCustomExtension(value);
  elements.input.value = "";
});

// 엔터 입력
elements.input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") elements.addBtn.click();
});

// 커스텀 삭제
elements.tagsContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("tag-remove")) {
    const ext = e.target.dataset.ext;
    deleteCustomExtension(ext);
  }
});

/* ------------------ 초기화 ------------------ */

fetchAllExtensions();
