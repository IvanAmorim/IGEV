document.addEventListener("DOMContentLoaded", function () {
    const kpiList = document.getElementById('kpi-list');
    const dashboard = document.getElementById('dashboard');

    const sidebar = document.querySelector('.sidebar');
    const hamburgerMenu = document.querySelector('.hamburger-menu');

    // Função para alternar entre os estados ativo e inativo do menu hamburger
    function toggleMenu() {
        sidebar.classList.toggle('active');
        hamburgerMenu.classList.toggle('active');
    }

    // Event listener para clicar no menu hamburger
    hamburgerMenu.addEventListener('click', toggleMenu);
    // Função para criar um gráfico para um KPI
    function createChart(kpiName) {
        const chart = document.createElement('div');
        chart.className = 'chart';
        chart.innerHTML = `<h3>${kpiName} Chart</h3>`;
        return chart;
    }

    // Adicionar event listener para o evento de soltar (drop)
    dashboard.addEventListener('drop', function (event) {
        event.preventDefault();
        const kpiName = event.dataTransfer.getData('text/plain');
        const chart = createChart(kpiName);
        dashboard.appendChild(chart);
    });

    // Adicionar event listeners para os eventos de arrastar e permitir soltar (dragover)
    kpiList.addEventListener('dragstart', function (event) {
        event.dataTransfer.setData('text/plain', event.target.innerText);
    });
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
});
