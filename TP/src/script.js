document.addEventListener("DOMContentLoaded", function () {
    const kpiList = document.getElementById('kpi-list');
    const sidebar = document.querySelector('.sidebar');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const dashboard = document.getElementById('dashboard');

    // Função para alternar entre os estados ativo e inativo do menu hamburger
    function toggleMenu() {
        sidebar.classList.toggle('active');
        hamburgerMenu.classList.toggle('active');

        // Adicionar ou remover a classe 'collapsed' conforme o estado do menu
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('collapsed');
        } else {
            sidebar.classList.add('collapsed');
        }
    }

    // Event listener para clicar no menu hamburger
    hamburgerMenu.addEventListener('click', toggleMenu);

    // Inicializar o Gridstack.js
    const grid = GridStack.init({
        column: 12, // número de colunas no grid
        float: true // permite que os itens sejam posicionados em qualquer lugar
    });

    function createChart(kpiName) {
        if (kpiName === 'Temperature') {
            fetchWeatherData(createWeatherChart);
        } else if (kpiName === 'Crypto') {
            showCryptoForm();
        } else {
            const chart = document.createElement('div');
            chart.className = 'chart';
            chart.innerHTML = `<h3>${kpiName} Chart</h3>`;
            grid.addWidget(chart);
        }
    }

    function showCryptoForm() {
        // Criar o modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <form id="crypto-form">
                    <label for="crypto-pair">Par de Moedas:</label>
                    <input type="text" id="crypto-pair" placeholder="ex: bitcoin/usd">
                    <label for="time-window">Janela Temporal:</label>
                    <select id="time-window">
                        <option value="minutes_1">1 minuto</option>
                        <option value="minutes_5">5 minutos</option>
                        <option value="minutes_15">15 minutos</option>
                        <option value="minutes_30">30 minutos</option>
                        <option value="1">1 dia</option>
                        <option value="7">7 dias</option>
                        <option value="30">30 dias</option>
                        <option value="90">90 dias</option>
                        <option value="365">1 ano</option>
                    </select>
                    <button type="submit">Gerar Gráfico</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Fechar o modal
        modal.querySelector('.close').onclick = function() {
            modal.style.display = 'none';
            document.body.removeChild(modal);
        };

        // Adicionar event listener ao formulário
        modal.querySelector('#crypto-form').onsubmit = function(event) {
            event.preventDefault();
            const cryptoPair = document.getElementById('crypto-pair').value;
            const timeWindow = document.getElementById('time-window').value;
            fetchCryptoData(cryptoPair, timeWindow, createCryptoChart);
            modal.style.display = 'none';
            document.body.removeChild(modal);
        };

        // Mostrar o modal
        modal.style.display = 'block';
    }

    // Adicionar event listener para o evento de arrastar nos itens KPI
    kpiList.querySelectorAll('.kpi').forEach(kpi => {
        kpi.addEventListener('dragstart', function (event) {
            const kpiName = event.target.innerText;
            event.dataTransfer.setData('text/plain', kpiName);
        });
    });

    // Adicionar event listener para o evento de soltar (drop) no dashboard
    dashboard.addEventListener('drop', function (event) {
        event.preventDefault();

        // Verifica se há dados transferidos
        if (event.dataTransfer.types.includes('text/plain')) {
            const kpiName = event.dataTransfer.getData('text/plain');
            createChart(kpiName);
        } else {
            console.error('Nenhum dado transferido durante o evento de soltar');
        }
    });

    // Adicionar event listeners para os eventos de arrastar e permitir soltar (dragover) no dashboard
    dashboard.addEventListener('dragover', function (event) {
        event.preventDefault();
    });

    // Botão Refresh
    const refreshButton = document.getElementById('refresh-btn');
    refreshButton.addEventListener('click', function () {
        // Adicione aqui a lógica para atualizar os KPIs
        console.log('Refreshing KPIs...');
    });

    // Botão Save
    const saveButton = document.getElementById('save-btn');
    saveButton.addEventListener('click', function () {
        // Adicione aqui a lógica para salvar o estado do dashboard
        console.log('Saving dashboard state...');
    });

    function fetchWeatherData(callback) {
        const apiUrl = 'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m'; // Substitua pela URL da API real
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao obter os dados da API');
                }
                return response.json();
            })
            .then(data => {
                // Depois de obter os dados, criar o gráfico
                callback(data.hourly);
            })
            .catch(error => {
                console.error('Erro ao buscar dados da API:', error);
            });
    }

    function fetchCryptoData(pair, window, callback) {
        const [crypto, currency] = pair.split('/');
        const windowParam = window.startsWith('minutes_') ? window.replace('minutes_', '') : window;
        const apiUrl = `https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=${currency}&days=${windowParam}`;
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao obter os dados da API de criptomoedas');
                }
                return response.json();
            })
            .then(data => {
                callback(data, pair, window);
            })
            .catch(error => {
                console.error('Erro ao buscar dados da API de criptomoedas:', error);
            });
    }

    // Gráficos
    function createWeatherChart(hourlyData) {
        const ctx = document.createElement('canvas');
        ctx.id = 'myWeatherChart';
        const chart = document.createElement('div');
        chart.className = 'chart';
        chart.appendChild(ctx);
        grid.addWidget(chart);

        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hourlyData.time,
                datasets: [{
                    label: 'Temperatura (°C)',
                    data: hourlyData.temperature_2m,
                    yAxisID: 'y-axis-1',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }, {
                    label: 'Velocidade do Vento (km/h)',
                    data: hourlyData.wind_speed_10m,
                    yAxisID: 'y-axis-2',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        type: 'linear',
                        display: true,
                        position: 'left',
                        id: 'y-axis-1',
                    }, {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        id: 'y-axis-2',
                        gridLines: {
                            drawOnChartArea: false,
                        },
                    }],
                }
            }
        });
    }

    function createCryptoChart(data, pair, window) {
        const ctx = document.createElement('canvas');
        ctx.id = 'myCryptoChart';
        const chart = document.createElement('div');
        chart.className = 'chart';
        chart.appendChild(ctx);
        grid.addWidget(chart);

        const labels = data.prices.map(price => new Date(price[0]).toLocaleTimeString());
        const prices = data.prices.map(price => price[1]);

        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Preço (${pair})`,
                    data: prices,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            unit: 'minute'
                        }
                    }]
                }
            }
        });

        setInterval(() => {
            fetchCryptoData(pair, window, newData => {
                const newLabels = newData.prices.map(price => new Date(price[0]).toLocaleTimeString());
                const newPrices = newData.prices.map(price => price[1]);

                myChart.data.labels = newLabels;
                myChart.data.datasets[0].data = newPrices;
                myChart.update();
            });
        }, 60000); // Atualizar a cada 60 segundos
    }

    // CSS para o modal
    const style = document.createElement('style');
    style.innerHTML = `
        .modal {
            display: none;
            position: fixed;
            z-index: 1;
            padding-top: 60px;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgb(0,0,0);
            background-color: rgba(0,0,0,0.4);
        }
        .modal-content {
            background-color: #fefefe;
            margin: 5% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
        }
        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
        }
        .close:hover,
        .close:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
});
