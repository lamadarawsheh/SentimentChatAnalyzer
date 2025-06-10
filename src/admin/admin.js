const socket = io('http://localhost:3000');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messages');
const positiveCount = document.getElementById('positiveCount');
const neutralCount = document.getElementById('neutralCount');
const negativeCount = document.getElementById('negativeCount');
const recentAnalysis = document.getElementById('recentAnalysis');

// Simple sentiment analysis function
function analyzeSentiment(text) {
    // Basic sentiment analysis based on common Arabic words
    const positiveWords = ['ممتاز', 'رائع', 'جميل', 'ممتازة', 'رائعة', 'جميلة'];
    const negativeWords = ['سيء', 'سيئة', 'سيئة', 'سيئ', 'مزعج', 'مزعجة'];
    
    // Convert text to lowercase for case-insensitive matching
    const lowerText = text.toLowerCase();
    
    // Count occurrences of positive and negative words
    let positiveScore = 0;
    let negativeScore = 0;
    
    // Check for positive words
    positiveWords.forEach(word => {
        positiveScore += (lowerText.match(new RegExp(word, 'g')) || []).length;
    });
    
    // Check for negative words
    negativeWords.forEach(word => {
        negativeScore += (lowerText.match(new RegExp(word, 'g')) || []).length;
    });
    
    // Determine sentiment based on scores
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
}

// Update sentiment statistics
function updateSentimentStats(sentiment) {
    const counts = {
        positive: parseInt(positiveCount.textContent) || 0,
        neutral: parseInt(neutralCount.textContent) || 0,
        negative: parseInt(negativeCount.textContent) || 0
    };

    switch (sentiment) {
        case 'positive':
            counts.positive++;
            break;
        case 'neutral':
            counts.neutral++;
            break;
        case 'negative':
            counts.negative++;
            break;
    }

    positiveCount.textContent = counts.positive;
    neutralCount.textContent = counts.neutral;
    negativeCount.textContent = counts.negative;
}

// Update sentiment statistics
function updateSentimentStats(sentiment) {
    const counts = {
        positive: parseInt(positiveCount.textContent) || 0,
        neutral: parseInt(neutralCount.textContent) || 0,
        negative: parseInt(negativeCount.textContent) || 0
    };

    switch (sentiment) {
        case 'positive':
            counts.positive++;
            break;
        case 'neutral':
            counts.neutral++;
            break;
        case 'negative':
            counts.negative++;
            break;
    }

    positiveCount.textContent = counts.positive;
    neutralCount.textContent = counts.neutral;
    negativeCount.textContent = counts.negative;
}

// Add message to UI
function addMessage(message, sender) {
    if (!message) return; // Don't add empty messages
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    messageElement.textContent = message;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send message
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    socket.emit('adminMessage', message);
    addMessage(message, 'admin');
    messageInput.value = '';
}

// Handle client messages
socket.on('clientMessage', (message) => {
    if (!message) return; // Don't process empty messages
    
    addMessage(message, 'client');
    
    // Analyze sentiment
    const analysis = analyzeSentiment(message);
    updateSentimentStats(analysis);
    
    // Add to recent analysis
    const analysisElement = document.createElement('div');
    analysisElement.className = 'analysis-item';
    analysisElement.innerHTML = `
        <p>${message}</p>
        <span class="sentiment ${analysis}">${analysis}</span>
    `;
    recentAnalysis.appendChild(analysisElement);
});

let chart;

// Initialize the chart
function initializeChart() {
    const ctx = document.getElementById('sentimentChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['إيجابي', 'محايد', 'سلبي'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    '#28a745', // Green for positive
                    '#ffc107', // Yellow for neutral
                    '#dc3545'  // Red for negative
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Cairo'
                        }
                    }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeChart();
    
    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

// Update the chart when sentiment stats change
function updateSentimentStats(sentiment) {
    const counts = {
        positive: parseInt(positiveCount.textContent) || 0,
        neutral: parseInt(neutralCount.textContent) || 0,
        negative: parseInt(negativeCount.textContent) || 0
    };

    switch (sentiment) {
        case 'positive':
            counts.positive++;
            break;
        case 'neutral':
            counts.neutral++;
            break;
        case 'negative':
            counts.negative++;
            break;
    }

    positiveCount.textContent = counts.positive;
    neutralCount.textContent = counts.neutral;
    negativeCount.textContent = counts.negative;

    // Update the chart
    if (chart) {
        chart.data.datasets[0].data = [
            counts.positive,
            counts.neutral,
            counts.negative
        ];
        chart.update();
    }
}
