// --- HISTÓRICO ---
const openHistoryBtn = document.getElementById('openHistoryBtn');
const historyModal = document.getElementById('historyModal');
const historyList = document.getElementById('historyList');

function getHistory() {
  return JSON.parse(localStorage.getItem('ggh_history') || '[]');
}
function saveHistory(arr) {
  localStorage.setItem('ggh_history', JSON.stringify(arr));
}
function addToHistory(game, question) {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const entry = { time, game, question };
  const arr = getHistory();
  arr.unshift(entry); // mais recente primeiro
  saveHistory(arr);
}
function renderHistory() {
  const arr = getHistory();
  historyList.innerHTML = arr.length === 0 ? '<div style="color:#aaa;text-align:center;padding:1.5rem 0;">No questions yet.</div>' :
    arr.map((item, idx) => `
      <div class="history-item" data-idx="${idx}">
        <div class="history-meta">${item.time} | <span style="font-weight:700;text-transform:uppercase;letter-spacing:1px;opacity:.8;">${item.game}</span></div>
        <div class="history-question">${item.question}</div>
      </div>
    `).join('');
}



const closeHistoryBtn = document.getElementById('closeHistoryBtn');

openHistoryBtn.addEventListener('click', () => {
  renderHistory();
  historyModal.classList.remove('hidden');
  setTimeout(() => historyModal.classList.add('show'), 10);
});

function closeHistoryPanel() {
  historyModal.classList.remove('show');
  setTimeout(() => historyModal.classList.add('hidden'), 370);
}

closeHistoryBtn.addEventListener('click', closeHistoryPanel);

// Fecha ao clicar fora do painel (mas não dentro dele)
historyModal.addEventListener('click', (e) => {
  if (e.target === historyModal) closeHistoryPanel();
});

// Repetir pergunta ao clicar
historyList.addEventListener('click', async (e) => {
  const item = e.target.closest('.history-item');
  if (!item) return;
  const idx = +item.dataset.idx;
  const arr = getHistory();
  const { game, question } = arr[idx];
  // Reenvia a pergunta, mas não salva no histórico de novo
  askButton.disabled = true;
  askButton.textContent = 'Asking...';
  askButton.classList.add('loading');
  try {
    const text = await askAI(game, question);
    aiResponse.style.display = 'block';
    aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text);
  } catch (error) {
    aiResponse.style.display = 'block';
    aiResponse.querySelector('.response-content').innerHTML = `<span style="color: #ff7070;">${error.message || 'An error occurred while processing your request. Please try again later.'}</span>`;
  } finally {
    askButton.disabled = false;
    askButton.textContent = 'Ask';
    askButton.classList.remove('loading');
    historyModal.classList.add('hidden');
  }
});
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form');
const closePromoModal = document.getElementById('closePromoModal');
const promoBtn = document.getElementById('promoBtn');
const promoModal = document.getElementById('promoModal');

const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}

const getPrompt = (game, question) => {
    if (game === 'cs2') {
        return `\n## Specialty\nYou are an expert assistant for Counter-Strike 2.\n\n## Task\nAnswer questions about strategies, weapons, maps, and tips for CS2.\n\n## Rules\n- If you don't know the answer, reply with 'I don't know' and do not try to make up an answer.\n- If the question is not related to CS2, reply with 'This question is not related to Counter-Strike 2.'\n- Consider the current date: ${new Date().toLocaleDateString()}\n- Use up-to-date info about the current patch.\n- Never mention items you are not sure exist in the current patch.\n\n## Answer\n- Be concise, direct, and answer in a maximum of 500 characters.\n- Respond in markdown, with bold, lists, emojis, etc.\n- No greetings or farewells, just answer what the user is asking.\n- Use all game features: weapons, maps, tactics, etc.\n\n## Example\n**Weapons:** Glock-18, USP-S\n**Map tips:** Use smokes on Mirage\n\n---\nUser question: ${question}`;
    }
    if (game === 'valorant') {
        return `\n## Specialty\nYou are an expert assistant for Valorant.\n\n## Task\nAnswer questions about agents, strategies, maps, and tips for Valorant.\n\n## Rules\n- If you don't know the answer, reply with 'I don't know' and do not try to make up an answer.\n- If the question is not related to Valorant, reply with 'This question is not related to Valorant.'\n- Consider the current date: ${new Date().toLocaleDateString()}\n- Use up-to-date info about the current patch.\n- Never mention items you are not sure exist in the current patch.\n\n## Answer\n- Be concise, direct, and answer in a maximum of 500 characters.\n- Respond in markdown, with bold, lists, emojis, etc.\n- No greetings or farewells, just answer what the user is asking.\n- Use all game features: agents, abilities, maps, etc.\n\n## Example\n**Agent:** Jett\n**Strategy:** Use smokes for entry\n\n---\nUser question: ${question}`;
    }
    if (game === 'lol') {
        return `\n## Specialty\nYou are an expert assistant for League of Legends.\n\n## Task\nAnswer questions about champions, builds, runes, and tips for LoL.\n\n## Rules\n- If you don't know the answer, reply with 'I don't know' and do not try to make up an answer.\n- If the question is not related to LoL, reply with 'This question is not related to League of Legends.'\n- Consider the current date: ${new Date().toLocaleDateString()}\n- Use up-to-date info about the current patch.\n- Never mention items you are not sure exist in the current patch.\n\n## Answer\n- Be concise, direct, and answer in a maximum of 500 characters.\n- Respond in markdown, with bold, lists, emojis, etc.\n- No greetings or farewells, just answer what the user is asking.\n- Use all game features: champions, items, runes, etc.\n\n## Example\n**Champion:** Rengar\n**Build:** Duskblade, Essence Reaver\n**Runes:** Electrocute\n\n---\nUser question: ${question}`;
    }
    // fallback
    return `\n## Specialty\nYou are a gaming assistant.\n\n## Task\nAnswer questions about games.\n\n## Rules\n- If you don't know the answer, reply with 'I don't know' and do not try to make up an answer.\n- Consider the current date: ${new Date().toLocaleDateString()}\n\n## Answer\n- Be concise, direct, and answer in a maximum of 500 characters.\n- Respond in markdown, with bold, lists, emojis, etc.\n- No greetings or farewells, just answer what the user is asking.\n\n---\nUser question: ${question}`;
};

const askAI = async (game, question) => {
    const apiKey = 'AIzaSyAx65bwhaOJJLRpaVuKt3cZCqpCwPmB92k';
    const model = "gemini-2.5-flash";
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const prompt = getPrompt(game, question);
    const contents = [{
        role: 'user',
        parts: [{ text: prompt }]
    }];
    const tools = [{ google_search: {} }];

    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contents, tools })
    });
    const data = await response.json();
    if (
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] &&
        data.candidates[0].content.parts[0].text
    ) {
        return data.candidates[0].content.parts[0].text;
    } else if (
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].contents &&
        data.candidates[0].contents.parts &&
        data.candidates[0].contents.parts[0] &&
        data.candidates[0].contents.parts[0].text
    ) {
        return data.candidates[0].contents.parts[0].text;
    } else if (data.error && data.error.message) {
        throw new Error(data.error.message);
    } else {
        throw new Error('Resposta inválida da IA.');
    }
}


const sendForm = async (event) => {
    event.preventDefault();
    const game = gameSelect.value;
    const question = questionInput.value;

    if (game == '' || game === ' ' || question == '') {
        alert('Please fill in all fields.')
        return;
    }

    askButton.disabled = true;
    askButton.textContent = 'Asking...';
    askButton.classList.add('loading');

    try {
        const text = await askAI(game, question);
        aiResponse.style.display = 'block';
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text);
        addToHistory(game, question); // Salva no histórico
    } catch (error) {
        aiResponse.style.display = 'block';
        aiResponse.querySelector('.response-content').innerHTML = `<span style="color: #ff7070;">${error.message || 'An error occurred while processing your request. Please try again later.'}</span>`;
    } finally {
        askButton.disabled = false;
        askButton.textContent = 'Ask';
        askButton.classList.remove('loading');
    }
}

form.addEventListener('submit', sendForm);

promoBtn.addEventListener('click', () => {
    promoModal.classList.remove('hidden');
});
closePromoModal.addEventListener('click', () => {
    promoModal.classList.add('hidden');
});