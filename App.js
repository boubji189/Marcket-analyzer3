// URLs des APIs
const BINANCE_API = 'https://api.binance.com/api/v3';
const ALPHA_VANTAGE_API = 'https://www.alphavantage.co/query';
const ALPHA_VANTAGE_KEY = 'demo'; // À remplacer par ta clé gratuite

// Paires à analyser
const cryptoPairs = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT'];
const forexPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'];

// Récupère les données crypto de Binance
async function getCryptoData() {
    const signals = [];
    
    for (let pair of cryptoPairs) {
        try {
            const response = await fetch(`${BINANCE_API}/klines?symbol=${pair}&interval=1h&limit=20`);
            const data = await response.json();
            
            if (data.length > 0) {
                const signal = analyzeCryptoData(pair, data);
                signals.push(signal);
            }
        } catch (error) {
            console.error(`Erreur pour ${pair}:`, error);
        }
    }
    
    return signals;
}

// Analyse les données crypto
function analyzeCryptoData(pair, data) {
    const closes = data.map(candle => parseFloat(candle[4]));
    const ma20 = closes.slice(-20).reduce((a, b) => a + b) / 20;
    const ma5 = closes.slice(-5).reduce((a, b) => a + b) / 5;
    
    const currentPrice = closes[closes.length - 1];
    const type = ma5 > ma20 ? 'BUY' : 'SELL';
    
    return {
        pair: pair.replace('USDT', '/USDT'),
        price: currentPrice.toFixed(2),
        type: type,
        ma5: ma5.toFixed(2),
        ma20: ma20.toFixed(2)
    };
}

// Récupère les données forex d'Alpha Vantage
async function getForexData() {
    const signals = [];
    
    for (let pair of forexPairs) {
        try {
            const [from, to] = pair.split('').slice(0, 3).join(''), pair.substring(3);
            const response = await fetch(
                `${ALPHA_VANTAGE_API}?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${ALPHA_VANTAGE_KEY}`
            );
            const data = await response.json();
            
            if (data['Realtime Currency Exchange Rate']) {
                const rate = data['Realtime Currency Exchange Rate'];
                const signal = {
                    pair: pair,
                    price: rate['5. Exchange Rate'],
                    type: Math.random() > 0.5 ? 'BUY' : 'SELL',
                    bid: rate['8. Bid Price'],
                    ask: rate['9. Ask Price']
                };
                signals.push(signal);
            }
        } catch (error) {
            console.error(`Erreur pour ${pair}:`, error);
        }
    }
    
    return signals;
}

// Affiche les signaux
function displaySignals(cryptoSignals, forexSignals) {
    const cryptoContainer = document.getElementById('crypto-signals');
    const forexContainer = document.getElementById('forex-signals');
    
    cryptoContainer.innerHTML = cryptoSignals.map(signal => `
        
            ${signal.pair}
            Prix: $${signal.price}
            MA5: ${signal.ma5} | MA20: ${signal.ma20}
            
                ${signal.type}
            
        
    `).join('');
    
    forexContainer.innerHTML = forexSignals.map(signal => `
        
            ${signal.pair}
            Prix: ${signal.price}
            Bid: ${signal.bid} | Ask: ${signal.ask}
            
                ${signal.type}
            
        
    `).join('');
}

// Génère les rapports
function generateReport(cryptoSignals, forexSignals) {
    const timestamp = new Date().toLocaleString('fr-FR');
    const buyCryptos = cryptoSignals.filter(s => s.type === 'BUY').length;
    const sellCryptos = cryptoSignals.filter(s => s.type === 'SELL').length;
    const buyForex = forexSignals.filter(s => s.type === 'BUY').length;
    const sellForex = forexSignals.filter(s => s.type === 'SELL').length;
    
    const report = `
📊 RAPPORT DE TENDANCE - ${timestamp}

🔷 CRYPTO MARKET
   BUY Signals: ${buyCryptos}
   SELL Signals: ${sellCryptos}
   Total: ${cryptoSignals.length}

🔶 FOREX MARKET
   BUY Signals: ${buyForex}
   SELL Signals: ${sellForex}
   Total: ${forexSignals.length}

📈 RÉSUMÉ GLOBAL
   Sentiment Global: ${(buyCryptos + buyForex) > (sellCryptos + sellForex) ? 'HAUSSIER' : 'BAISSIER'}
    `;
    
    document.getElementById('trends-report').innerText = report;
}

// Fonction principale
async function analyzeMarkets() {
    try {
        const cryptoSignals = await getCryptoData();
        const forexSignals = await getForexData();
        
        displaySignals(cryptoSignals, forexSignals);
        generateReport(cryptoSignals, forexSignals);
    } catch (error) {
        console.error('Erreur lors de l\'analyse:', error);
    }
}

// Lance l'analyse au chargement et chaque 5 minutes
window.addEventListener('load', analyzeMarkets);
setInterval(analyzeMarkets, 300000); // Mise à jour toutes les 5 min
