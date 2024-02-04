console.log("Popup script loaded");

document.getElementById('search-button').addEventListener('click', async function() {
    const query = document.getElementById('search-input').value;
    if (query) {
        console.log("Searching for:", query);
        try {
            // 发送搜索请求到你的API
            const searchResponse = await fetch('https://supabase-server.vercel.app/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query, topK: 10 }) // 根据需要调整topK值
            });

            if (!searchResponse.ok) {
                throw new Error(`Search request failed: ${searchResponse.statusText}`);
            }

            const searchData = await searchResponse.json();
            console.log('Search results:', searchData);
            displayResults(searchData);

            // 使用搜索结果继续AI请求
            try {
                // const aiResponse = await fetch('https://supabase-server.vercel.app/api/ai', {
                const aiResponse = await fetch('http://127.0.0.1:3000/api/ai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query, contents: searchData }) // 注意：确保API期望的参数名称与此处一致
                });

                if (!aiResponse.ok) {
                    throw new Error(`AI request failed: ${aiResponse.statusText}`);
                }

                const aiData = await aiResponse.json();
                console.log('AI results:', aiData);
            } catch (error) {
                console.error('Error during AI processing:', error);
            }
        } catch (error) {
            console.error('Error during search:', error);
        }
    }
});

let currentData = [];
let currentPage = 1; // Current page number
const urlsPerPage = 5; // Limit of URLs per page

function displayResults(data) {
    currentData = data;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear previous results

    // Calculate the pagination
    const startIndex = (currentPage - 1) * urlsPerPage;
    const endIndex = startIndex + urlsPerPage;
    const paginatedItems = data.slice(startIndex, endIndex);

    // Display paginated items
    paginatedItems.forEach(item => {
        const div = document.createElement('div');
        div.innerHTML = `
            <strong>${item.pageContent}</strong>
            <a href="${item.metadata.url}" target="_blank">${item.metadata.url}</a>
        `;
        resultsDiv.appendChild(div);
    });

    // Add pagination controls
    updatePaginationControls();
}

function updatePaginationControls() {
    const totalPages = Math.ceil(currentData.length / urlsPerPage);
    const pageIndicator = document.getElementById('page-indicator');
    pageIndicator.innerText = `Page ${currentPage} of ${totalPages}`;
}

// Event listener for the 'Prev' button
document.getElementById('prev-button').addEventListener('click', function() {
    if (currentPage > 1) {
        currentPage--;
        displayResults(currentData);
    }
});

// Event listener for the 'Next' button
document.getElementById('next-button').addEventListener('click', function() {
    const totalPages = Math.ceil(currentData.length / urlsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayResults(currentData);
    }
});

// Initially, you might want to disable the 'Prev' and 'Next' buttons
// document.getElementById('prev-button').disabled = currentPage === 1;
// const totalPages = Math.ceil(currentData.length / urlsPerPage);
// document.getElementById('next-button').disabled = currentPage === totalPages;


