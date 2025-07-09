const apiKeyinput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form');
const apiKeyModal = document.getElementById('apiKeyModal');
const closeApiKeyModal = document.getElementById('closeApiKeyModal');
const helpApiKeyBtn = document.getElementById('helpApiKeyBtn');

const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}

// FREE KEY - AIzaSyAx65bwhaOJJLRpaVuKt3cZCqpCwPmB92k
const askAI = async (apiKey, game, question) => {
    const model = "gemini-2.5-flash"
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const questionGemini = `
    ## Specialty
    You are a meta assistant expert for the game ${game}

    ## Task
    You must answer the user's questions based on your knowledge of the game, strategies, builds, and tips.

    ## Rules
    - If you don't know the answer, reply with 'I don't know' and do not try to make up an answer.
    - If the question is not related to the game, reply with 'This question is not related to the game.'
    - Consider the current date: ${new Date().toLocaleDateString()}
    - Perform up-to-date research about the current patch, based on the current date, to provide a coherent answer.
    - Never mention items you are not sure exist in the current patch.

    ## Answer
    - Be concise, direct, and answer in a maximum of 500 characters.
    - Respond in markdown.
    - No greetings or farewells, just answer what the user is asking.
    - Use emojis!!!
    - Use all language features available in the game, such as items, runes, champions, etc.

    ## Example answer
    user question: Best build rengar jungle
    answer: The most current build is: \n\n **Items:**\n\n list the items here.\n\n**Runes:**\n\nexample runes\n\n

    ---
    Here is the user's question: ${question}
  `
    const contents = [{
        role: 'user',
        parts: [{
            text: questionGemini
        }]
    }]
    const tools = [{
        google_search: {}
    }]

    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })
    const data = await response.json()
    // Defensive checks for API response
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
        // fallback for old structure
        return data.candidates[0].contents.parts[0].text;
    } else if (data.error && data.error.message) {
        throw new Error(data.error.message);
    } else {
        throw new Error('Invalid response from AI.');
    }
}

const sendForm = async (event) => {
    event.preventDefault();
    const apiKey = apiKeyinput.value;
    const game = gameSelect.value;
    const question = questionInput.value;

    if (apiKey == '' || apiKey == null) {
        console.log('API Key is empty, showing modal.'); // debug
        apiKeyModal.classList.remove('hidden');
        return;
    }
    if (game == '' || game === ' ' || question == '') {
        alert('Please fill in all fields.')
        return;
    }

    askButton.disabled = true;
    askButton.textContent = 'Asking...';
    askButton.classList.add('loading');

    try {
        const text = await askAI(apiKey, game, question);
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text);
        aiResponse.classList.remove('hidden');
    } catch (error) {
        console.log('Error:', error);
        aiResponse.classList.remove('hidden');
        aiResponse.querySelector('.response-content').innerHTML = `<span style="color: #ff7070;">${error.message || 'An error occurred while processing your request. Please try again later.'}</span>`;
    } finally {
        askButton.disabled = false;
        askButton.textContent = 'Ask';
        askButton.classList.remove('loading');
    }
}

closeApiKeyModal.addEventListener('click', () => {
    apiKeyModal.classList.add('hidden');
});

helpApiKeyBtn.addEventListener('click', () => {
    apiKeyModal.classList.remove('hidden');
});

form.addEventListener('submit', sendForm)