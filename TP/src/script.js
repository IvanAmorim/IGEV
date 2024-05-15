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




    // Função para criar um gráfico para um KPI e adicioná-lo ao Gridstack
    function createChart(kpiName) {
        const chart = document.createElement('div');
        chart.className = 'chart';
        chart.innerHTML = `<h3>${kpiName} Chart</h3>`;
        grid.addWidget(chart);
    }

    // Adicionar event listener para o evento de soltar (drop) no dashboard
    dashboard.addEventListener('drop', function (event) {
        event.preventDefault();
        const kpiName = event.dataTransfer.getData('text/plain');
        createChart(kpiName);
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
});
