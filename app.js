// "Currency Converter- Simulation"
class CurrencyConverter {
    constructor() {
        this.currencies = {
            "USD": { name: "United States Dollar", flag: "🇺🇸" },
            "EUR": { name: "Euro", flag: "🇪🇺" },
            "GBP": { name: "British Pound Sterling", flag: "🇬🇧" },
            "JPY": { name: "Japanese Yen", flag: "🇯🇵" },
            "AUD": { name: "Australian Dollar", flag: "🇦🇺" },
            "CAD": { name: "Canadian Dollar", flag: "🇨🇦" },
            "CHF": { name: "Swiss Franc", flag: "🇨🇭" },
            "CNY": { name: "Chinese Yuan", flag: "🇨🇳" },
            "INR": { name: "Indian Rupee", flag: "🇮🇳" },
            "KRW": { name: "South Korean Won", flag: "🇰🇷" },
            "BRL": { name: "Brazilian Real", flag: "🇧🇷" },
            "MXN": { name: "Mexican Peso", flag: "🇲🇽" },
            "ZAR": { name: "South African Rand", flag: "🇿🇦" },
            "SGD": { name: "Singapore Dollar", flag: "🇸🇬" },
            "NZD": { name: "New Zealand Dollar", flag: "🇳🇿" },
            "HKD": { name: "Hong Kong Dollar", flag: "🇭🇰" },
            "NOK": { name: "Norwegian Krone", flag: "🇳🇴" },
            "SEK": { name: "Swedish Krona", flag: "🇸🇪" },
            "DKK": { name: "Danish Krone", flag: "🇩🇰" },
            "PLN": { name: "Polish Zloty", flag: "🇵🇱" },
            "RUB": { name: "Russian Ruble", flag: "🇷🇺" },
            "THB": { name: "Thai Baht", flag: "🇹🇭" },
            "TRY": { name: "Turkish Lira", flag: "🇹🇷" },
            "AED": { name: "UAE Dirham", flag: "🇦🇪" },
            "SAR": { name: "Saudi Riyal", flag: "🇸🇦" }
        };

        this.baseRates = {
            "USD": 1.0,
            "EUR": 0.85,
            "GBP": 0.79,
            "JPY": 110.25,
            "AUD": 1.35,
            "CAD": 1.25,
            "CHF": 0.92,
            "CNY": 6.45,
            "INR": 74.80,
            "KRW": 1180.50,
            "BRL": 5.20,
            "MXN": 20.15,
            "ZAR": 14.25,
            "SGD": 1.35,
            "NZD": 1.42,
            "HKD": 7.85,
            "NOK": 8.45,
            "SEK": 8.65,
            "DKK": 6.35,
            "PLN": 3.85,
            "RUB": 75.20,
            "THB": 33.15,
            "TRY": 8.45,
            "AED": 3.67,
            "SAR": 3.75
        };

        this.currentRates = { ...this.baseRates };
        this.previousRates = { ...this.baseRates };
        this.conversionHistory = this.loadHistory();
        this.favorites = this.loadFavorites();
        this.currentTheme = this.loadTheme();
        this.chart = null;
        this.rateUpdateInterval = null;

        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.populateCurrencySelects();
        this.populateRatesGrid();
        this.renderHistory();
        this.renderFavorites();
        this.setupChart();
        this.startRateUpdates();
        this.applyTheme();
        this.performInitialConversion();
    }

    setupEventListeners() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        document.getElementById('amount').addEventListener('input', () => this.convertCurrency());
        document.getElementById('from-currency').addEventListener('change', () => this.convertCurrency());
        document.getElementById('to-currency').addEventListener('change', () => this.convertCurrency());
        document.querySelector('.swap-btn').addEventListener('click', () => this.swapCurrencies());
        document.querySelector('.add-favorite').addEventListener('click', () => this.toggleFavorite());

        document.getElementById('base-currency').addEventListener('change', (e) => {
            this.changeBaseCurrency(e.target.value);
        });

        document.getElementById('currency-search').addEventListener('input', (e) => {
            this.filterRates(e.target.value);
        });

        document.getElementById('clear-history').addEventListener('click', () => this.clearHistory());
        document.getElementById('export-history').addEventListener('click', () => this.exportHistory());

        document.querySelector('.theme-toggle').addEventListener('click', () => this.toggleTheme());
    }

    populateCurrencySelects() {
        const fromSelect = document.getElementById('from-currency');
        const toSelect = document.getElementById('to-currency');
        const baseSelect = document.getElementById('base-currency');

        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';
        baseSelect.innerHTML = '';

        Object.keys(this.currencies).forEach(code => {
            const currency = this.currencies[code];
            const option = new Option(
                `${currency.flag} ${code} - ${currency.name}`,
                code
            );
            
            fromSelect.appendChild(option.cloneNode(true));
            toSelect.appendChild(option.cloneNode(true));
            
            const baseOption = new Option(`Base: ${code}`, code);
            baseSelect.appendChild(baseOption);
        });

        fromSelect.value = 'USD';
        toSelect.value = 'EUR';
        baseSelect.value = 'USD';
    }

    convertCurrency() {
        const amount = parseFloat(document.getElementById('amount').value) || 0;
        const fromCurrency = document.getElementById('from-currency').value;
        const toCurrency = document.getElementById('to-currency').value;

        if (amount <= 0) {
            this.updateConversionResult(0, toCurrency, 0);
            return;
        }

        const rate = this.getExchangeRate(fromCurrency, toCurrency);
        const convertedAmount = amount * rate;

        this.updateConversionResult(convertedAmount, toCurrency, rate);
        this.addToHistory(amount, fromCurrency, toCurrency, rate, convertedAmount);
        this.updateFavoriteButton();
    }

    getExchangeRate(from, to) {
        if (from === to) return 1;
        
        const fromRate = this.currentRates[from];
        const toRate = this.currentRates[to];
        
        return toRate / fromRate;
    }

    updateConversionResult(amount, currency, rate) {
        document.getElementById('converted-amount').textContent = amount.toFixed(2);
        document.getElementById('result-currency').textContent = currency;
        
        const fromCurrency = document.getElementById('from-currency').value;
        const rateText = `1 ${fromCurrency} = ${rate.toFixed(4)} ${currency}`;
        document.getElementById('exchange-rate-text').textContent = rateText;

        this.updateRateChange(fromCurrency, currency);
    }

    updateRateChange(from, to) {
        const currentRate = this.getExchangeRate(from, to);
        const previousRate = this.previousRates[to] / this.previousRates[from];
        const change = ((currentRate - previousRate) / previousRate) * 100;
        
        const rateChangeEl = document.getElementById('rate-change');
        rateChangeEl.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
        rateChangeEl.className = `rate-change ${change >= 0 ? 'positive' : 'negative'}`;
    }

    swapCurrencies() {
        const fromSelect = document.getElementById('from-currency');
        const toSelect = document.getElementById('to-currency');
        
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;
        
        this.convertCurrency();
    }

    toggleFavorite() {
        const fromCurrency = document.getElementById('from-currency').value;
        const toCurrency = document.getElementById('to-currency').value;
        const pair = `${fromCurrency}-${toCurrency}`;
        
        const index = this.favorites.findIndex(fav => fav.pair === pair);
        
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.showToast('Removed from favorites', 'success');
        } else {
            this.favorites.push({
                pair,
                from: fromCurrency,
                to: toCurrency,
                rate: this.getExchangeRate(fromCurrency, toCurrency),
                timestamp: new Date().toISOString()
            });
            this.showToast('Added to favorites', 'success');
        }
        
        this.saveFavorites();
        this.renderFavorites();
        this.updateFavoriteButton();
    }

    updateFavoriteButton() {
        const fromCurrency = document.getElementById('from-currency').value;
        const toCurrency = document.getElementById('to-currency').value;
        const pair = `${fromCurrency}-${toCurrency}`;
        
        const btn = document.querySelector('.add-favorite');
        const isFavorite = this.favorites.some(fav => fav.pair === pair);
        
        btn.classList.toggle('active', isFavorite);
        btn.title = isFavorite ? 'Remove from favorites' : 'Add to favorites';
    }

    addToHistory(amount, from, to, rate, result) {
        const entry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            amount,
            from,
            to,
            rate,
            result
        };
        
        this.conversionHistory.unshift(entry);
        
        if (this.conversionHistory.length > 200) {
            this.conversionHistory = this.conversionHistory.slice(0, 200);
        }
        
        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        const tbody = document.getElementById('history-tbody');
        const emptyState = document.getElementById('empty-history');
        
        if (this.conversionHistory.length === 0) {
            tbody.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        tbody.style.display = '';
        emptyState.style.display = 'none';
        
        tbody.innerHTML = this.conversionHistory.map(entry => `
            <tr>
                <td>${new Date(entry.timestamp).toLocaleString()}</td>
                <td>${this.currencies[entry.from].flag} ${entry.amount} ${entry.from}</td>
                <td>${this.currencies[entry.to].flag} ${entry.result.toFixed(2)} ${entry.to}</td>
                <td>${entry.rate.toFixed(4)}</td>
                <td>${entry.result.toFixed(2)} ${entry.to}</td>
            </tr>
        `).join('');
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all conversion history?')) {
            this.conversionHistory = [];
            this.saveHistory();
            this.renderHistory();
            this.showToast('History cleared', 'success');
        }
    }

    exportHistory() {
        if (this.conversionHistory.length === 0) {
            this.showToast('No history to export', 'warning');
            return;
        }

        const csv = [
            'Date,Amount,From Currency,To Currency,Exchange Rate,Result',
            ...this.conversionHistory.map(entry => 
                `"${new Date(entry.timestamp).toLocaleString()}",${entry.amount},${entry.from},${entry.to},${entry.rate},${entry.result}`
            )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `currency-conversion-history-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showToast('History exported', 'success');
    }

    renderFavorites() {
        const grid = document.getElementById('favorites-grid');
        const emptyState = document.getElementById('empty-favorites');
        
        if (this.favorites.length === 0) {
            grid.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        grid.innerHTML = this.favorites.map(favorite => {
            const currentRate = this.getExchangeRate(favorite.from, favorite.to);
            return `
                <div class="favorite-item">
                    <div class="favorite-header">
                        <div class="favorite-pair">
                            ${this.currencies[favorite.from].flag} ${favorite.from} → ${this.currencies[favorite.to].flag} ${favorite.to}
                        </div>
                        <button class="remove-favorite" data-pair="${favorite.pair}" title="Remove from favorites">
                            ❌
                        </button>
                    </div>
                    <div class="favorite-rate">${currentRate.toFixed(4)}</div>
                    <div class="currency-full-name">
                        ${this.currencies[favorite.from].name} to ${this.currencies[favorite.to].name}
                    </div>
                </div>
            `;
        }).join('');
        
        grid.querySelectorAll('.remove-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pair = e.target.dataset.pair;
                this.favorites = this.favorites.filter(fav => fav.pair !== pair);
                this.saveFavorites();
                this.renderFavorites();
                this.updateFavoriteButton();
                this.showToast('Removed from favorites', 'success');
            });
        });
    }

    populateRatesGrid() {
        const grid = document.getElementById('rates-grid');
        const baseCurrency = document.getElementById('base-currency').value;
        
        grid.innerHTML = Object.keys(this.currencies)
            .filter(code => code !== baseCurrency)
            .map(code => {
                const currency = this.currencies[code];
                const rate = this.currentRates[code] / this.currentRates[baseCurrency];
                const previousRate = this.previousRates[code] / this.previousRates[baseCurrency];
                const change = ((rate - previousRate) / previousRate) * 100;
                
                return `
                    <div class="rate-item" data-currency="${code}">
                        <div class="rate-header">
                            <div class="currency-info">
                                <span class="currency-flag">${currency.flag}</span>
                                <span class="currency-name">${code}</span>
                            </div>
                            <span class="rate-change ${change >= 0 ? 'positive' : 'negative'}">
                                ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
                            </span>
                        </div>
                        <div class="rate-value">${rate.toFixed(4)}</div>
                        <div class="currency-full-name">${currency.name}</div>
                    </div>
                `;
            }).join('');
    }

    changeBaseCurrency(newBase) {
        this.populateRatesGrid();
        this.convertCurrency();
    }

    filterRates(searchTerm) {
        const items = document.querySelectorAll('.rate-item');
        const term = searchTerm.toLowerCase();
        
        items.forEach(item => {
            const currency = item.dataset.currency;
            const name = this.currencies[currency].name.toLowerCase();
            const matches = currency.toLowerCase().includes(term) || name.includes(term);
            item.style.display = matches ? 'block' : 'none';
        });
    }

    setupChart() {
        const ctx = document.getElementById('rate-chart').getContext('2d');
        const fromCurrency = document.getElementById('from-currency').value;
        const toCurrency = document.getElementById('to-currency').value;
        
        const days = 7;
        const labels = [];
        const data = [];
        const baseRate = this.getExchangeRate(fromCurrency, toCurrency);
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            const variation = (Math.random() - 0.5) * 0.04;
            data.push(baseRate * (1 + variation));
        }
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: `${fromCurrency} to ${toCurrency}`,
                    data,
                    borderColor: '#21808D',
                    backgroundColor: 'rgba(33, 128, 141, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#626C71'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#626C71'
                        }
                    }
                }
            }
        });
    }

    updateChart() {
        if (!this.chart) return;
        
        const fromCurrency = document.getElementById('from-currency').value;
        const toCurrency = document.getElementById('to-currency').value;
        
        this.chart.data.datasets[0].label = `${fromCurrency} to ${toCurrency}`;
        
        const currentRate = this.getExchangeRate(fromCurrency, toCurrency);
        this.chart.data.datasets[0].data[this.chart.data.datasets[0].data.length - 1] = currentRate;
        
        this.chart.update();
    }

    startRateUpdates() {
        this.rateUpdateInterval = setInterval(() => {
            this.simulateRateUpdate();
        }, 30000); 
    }

    simulateRateUpdate() {
        this.showLoadingOverlay();
        
        this.previousRates = { ...this.currentRates };
        
        Object.keys(this.currentRates).forEach(currency => {
            if (currency !== 'USD') {
                const variation = (Math.random() - 0.5) * 0.01;
                this.currentRates[currency] = this.baseRates[currency] * (1 + variation);
            }
        });
        
        setTimeout(() => {
            this.hideLoadingOverlay();
            this.populateRatesGrid();
            this.convertCurrency();
            this.updateChart();
            this.showToast('Exchange rates updated', 'success');
        }, 1000);
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-color-scheme', this.currentTheme);
        const themeBtn = document.querySelector('.theme-toggle');
        themeBtn.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
    }

    showLoadingOverlay() {
        document.getElementById('loading-overlay').classList.add('show');
    }

    hideLoadingOverlay() {
        document.getElementById('loading-overlay').classList.remove('show');
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => container.removeChild(toast), 300);
        }, 3000);
    }

    performInitialConversion() {
        this.convertCurrency();
    }

    saveHistory() {
        try {
            this.conversionHistory = this.conversionHistory || [];
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }

    loadHistory() {
        try {
            return [];
        } catch (error) {
            console.error('Error loading history:', error);
            return [];
        }
    }

    saveFavorites() {
        try {
            this.favorites = this.favorites || [];
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    }

    loadFavorites() {
        try {
            return [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    saveTheme() {
        try {
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    }

    loadTheme() {
        try {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } catch (error) {
            console.error('Error loading theme:', error);
            return 'light';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.currencyConverter = new CurrencyConverter();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CurrencyConverter;
}