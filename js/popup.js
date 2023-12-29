console.log("Popup script loaded");

document.getElementById('search-button').addEventListener('click', function() {
    const query = document.getElementById('search-input').value;
    if (query) {
        console.log("Searching for:", query);
        // 发送搜索请求到你的API
        fetch('https://supabase-server.vercel.app/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query, topK: 5 }) // 根据需要调整topK值
        })
        .then(response => response.json())
        .then(data => {
            console.log('Search results:', data);
            displayResults(data);
        })
        .catch(error => {
            console.error('Error during search:', error);
        });
    }
});

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // 清空先前的结果
    data.forEach(item => {
        const div = document.createElement('div');
        div.innerHTML = `
            <strong>${item.pageContent}</strong>
            <a href="${item.metadata.url}" target="_blank">${item.metadata.url}</a>
        `;
        resultsDiv.appendChild(div);
    });
}
