document.addEventListener("DOMContentLoaded", function () {
    const kpiList = document.getElementById('kpi-list');
    const sidebar = document.querySelector('.sidebar');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const dashboard = document.querySelector('.dashboard');
    const discardArea = document.getElementById('discard-area');
    const updateInterval = 60000; // Update interval in milliseconds (e.g., 60000 ms = 1 minute)

    function toggleMenu() {
        sidebar.classList.toggle('active');
        sidebar.classList.toggle('collapsed');
        hamburgerMenu.classList.toggle('active');
    }

    hamburgerMenu.addEventListener('click', toggleMenu);

    const grid = GridStack.init({
        column: 12,
        float: true,
        removable: '#discard-area',
        removeTimeout: 100,
        acceptWidgets: true,
        resizable: {
            handles: 'e, se, s, sw, w'
        }
    });

    function createChart(kpiName) {
        if (kpiName === 'Price Chart') {
            showCryptoForm();
        } else if (kpiName === 'Crypto Market Share Pie Chart') {
            fetchTopCryptosMarketData();
        } else if (kpiName === 'Market cap') {
            showForm('Area Chart');
        } else if (kpiName === 'Accumulated Trading Volume') {
            showForm('Scatter Plot');
        } else if (kpiName === 'Volume of Transactions') {
            fetchVolumeOfTransactionsData();
        } else if (kpiName === 'Crypto Volume Bar Chart') {
            fetchVolumeOfTransactionsData();
        } else if (kpiName === 'Total Market Cap Growth') {
            fetchTotalMarketCapGrowthData();
        } else {
            showCryptoForm();
        }
    }

    function showForm(chartType) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <form id="crypto-form">
                    <label for="crypto-pair">Par de Moedas:</label>
                    <input type="text" id="crypto-pair" placeholder="ex: bitcoin/usd" required>
                    <label for="time-window">Janela Temporal:</label>
                    <select id="time-window" required>
                        <option value="0.0416">1 minuto</option>
                        <option value="0.0833">5 minutos</option>
                        <option value="0.1667">10 minutos</option>
                        <option value="0.5">30 minutos</option>
                        <option value="1">1 hora</option>
                        <option value="24">1 dia</option>
                        <option value="168">7 dias</option>
                        <option value="720">30 dias</option>
                        <option value="2160">90 dias</option>
                        <option value="8760">1 ano</option>
                    </select>
                    <input type="hidden" id="chart-type" value="${chartType}">
                    <button type="submit">Gerar Gráfico</button>
                    <span class="close">&times;</span>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.close').onclick = function() {
            modal.style.display = 'none';
            document.body.removeChild(modal);
        };

        modal.querySelector('#crypto-form').onsubmit = function(event) {
            event.preventDefault();
            const cryptoPair = document.getElementById('crypto-pair').value;
            const timeWindow = document.getElementById('time-window').value;
            const chartType = document.getElementById('chart-type').value;
            modal.style.display = 'none';
            document.body.removeChild(modal);
            fetchCryptoData(cryptoPair, timeWindow, chartType);
        };

        modal.style.display = 'block';
    }

    function showCryptoForm() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <form id="crypto-form">
                    <label for="crypto-pair">Par de Moedas:</label>
                    <input type="text" id="crypto-pair" placeholder="ex: bitcoin/usd" required>
                    <label for="time-window">Janela Temporal:</label>
                    <select id="time-window" required>
                        <option value="0.0416">1 minuto</option>
                        <option value="0.0833">5 minutos</option>
                        <option value="0.1667">10 minutos</option>
                        <option value="0.5">30 minutos</option>
                        <option value="1">1 hora</option>
                        <option value="24">1 dia</option>
                        <option value="168">7 dias</option>
                        <option value="720">30 dias</option>
                        <option value="2160">90 dias</option>
                        <option value="8760">1 ano</option>
                    </select>
                    <label for="chart-type">Tipo de Gráfico:</label>
                    <select id="chart-type" required>
                        <option value="Line Chart">Line Chart</option>
                        <option value="Bar Chart">Bar Chart</option>
                        <option value="Area Chart">Area Chart</option>
                        <option value="Scatter Plot">Scatter Plot</option>
                        <option value="Bubble Chart">Bubble Chart</option>
                    </select>
                    <button type="submit">Gerar Gráfico</button>
                    <span class="close">&times;</span>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.close').onclick = function() {
            modal.style.display = 'none';
            document.body.removeChild(modal);
        };

        modal.querySelector('#crypto-form').onsubmit = function(event) {
            event.preventDefault();
            const cryptoPair = document.getElementById('crypto-pair').value;
            const timeWindow = document.getElementById('time-window').value;
            const chartType = document.getElementById('chart-type').value;
            fetchCryptoData(cryptoPair, timeWindow, chartType);
            modal.style.display = 'none';
            document.body.removeChild(modal);
        };

        modal.style.display = 'block';
    }

    function fetchScatterPlotData(pair, timeWindow) {
        const [crypto, currency] = pair.split('/');
        const apiUrl = `https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=${currency}&days=${timeWindow}`;
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao obter os dados da API de criptomoedas');
                }
                return response.json();
            })
            .then(data => {
                if (!data.prices) {
                    throw new Error('Data format error: prices array is undefined');
                }
                const scatterPlotData = data.prices.map(price => price[1]);
                createScatterPlot(scatterPlotData, pair, timeWindow);
            })
            .catch(error => {
                console.error('Erro ao buscar dados da API de criptomoedas:', error);
            });
    }

    function fetchVolumeOfTransactionsData() {
        const apiUrl = 'https://api.coingecko.com/api/v3/exchanges/binance/volume_chart?days=30';
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao obter os dados de volume de transações da API');
                }
                return response.json();
            })
            .then(data => {
                createBarChart({ total_volumes: data }, 'binance', 30);
            })
            .catch(error => {
                console.error('Erro ao buscar dados de volume de transações da API:', error);
            });
    }

    function fetchTopCryptosMarketData() {
        const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1';
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao obter os dados da API de criptomoedas');
                }
                return response.json();
            })
            .then(data => {
                createPieChart(data);
            })
            .catch(error => {
                console.error('Erro ao buscar dados da API de criptomoedas:', error);
            });
    }

    function fetchCryptoData(pair, window, chartType) {
        const [crypto, currency] = pair.split('/');
        const apiUrl = `https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=${currency}&days=${window}`;
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao obter os dados da API de criptomoedas');
                }
                return response.json();
            })
            .then(data => {
                switch (chartType) {
                    case 'Line Chart':
                        createLineChart(data, pair, window);
                        break;
                    case 'Bar Chart':
                        createBarChart(data, pair, window);
                        break;
                    case 'Pie Chart':
                        createPieChart(data, pair, window);
                        break;
                    case 'Area Chart':
                        createAreaChart(data, pair, window);
                        break;
                    case 'Scatter Plot':
                        createScatterPlot(data, pair, window);
                        break;
                    case 'Bubble Chart':
                        createBubbleChart(data, pair, window);
                        break;
                    default:
                        console.error('Tipo de gráfico desconhecido');
                        break;
                }
                setInterval(() => updateChart(pair, window, chartType), updateInterval);
            })
            .catch(error => {
                console.error('Erro ao buscar dados da API de criptomoedas:', error);
            });
    }

    function updateChart(pair, window, chartType) {
        const [crypto, currency] = pair.split('/');
        const apiUrl = `https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=${currency}&days=${window}`;
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao obter os dados da API de criptomoedas');
                }
                return response.json();
            })
            .then(data => {
                switch (chartType) {
                    case 'Line Chart':
                        updateLineChart(data, pair, window);
                        break;
                    case 'Bar Chart':
                        updateBarChart(data, pair, window);
                        break;
                    case 'Pie Chart':
                        updatePieChart(data, pair, window);
                        break;
                    case 'Area Chart':
                        updateAreaChart(data, pair, window);
                        break;
                    case 'Scatter Plot':
                        updateScatterPlot(data, pair, window);
                        break;
                    case 'Bubble Chart':
                        updateBubbleChart(data, pair, window);
                        break;
                    default:
                        console.error('Tipo de gráfico desconhecido');
                        break;
                }
            })
            .catch(error => {
                console.error('Erro ao buscar dados da API de criptomoedas:', error);
            });
    }

 
    kpiList.querySelectorAll('.kpi').forEach(kpi => {
        kpi.addEventListener('dragstart', function (event) {
            const kpiName = event.target.innerText;
            event.dataTransfer.setData('text/plain', kpiName);
        });
    });

    dashboard.addEventListener('drop', function (event) {
        event.preventDefault();

        if (event.dataTransfer.types.includes('text/plain')) {
            const kpiName = event.dataTransfer.getData('text/plain');
            createChart(kpiName);
        } else {
            console.error('Nenhum dado transferido durante o evento de soltar');
        }
    });

    dashboard.addEventListener('dragover', function (event) {
        event.preventDefault();
    });

    discardArea.addEventListener('drop', function (event) {
        event.preventDefault();
        const gridItem = document.querySelector('.grid-stack-item.ui-draggable-dragging');
        if (gridItem) {
            grid.removeWidget(gridItem);
        }
    });

    discardArea.addEventListener('dragover', function (event) {
        event.preventDefault();
    });

    // Chart creation functions
    function createLineChart(data, pair, window) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'grid-stack-item';
        chartContainer.innerHTML = `<div class="grid-stack-item-content chart"><h3>${pair} - Line Chart</h3></div>`;
        grid.addWidget(chartContainer, { width: 6, height: 4, autoPosition: true });

        const margin = { top: 20, right: 30, bottom: 70, left: 60 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(chartContainer.querySelector('.chart')).append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const labels = data.prices.map(price => new Date(price[0]));
        const prices = data.prices.map(price => price[1]);

        const x = d3.scaleTime()
            .domain(d3.extent(labels))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([d3.min(prices), d3.max(prices)])
            .range([height, 0]);

        const line = d3.line()
            .x((d, i) => x(labels[i]))
            .y(d => y(d));

        svg.append('path')
            .datum(prices)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 2)
            .attr('d', line);

        const xAxis = d3.axisBottom(x);

        if (window <= 1) {
            xAxis.ticks(d3.timeMinute.every(5)).tickFormat(d3.timeFormat("%H:%M:%S"));
        } else if (window <= 24) {
            xAxis.ticks(d3.timeHour.every(1)).tickFormat(d3.timeFormat("%H:%M"));
        } else {
            xAxis.ticks(d3.timeDay.every(1)).tickFormat(d3.timeFormat("%b %d %H:%M"));
        }

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.append('g')
            .call(d3.axisLeft(y).ticks(5));
    }

    function createBarChart(data, pair, window) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'grid-stack-item';
        chartContainer.innerHTML = `<div class="grid-stack-item-content chart"><h3>${pair} - Volume of Transactions</h3></div>`;
        grid.addWidget(chartContainer, { width: 6, height: 4, autoPosition: true });

        const margin = { top: 20, right: 30, bottom: 50, left: 60 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const interval = Math.ceil(data.total_volumes.length / 30);
        const aggregatedVolumes = aggregateData(data.total_volumes, interval);

        const labels = aggregatedVolumes.map(volume => new Date(volume[0]));
        const volumes = aggregatedVolumes.map(volume => volume[1]);

        const svg = d3.select(chartContainer.querySelector('.chart')).append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(labels)
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(volumes)])
            .range([height, 0]);

        svg.selectAll('.bar')
            .data(volumes)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', (d, i) => x(labels[i]))
            .attr('y', d => y(d))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d))
            .attr('fill', 'steelblue');

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %d")).ticks(5));

        svg.append('g')
            .call(d3.axisLeft(y).ticks(5));
    }

    function createPieChart(data) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'grid-stack-item';
        chartContainer.innerHTML = `<div class="grid-stack-item-content chart"><h3>Market Share of Top 10 Cryptocurrencies</h3></div>`;
        grid.addWidget(chartContainer, { width: 6, height: 4, autoPosition: true });

        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        const radius = Math.min(width, height) / 2;

        const svg = d3.select(chartContainer.querySelector('.chart')).append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .append('g')
            .attr('transform', `translate(${(width + margin.left + margin.right) / 2}, ${(height + margin.top + margin.bottom) / 2})`);

        const marketCaps = data.map(crypto => crypto.market_cap);
        const names = data.map(crypto => crypto.name);

        const pie = d3.pie()(marketCaps);

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        const outerArc = d3.arc()
            .innerRadius(radius * 1.1)
            .outerRadius(radius * 1.1);

        const arcs = svg.selectAll('.arc')
            .data(pie)
            .enter()
            .append('g')
            .attr('class', 'arc');

        arcs.append('path')
            .attr('d', arc)
            .attr('fill', (d, i) => d3.schemeCategory10[i % 10]);

        arcs.append('text')
            .attr('transform', function(d) {
                const pos = outerArc.centroid(d);
                pos[0] = radius * 1.1 * (midAngle(d) < Math.PI ? 1 : -1);
                return `translate(${pos})`;
            })
            .attr('dy', '0.35em')
            .attr('text-anchor', function(d) {
                return midAngle(d) < Math.PI ? 'start' : 'end';
            })
            .text((d, i) => names[i]);

        arcs.append('line')
            .attr('x1', function(d) { return arc.centroid(d)[0]; })
            .attr('y1', function(d) { return arc.centroid(d)[1]; })
            .attr('x2', function(d) {
                const pos = outerArc.centroid(d);
                pos[0] = radius * 1.05 * (midAngle(d) < Math.PI ? 1 : -1);
                return pos[0];
            })
            .attr('y2', function(d) { return outerArc.centroid(d)[1]; })
            .attr('stroke', 'black')
            .attr('stroke-width', 1);

        function midAngle(d) {
            return d.startAngle + (d.endAngle - d.startAngle) / 2;
        }
    }

    function createAreaChart(data, pair, window) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'grid-stack-item';
        chartContainer.innerHTML = `<div class="grid-stack-item-content chart"><h3>${pair} - Area Chart</h3></div>`;
        grid.addWidget(chartContainer, { width: 6, height: 4 });

        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(chartContainer.querySelector('.chart')).append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const labels = data.prices.map(price => new Date(price[0]));
        const prices = data.prices.map(price => price[1]);

        const x = d3.scaleTime()
            .domain(d3.extent(labels))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([d3.min(prices), d3.max(prices)])
            .range([height, 0]);

        const area = d3.area()
            .x((d, i) => x(labels[i]))
            .y0(height)
            .y1(d => y(d));

        svg.append('path')
            .datum(prices)
            .attr('fill', 'lightsteelblue')
            .attr('d', area);

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append('g')
            .call(d3.axisLeft(y));
    }

    function createScatterPlot(data, pair, window) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'grid-stack-item';
        chartContainer.innerHTML = `<div class="grid-stack-item-content chart"><h3>${pair} - Scatter Plot</h3></div>`;
        grid.addWidget(chartContainer, { width: 6, height: 4 });

        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(chartContainer.querySelector('.chart')).append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const labels = data.prices.map(price => new Date(price[0]));
        const prices = data.prices.map(price => price[1]);

        const x = d3.scaleTime()
            .domain(d3.extent(labels))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([d3.min(prices), d3.max(prices)])
            .range([height, 0]);

        svg.selectAll('circle')
            .data(prices)
            .enter()
            .append('circle')
            .attr('cx', (d, i) => x(labels[i]))
            .attr('cy', d => y(d))
            .attr('r', 5)
            .attr('fill', 'steelblue');

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append('g')
            .call(d3.axisLeft(y));
    }

    function createCandlestickChart(data, pair, window) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'grid-stack-item';
        chartContainer.innerHTML = `<div class="grid-stack-item-content chart"><h3>${pair} - Candlestick Chart</h3></div>`;
        grid.addWidget(chartContainer, { width: 6, height: 4 });

        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(chartContainer.querySelector('.chart')).append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const prices = data.prices;

        const x = d3.scaleBand()
            .domain(prices.map((price, i) => i))
            .range([0, width])
            .padding(0.3);

        const y = d3.scaleLinear()
            .domain([d3.min(prices, d => d[1]), d3.max(prices, d => d[1])])
            .range([height, 0]);

        svg.selectAll('rect')
            .data(prices)
            .enter()
            .append('rect')
            .attr('x', (d, i) => x(i))
            .attr('y', d => y(d[1]))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d[1]))
            .attr('fill', d => d[1] > d[0] ? 'green' : 'red');

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append('g')
            .call(d3.axisLeft(y));
    }

    function createBoxplotChart(data, pair, window) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'grid-stack-item';
        chartContainer.innerHTML = `<div class="grid-stack-item-content chart"><h3>${pair} - Boxplot Chart</h3></div>`;
        grid.addWidget(chartContainer, { width: 6, height: 4 });

        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(chartContainer.querySelector('.chart')).append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const prices = data.prices.map(price => price[1]);

        const x = d3.scaleBand()
            .domain([0])
            .range([0, width])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([d3.min(prices), d3.max(prices)])
            .range([height, 0]);

        const boxData = {
            min: d3.min(prices),
            q1: d3.quantile(prices, 0.25),
            median: d3.median(prices),
            q3: d3.quantile(prices, 0.75),
            max: d3.max(prices)
        };

        const boxWidth = x.bandwidth() / 2;

        svg.append('line')
            .attr('x1', x(0) + boxWidth / 2)
            .attr('x2', x(0) + boxWidth / 2)
            .attr('y1', y(boxData.min))
            .attr('y2', y(boxData.max))
            .attr('stroke', 'black');

        svg.append('rect')
            .attr('x', x(0))
            .attr('y', y(boxData.q3))
            .attr('width', boxWidth)
            .attr('height', y(boxData.q1) - y(boxData.q3))
            .attr('stroke', 'black')
            .attr('fill', 'lightgrey');

        svg.append('line')
            .attr('x1', x(0))
            .attr('x2', x(0) + boxWidth)
            .attr('y1', y(boxData.median))
            .attr('y2', y(boxData.median))
            .attr('stroke', 'black');

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(''));

        svg.append('g')
            .call(d3.axisLeft(y));
    }

    function createBubbleChart(data, pair, window) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'grid-stack-item';
        chartContainer.innerHTML = `<div class="grid-stack-item-content chart"><h3>${pair} - Bubble Chart</h3></div>`;
        grid.addWidget(chartContainer, { width: 6, height: 4 });

        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(chartContainer.querySelector('.chart')).append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const labels = data.prices.map(price => new Date(price[0]));
        const prices = data.prices.map(price => price[1]);

        const x = d3.scaleTime()
            .domain(d3.extent(labels))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([d3.min(prices), d3.max(prices)])
            .range([height, 0]);

        const z = d3.scaleLinear()
            .domain([d3.min(prices), d3.max(prices)])
            .range([5, 20]);

        svg.selectAll('circle')
            .data(prices)
            .enter()
            .append('circle')
            .attr('cx', (d, i) => x(labels[i]))
            .attr('cy', d => y(d))
            .attr('r', d => z(d))
            .attr('fill', 'steelblue')
            .attr('opacity', 0.7);

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append('g')
            .call(d3.axisLeft(y));
    }
    function updateLineChart(data, pair, window) {
        const chartContainer = document.querySelector(`[data-pair="${pair}"][data-window="${window}"][data-type="Line Chart"] .chart`);
        if (!chartContainer) return;
        const svg = d3.select(chartContainer).select('svg g');
    
        const labels = data.prices.map(price => new Date(price[0]));
        const prices = data.prices.map(price => price[1]);
    
        const x = d3.scaleTime()
            .domain(d3.extent(labels))
            .range([0, svg.attr('width') - margin.left - margin.right]);
    
        const y = d3.scaleLinear()
            .domain([d3.min(prices), d3.max(prices)])
            .range([svg.attr('height') - margin.top - margin.bottom, 0]);
    
        const line = d3.line()
            .x((d, i) => x(labels[i]))
            .y(d => y(d));
    
        svg.select('path')
            .datum(prices)
            .attr('d', line);
    
        svg.select('.x.axis')
            .call(d3.axisBottom(x));
    
        svg.select('.y.axis')
            .call(d3.axisLeft(y));
    }
    
    function updateBarChart(data, pair, window) {
        const chartContainer = document.querySelector(`[data-pair="${pair}"][data-window="${window}"][data-type="Bar Chart"] .chart`);
        if (!chartContainer) return;
        const svg = d3.select(chartContainer).select('svg g');
        const interval = Math.ceil(data.total_volumes.length / 30);
        const aggregatedVolumes = aggregateData(data.total_volumes, interval);
    
        const labels = aggregatedVolumes.map(volume => new Date(volume[0]));
        const volumes = aggregatedVolumes.map(volume => volume[1]);
    
        const x = d3.scaleBand()
            .domain(labels)
            .range([0, svg.attr('width') - margin.left - margin.right])
            .padding(0.1);
    
        const y = d3.scaleLinear()
            .domain([0, d3.max(volumes)])
            .range([svg.attr('height') - margin.top - margin.bottom, 0]);
    
        svg.selectAll('.bar')
            .data(volumes)
            .attr('x', (d, i) => x(labels[i]))
            .attr('y', d => y(d))
            .attr('height', d => svg.attr('height') - margin.top - margin.bottom - y(d));
    
        svg.select('.x.axis')
            .call(d3.axisBottom(x));
    
        svg.select('.y.axis')
            .call(d3.axisLeft(y));
    }
    
    function updatePieChart(data) {
        const chartContainer = document.querySelector(`[data-type="Pie Chart"] .chart`);
        if (!chartContainer) return;
        const svg = d3.select(chartContainer).select('svg g');
        const marketCaps = data.map(crypto => crypto.market_cap);
        const pie = d3.pie()(marketCaps);
    
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(Math.min(svg.attr('width'), svg.attr('height')) / 2);
    
        svg.selectAll('.arc path')
            .data(pie)
            .attr('d', arc);
    }
    
    function updateAreaChart(data, pair, window) {
        const chartContainer = document.querySelector(`[data-pair="${pair}"][data-window="${window}"][data-type="Area Chart"] .chart`);
        if (!chartContainer) return;
        const svg = d3.select(chartContainer).select('svg g');
    
        const labels = data.prices.map(price => new Date(price[0]));
        const prices = data.prices.map(price => price[1]);
    
        const x = d3.scaleTime()
            .domain(d3.extent(labels))
            .range([0, svg.attr('width') - margin.left - margin.right]);
    
        const y = d3.scaleLinear()
            .domain([d3.min(prices), d3.max(prices)])
            .range([svg.attr('height') - margin.top - margin.bottom, 0]);
    
        const area = d3.area()
            .x((d, i) => x(labels[i]))
            .y0(svg.attr('height') - margin.top - margin.bottom)
            .y1(d => y(d));
    
        svg.select('path')
            .datum(prices)
            .attr('d', area);
    
        svg.select('.x.axis')
            .call(d3.axisBottom(x));
    
        svg.select('.y.axis')
            .call(d3.axisLeft(y));
    }
    
    function updateScatterPlot(data, pair, window) {
        const chartContainer = document.querySelector(`[data-pair="${pair}"][data-window="${window}"][data-type="Scatter Plot"] .chart`);
        if (!chartContainer) return;
        const svg = d3.select(chartContainer).select('svg g');
    
        const labels = data.prices.map(price => new Date(price[0]));
        const prices = data.prices.map(price => price[1]);
    
        const x = d3.scaleTime()
            .domain(d3.extent(labels))
            .range([0, svg.attr('width') - margin.left - margin.right]);
    
        const y = d3.scaleLinear()
            .domain([d3.min(prices), d3.max(prices)])
            .range([svg.attr('height') - margin.top - margin.bottom, 0]);
    
        svg.selectAll('circle')
            .data(prices)
            .attr('cx', (d, i) => x(labels[i]))
            .attr('cy', d => y(d));
    
        svg.select('.x.axis')
            .call(d3.axisBottom(x));
    
        svg.select('.y.axis')
            .call(d3.axisLeft(y));
    }
    
    function updateBubbleChart(data, pair, window) {
        const chartContainer = document.querySelector(`[data-pair="${pair}"][data-window="${window}"][data-type="Bubble Chart"] .chart`);
        if (!chartContainer) return;
        const svg = d3.select(chartContainer).select('svg g');
    
        const labels = data.prices.map(price => new Date(price[0]));
        const prices = data.prices.map(price => price[1]);
    
        const x = d3.scaleTime()
            .domain(d3.extent(labels))
            .range([0, svg.attr('width') - margin.left - margin.right]);
    
        const y = d3.scaleLinear()
            .domain([d3.min(prices), d3.max(prices)])
            .range([svg.attr('height') - margin.top - margin.bottom, 0]);
    
        const z = d3.scaleLinear()
            .domain([d3.min(prices), d3.max(prices)])
            .range([5, 20]);
    
        svg.selectAll('circle')
            .data(prices)
            .attr('cx', (d, i) => x(labels[i]))
            .attr('cy', d => y(d))
            .attr('r', d => z(d));
    
        svg.select('.x.axis')
            .call(d3.axisBottom(x));
    
        svg.select('.y.axis')
            .call(d3.axisLeft(y));
    }
    
});
