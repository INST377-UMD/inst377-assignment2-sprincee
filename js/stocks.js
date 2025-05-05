const POLYGON_API_KEY = 'g7281AJ90UpzzeC2MG0Epvw4CZY7bBNU'

let stockChart = null;
let selectedDays = 30;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Stocks page loaded');

    initializeChart();
    loadRedditStocks();
    setupEventListeners();
    addStockVoiceCommand();
});

function initializeChart() {
    const ctx = document.getElementById('stock-chart').getContext('2d');
    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Stock Price',
                data: [],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 2,
                pointRadius: 3,
                tension: 0.1 
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Stock Price History',
                    font: {
                        size: 18
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Price (USD)'
                    }
                }
            }
        }
    });
}

async function loadRedditStocks() {
    try {
        const response = await fetch('https://tradestie.com/api/v1/apps/reddit');
        const data = await response.json();

        console.log("Reddit API response:", data);

        const topStocks = data.slice(0, 5);

        console.log("Top 5 stocks:", topStocks);

        const tableBody = document.querySelector('#reddit-stocks tbody');
        tableBody.innerHTML = '';

        topStocks.forEach(stock => {
            console.log("Processing stock:", stock);
            const row = document.createElement('tr');

            const tickerCell = document.createElement('td');
            const tickerLink = document.createElement('a');
            tickerLink.href = `https://finance.yahoo.com/quote/${stock.ticker}`;
            tickerLink.textContent = stock.ticker;
            tickerLink.className = 'ticker-link';
            tickerLink.target = '_blank';
            tickerCell.appendChild(tickerLink);

            const commentCell = document.createElement('td');
            commentCell.textContent = stock.no_of_comments;

            const sentimentCell = document.createElement('td');
            const sentimentIcon = document.createElement('span');
            sentimentIcon.className = 'sentiment-icon';

            if (stock.sentiment === 'Bullish') {
                sentimentIcon.innerHTML = '&#x1F43A;'; 
                sentimentIcon.classList.add('bullish');
                sentimentCell.textContent = 'Bullish ';
            } else {
                sentimentIcon.innerHTML = '&#x1F43B;'; 
                sentimentIcon.classList.add('bearish');
                sentimentCell.textContent = 'Bearish ';
            }
            
            sentimentCell.appendChild(sentimentIcon);
            
            
            row.appendChild(tickerCell);
            row.appendChild(commentCell);
            row.appendChild(sentimentCell);
            
            
            tableBody.appendChild(row);

            console.log("Added row for ticker:", stock.ticker);
            console.log("Finshed processes.")
        });
    } catch (error) {
        console.error('Error loading Reddit stocks:', error);
    }
}

function setupEventListeners() {
    const timeButtons = document.querySelectorAll('.time-button');
    timeButtons.forEach(button => {
        button.addEventListener('click', function(){
            
            timeButtons.forEach(btn => btn.classList.remove('selected'));

            this.classList.add('selected');

            selectedDays = parseInt(this.getAttribute('data-days'));
        });
    });

    const lookupButton = document.getElementById('lookup-button');
    lookupButton.addEventListener('click', function() {
        const ticker = document.getElementById('ticker-input').value.trim().toUpperCase();
        if (ticker) {
            lookupStock(ticker, selectedDays);
        }
    });

    const tickerInput = document.getElementById('ticker-input');
    tickerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const ticker = this.value.trim().toUpperCase();
            if (ticker) {
                lookupStock(ticker, selectedDays);
            }
        }
    });
}

function addStockVoiceCommand() {
    if (typeof annyang !== 'undefined') {
        const commands = {
            'lookup *stock': function(stock) {
                console.log('Stock lookup command recognized:', stock);
                const ticker = stock.trim().toUpperCase();
                document.getElementById('ticker-input').value = ticker;
                lookupStock(ticker, 30); 
            }
        };
        
        annyang.addCommands(commands);
    }
}

async function lookupStock(ticker, days) {
    console.log(`Looking up ${ticker} for ${days} days...`);

    const errorMessage = document.querySelector('.error-message') || document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.style.display = 'none';

    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const startFormatted = startDate.toISOString().split('T')[0];
        const endFormatted = endDate.toISOString().split('T')[0];

        const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${startFormatted}/${endFormatted}?apiKey=${POLYGON_API_KEY}`
        const response = await fetch(url);
        const data = await response.json();

        if (data.resultsCount === 0 || !data.results) {
            throw new Error('No data available for this ticker.');
        }

        const chartData = processStockData(data.results);

        updateChart(ticker, chartData);
    } catch (error) {
        console.error('Error looking up stock:', error);

        errorMessage.textContent = `Error: ${error.message || 'Failed to fetch stock data. Please try again.'}`;
        errorMessage.style.display = 'block';

        const chartContainer = document.querySelector('.chart-container');
        if (!document.querySelector('.error-message')) {
            chartContainer.appendChild(errorMessage);
        }
    }
}

function processStockData(results) {
    return results.map(item => {
        const date = new Date(item.t);
        return {
            date: date.toLocaleDateString(),
            price: item.c 
        };
    });
}


function updateChart(ticker, data) {
    const dates = data.map(item => item.date);
    const prices = data.map(item => item.price);
    

    stockChart.data.labels = dates;
    stockChart.data.datasets[0].data = prices;
    stockChart.data.datasets[0].label = `${ticker} Price`;
    

    stockChart.options.plugins.title.text = `${ticker} Stock Price - ${selectedDays} Day History`;
    

    stockChart.update();
}

