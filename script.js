const GITHUB_USERNAME = 'NomusBoxes';
const REPO_NAME = 'database';
const TOKEN = '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';

document.getElementById('auth-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const user = document.getElementById('user').value;
    const password = document.getElementById('password').value;

    if (password) {
        document.querySelector('.auth-container').classList.add('hidden');
        document.querySelector('.diary-container').classList.remove('hidden');

        // Загружаем существующие записи, если есть
        loadEntry(user).then(entry => {
            document.getElementById('entry').value = entry;
        });
    } else {
        alert('Пожалуйста, введите пароль.');
    }
});

let saveTimeout;
document.getElementById('entry').addEventListener('input', function() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveEntry, 2000);
});

function saveEntry() {
    const user = document.getElementById('user').value;
    const entry = document.getElementById('entry').value;
    updateFile(user, entry);
}

document.getElementById('view-other').addEventListener('click', function() {
    const user = document.getElementById('user').value;
    const otherUser = user === 'vika' ? 'arsenty' : 'vika';
    loadEntry(otherUser).then(otherEntry => {
        alert(`Мысли ${otherUser}: ${otherEntry}`);
    });
});

async function loadEntry(user) {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${user}.txt`, {
        headers: {
            'Authorization': `token ${TOKEN}`,
            'Accept': 'application/vnd.github.v3.raw'
        }
    });

    if (!response.ok) {
        return '';
    }

    return await response.text();
}

async function updateFile(user, content) {
    const filePath = `${user}.txt`;

    const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${filePath}`, {
        method: 'GET',
        headers: {
            'Authorization': `token ${TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    const data = await response.json();
    const sha = data.sha;

    await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
            message: `Update ${user} entry`,
            content: btoa(unescape(encodeURIComponent(content))),
            sha: sha
        })
    });
}
