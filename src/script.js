document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const sidebar = document.querySelector('.sidebar');
    const addButton = document.querySelector('.add-button');
    const modal = document.querySelector('.modal');
    const closeButton = document.querySelector('.close-button');
    const cancelButton = document.querySelector('.cancel-button');
    const categoryForm = document.getElementById('category-form');
    const categoryList = document.getElementById('category-list');
    const modalTitle = document.querySelector('.modal-header h2');
    let editIndex = null;

    const defaultIconUrl = 'assets\icons8-layers-48.png'; 


    let categories = [];
    let activeCategory = null;
    let categoryLayers = {}; // Object to store layers per category

    addButton.addEventListener('click', () => {
        openModal();
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    cancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    function openModal(category = null) {
        if (category) {
            document.getElementById('name').value = category.name;
            document.getElementById('type').value = category.type;
            document.getElementById('color').value = category.color;
            // Display the icon name if editing a category with an icon
            const iconInput = document.getElementById('icon');
            if (category.icon) {
                const iconLabel = document.createElement('label');
                iconLabel.textContent = category.icon.name;
                iconInput.parentNode.appendChild(iconLabel);
            }
            modalTitle.textContent = 'Editar Categoria';
            editIndex = categories.indexOf(category);
        } else {
            document.getElementById('name').value = '';
            document.getElementById('type').value = 'area';
            document.getElementById('color').value = '#AAAAAA';
            modalTitle.textContent = 'Nova Categoria';
            editIndex = null;
        }
        modal.style.display = 'flex';
    }

    function toggleMenu() {
        sidebar.classList.toggle('active');
        sidebar.classList.toggle('collapsed');
        hamburgerMenu.classList.toggle('active');
    }

    hamburgerMenu.addEventListener('click', toggleMenu);

    const map = L.map('map').setView([41.692154, -8.835746], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    let drawControl = new L.Control.Draw({
        edit: {
            featureGroup: drawnItems,
            remove: true
        },
        draw: {
            polygon: false,
            polyline: false,
            rectangle: false,
            circle: false, // Ensure circle is always false
            circlemarker: false, // Ensure circlemarker is always false
            marker: false
        }
    });

    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (e) => {
        const type = e.layerType;
        const layer = e.layer;

        if (!activeCategory) {
            alert('Por favor, selecione uma categoria antes de desenhar.');
            return;
        }

        layer.options.color = activeCategory.color;

        let textLabel = '';
        if (type === 'polygon' || type === 'rectangle') {
            const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
            textLabel = 'Área: ' + area.toFixed(2) + ' m²';
        } else if (type === 'polyline') {
            const length = calculatePolylineLength(layer.getLatLngs());
            textLabel = 'Comprimento: ' + length.toFixed(2) + ' m';
        } else if (type === 'marker') {
            textLabel = 'Coordenadas: ' + layer.getLatLng().toString();
        }

        layer.bindTooltip(textLabel, {permanent: true, direction: 'center', className: 'text-label'}).openTooltip();

        if (!categoryLayers[activeCategory.name]) {
            categoryLayers[activeCategory.name] = new L.FeatureGroup().addTo(map);
        }
        categoryLayers[activeCategory.name].addLayer(layer);
        drawnItems.addLayer(layer); // Ensure the layer is added to drawnItems
    });

    map.on('draw:edited', function (e) {
        const layers = e.layers;
        layers.eachLayer(function (layer) {
            let textLabel = '';
            if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
                const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
                textLabel = 'Área: ' + area.toFixed(2) + ' m²';
            } else if (layer instanceof L.Polyline) {
                const length = calculatePolylineLength(layer.getLatLngs());
                textLabel = 'Comprimento: ' + length.toFixed(2) + ' m';
            } else if (layer instanceof L.Marker) {
                textLabel = 'Coordenadas: ' + layer.getLatLng().toString();
            }
            layer.bindTooltip(textLabel, {permanent: true, direction: 'center', className: 'text-label'}).openTooltip();
        });
    });

    categoryForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const type = document.getElementById('type').value;
        const color = document.getElementById('color').value;
        const icon = document.getElementById('icon').files[0];

        if (editIndex !== null) {
            categories[editIndex] = { ...categories[editIndex], name, type, color, icon };
        } else {
            const category = { name, type, color, icon, visible: true };
            categories.push(category);
        }
        updateCategoryList();
        modal.style.display = 'none';
    });

    function updateCategoryList() {
        categoryList.innerHTML = '';
        categories.forEach((category, index) => {
            const listItem = document.createElement('li');
            const iconHTML = category.icon ? `<img src="${URL.createObjectURL(category.icon)}" alt="${category.name}" class="category-icon">` : '';

            listItem.innerHTML = `
                <input type="radio" name="active-category" data-index="${index}" ${activeCategory === category ? 'checked' : ''}>
                ${iconHTML} ${category.name}
                <button class="edit-button" data-index="${index}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="visibility-button" data-index="${index}">
                    <i class="bi bi-eye${category.visible ? '' : '-slash'}"></i>
                </button>
                <button class="delete-button" data-index="${index}">
                    <i class="bi bi-trash"></i>
                </button>
            `;
            listItem.classList.toggle('selected', activeCategory === category);
            categoryList.appendChild(listItem);
        });

        document.querySelectorAll('input[name="active-category"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const index = e.target.dataset.index;
                activeCategory = categories[index];
                updateCategoryList();
                updateDrawControl();
            });
        });

        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.closest('.edit-button').dataset.index;
                openModal(categories[index]);
            });
        });

        document.querySelectorAll('.visibility-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.closest('.visibility-button').dataset.index;
                categories[index].visible = !categories[index].visible;
                toggleLayerVisibility(categories[index]);
                updateCategoryList();
            });
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.closest('.delete-button').dataset.index;
                if (categoryLayers[categories[index].name]) {
                    map.removeLayer(categoryLayers[categories[index].name]);
                    delete categoryLayers[categories[index].name];
                }
                categories.splice(index, 1);
                updateCategoryList();
                activeCategory = null;
                updateDrawControl();
            });
        });
    }

    function updateDrawControl() {
        map.removeControl(drawControl);
        
        const drawOptions = {
            polygon: false,
            polyline: false,
            rectangle: false,
            circle: false, // Ensure circle is always false
            circlemarker: false, // Ensure circlemarker is always false
            marker: false
        };

        if (activeCategory) {
            if (activeCategory.type === 'area') {
                drawOptions.polygon = true;
                drawOptions.rectangle = true;
            } else if (activeCategory.type === 'linha') {
                drawOptions.polyline = true;
            } else if (activeCategory.type === 'ponto') {
                drawOptions.marker = true;
            }
        }

        drawControl = new L.Control.Draw({
            edit: {
                featureGroup: drawnItems,
                remove: true
            },
            draw: drawOptions
        });

        map.addControl(drawControl);
    }

    function toggleLayerVisibility(category) {
        if (categoryLayers[category.name]) {
            if (category.visible) {
                map.addLayer(categoryLayers[category.name]);
            } else {
                map.removeLayer(categoryLayers[category.name]);
            }
        }
    }

    function calculatePolylineLength(latlngs) {
        let length = 0;
        for (let i = 0; i < latlngs.length - 1; i++) {
            length += latlngs[i].distanceTo(latlngs[i + 1]);
        }
        return length;
    }

    function calculateDistance(latlng1, latlng2) {
        const distance = map.distance(latlng1, latlng2);
        L.marker(latlng1).addTo(map).bindTooltip('Distância: ' + distance.toFixed(2) + ' m', {permanent: true, direction: 'right'}).openTooltip();
    }
});
