let currentChart = null; 

document.getElementById('searchForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const queryValue = document.getElementById('query').value;
    
    const response = await fetch('/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryValue })
    });

    const searchResults = await response.json();

    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = searchResults.map((item, idx) => 
        `<div class="result">
            <p>${idx + 1}. ${item.doc}</p>
            <p class="similarity-score">Similarity Score: ${item.similarity.toFixed(4)}</p>
        </div>`
    ).join('');

    if (currentChart) {
        currentChart.destroy();
    }

    const canvasContext = document.getElementById('chart').getContext('2d');
    currentChart = new Chart(canvasContext, {
        type: 'bar',
        data: {
            labels: searchResults.map((_, index) => `Document ${index + 1}`),
            datasets: [{
                label: 'Cosine Similarity',
                data: searchResults.map(item => parseFloat(item.similarity).toFixed(4)),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                        stepSize: 0.1
                    }
                }
            }
        }
    });
});