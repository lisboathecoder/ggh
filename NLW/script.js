const apiKeyinput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const form = document.getElementById('form');
const aiResponse = document.getElementById('aiResponse');

const askAI = async

const sendForm = (event) => {
    event.preventDefault();
    const apiKey = apiKeyinput.value;
    const game = gameSelect.value;
    const question = questionInput.value;

    if (apiKey == '' || game == '' || question == '') {
        alert('Please fill in all fields.');
        return;
    }

    askButton.disabled = true;
    askButton.textContent = 'Asking...';
    askButton.class.add('loading');

    try {
        // pergunta para a AI
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing your request. Please try again later.');
        return;
    } finally {
        askButton.disabled = false;
        askButton.textContent = 'Ask';
        askButton.classList.remove('loading');
    }

form.addEventListener('submit', sendForm)
}