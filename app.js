let allData = studiesData.data;
let exclusionCriteria = studiesData.exclusionCriteria;
let locations = studiesData.locations;
let drugs = studiesData.drugs;
let treatments = studiesData.treatments;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dados carregados:', allData);
    createDynamicFilters();
    
    document.getElementById('showAllStudies').addEventListener('click', showAllStudies);
});

function createDynamicFilters() {
    const filterContainer = document.getElementById('dynamicFilters');
    
    // Criar filtro para doença
    createSelectFilter('Doenca', 'Doença');
    
    // Criar filtro para fase
    createSelectFilter('Fase', 'Fase do Estudo');
    
    // Criar input para idade
    createAgeFilter();
    
    // Criar filtro de tratamentos prévios
    createPreviousTreatmentFilter();
    
    // Criar filtros de exclusão
    createExclusionFilters();
    
    // Criar filtro de drogas
    createDrugFilter();
}

function createSelectFilter(field, label) {
    const uniqueValues = [...new Set(allData.map(item => item[field]))].filter(Boolean);
    
    const filterGroup = document.createElement('div');
    filterGroup.className = 'form-group';
    
    const selectHtml = `
        <label for="filter_${field}">${label}:</label>
        <select id="filter_${field}" class="filter-select">
            <option value="">Todos</option>
            ${uniqueValues.map(value => `<option value="${value}">${value}</option>`).join('')}
        </select>
    `;
    
    filterGroup.innerHTML = selectHtml;
    document.getElementById('dynamicFilters').appendChild(filterGroup);
}

function createAgeFilter() {
    const filterGroup = document.createElement('div');
    filterGroup.className = 'form-group';
    filterGroup.innerHTML = `
        <label for="filter_age">Idade do Paciente:</label>
        <input type="number" id="filter_age" class="filter-input" min="0" max="120">
    `;
    document.getElementById('dynamicFilters').appendChild(filterGroup);
}

function createPreviousTreatmentFilter() {
    const filterGroup = document.createElement('div');
    filterGroup.className = 'form-group previous-treatments';
    filterGroup.innerHTML = `
        <label>Tratamentos Prévios:</label>
        <div class="checkbox-container">
            <div class="checkbox-item special-option">
                <input type="radio" name="treatment_status" id="treat_none" value="none">
                <label for="treat_none">Não fez tratamento prévio</label>
            </div>
            <div class="checkbox-item special-option">
                <input type="radio" name="treatment_status" id="treat_other" value="other">
                <label for="treat_other">Outras drogas não listadas</label>
            </div>
            <div class="treatment-list">
                <div class="checkbox-item">
                    <input type="radio" name="treatment_status" id="treat_select" value="select">
                    <label for="treat_select">Selecione os tratamentos realizados:</label>
                </div>
                ${treatments.map(treatment => `
                    <div class="checkbox-item treatment-option">
                        <input type="checkbox" id="treat_${treatment}" value="${treatment}" class="treatment-checkbox" disabled>
                        <label for="treat_${treatment}">${treatment}</label>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.getElementById('dynamicFilters').appendChild(filterGroup);

    // Adicionar evento para habilitar/desabilitar checkboxes
    const radioButtons = filterGroup.querySelectorAll('input[type="radio"]');
    const checkboxes = filterGroup.querySelectorAll('.treatment-checkbox');
    
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            checkboxes.forEach(checkbox => {
                checkbox.disabled = radio.id !== 'treat_select';
                if (radio.id !== 'treat_select') {
                    checkbox.checked = false;
                }
            });
        });
    });
}
function createExclusionFilters() {
    // Definir categorias
    const categories = {
        'Doenças Cardiovasculares': ['HAS não controlada', 'Doença cardiovascular significativa', 'Arritmias'],
        'Doenças Infecciosas': ['HIV', 'Hepatites'],
        'Condições Neurológicas': ['Acometimento do SNC', 'AVC nos últimos 6 meses'],
        'Outras Condições Médicas': ['Doença hemorrágica', 'DRGE', 'Má absorção intestinal'],
        'Procedimentos/Cirurgias': ['Transplante renal', 'Cirurgia bariátrica'],
        'Outros Critérios': ['Uso de anticoagulante', 'Participação em outro estudo clínico']
    };

    const filterGroup = document.createElement('div');
    filterGroup.className = 'form-group exclusion-filters';
    filterGroup.innerHTML = `
        <label>Critérios de Exclusão:</label>
        <div class="exclusion-categories">
            ${Object.entries(categories).map(([category, criteria]) => `
                <div class="exclusion-category">
                    <h4>${category}</h4>
                    <div class="checkbox-container category-container">
                        ${criteria.map(criterion => `
                            <div class="checkbox-item">
                                <input type="checkbox" id="excl_${criterion}" value="${criterion}">
                                <label for="excl_${criterion}">${criterion}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    document.getElementById('dynamicFilters').appendChild(filterGroup);
}

function createDrugFilter() {
    const filterGroup = document.createElement('div');
    filterGroup.className = 'form-group';
    filterGroup.innerHTML = `
        <label for="filter_drug">Droga em Estudo:</label>
        <select id="filter_drug" class="filter-select">
            <option value="">Todas</option>
            ${drugs.map(drug => `<option value="${drug}">${drug}</option>`).join('')}
        </select>
    `;
    document.getElementById('dynamicFilters').appendChild(filterGroup);
}

function showAllStudies() {
    displayResults(allData);
}

document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const hasSelection = checkIfAnyFilterSelected();
    
    if (!hasSelection) {
        alert('Por favor, selecione ao menos uma opção de filtro');
        return;
    }
    
    filterResults();
});

function checkIfAnyFilterSelected() {
    const doenca = document.getElementById('filter_Doenca').value;
    const fase = document.getElementById('filter_Fase').value;
    const age = document.getElementById('filter_age').value;
    const drug = document.getElementById('filter_drug').value;
    
    const treatmentStatus = document.querySelector('input[name="treatment_status"]:checked');
    const selectedTreatments = document.querySelectorAll('.treatment-checkbox:checked');
    const selectedExclusions = document.querySelectorAll('.exclusion-filters input:checked');
    
    return doenca || fase || age || drug || 
           treatmentStatus || selectedTreatments.length > 0 || 
           selectedExclusions.length > 0;
}
function filterResults() {
    let filteredData = [...allData];

    // Filtrar por doença
    const doenca = document.getElementById('filter_Doenca').value;
    if (doenca) {
        filteredData = filteredData.filter(item => {
            const itemDoenca = item.Doenca ? String(item.Doenca) : '';
            return itemDoenca.toLowerCase() === doenca.toLowerCase();
        });
    }

    // Filtrar por fase
    const fase = document.getElementById('filter_Fase').value;
    if (fase) {
        filteredData = filteredData.filter(item => {
            const itemFase = item.Fase ? String(item.Fase) : '';
            return itemFase.toLowerCase() === fase.toLowerCase();
        });
    }

    // Filtrar por idade
    const age = document.getElementById('filter_age').value;
    if (age) {
        filteredData = filteredData.filter(item => {
            if (item.Idade.toLowerCase().includes('qualquer')) {
                return true;
            }
            try {
                const [min, max] = item.Idade.split('-').map(Number);
                return age >= min && age <= max;
            } catch (e) {
                console.log('Erro ao processar idade:', item.Idade);
                return true;
            }
        });
    }

    // Filtrar por tratamentos prévios
    const treatmentStatus = document.querySelector('input[name="treatment_status"]:checked');
    if (treatmentStatus) {
        if (treatmentStatus.value === 'none') {
            // Excluir estudos que exigem tratamento prévio
            filteredData = filteredData.filter(item => !item.Tratamento.length);
        } else if (treatmentStatus.value === 'select') {
            const selectedTreatments = Array.from(document.querySelectorAll('.treatment-checkbox:checked'))
                .map(checkbox => checkbox.value);
            if (selectedTreatments.length > 0) {
                filteredData = filteredData.filter(item => 
                    selectedTreatments.some(treatment => item.Tratamento.includes(treatment))
                );
            }
        }
        // Para 'other', não aplicamos filtro específico
    }

    // Filtrar por critérios de exclusão
    const selectedExclusions = Array.from(document.querySelectorAll('.exclusion-filters input:checked'))
        .map(checkbox => checkbox.value);
    if (selectedExclusions.length > 0) {
        filteredData = filteredData.filter(item => {
            return !selectedExclusions.some(criterion => item.Exclusao.includes(criterion));
        });
    }

    // Filtrar por droga
    const drug = document.getElementById('filter_drug').value;
    if (drug) {
        filteredData = filteredData.filter(item => 
            item.Droga.includes(drug)
        );
    }

    displayResults(filteredData);
}

function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>Nenhum estudo encontrado.</p>';
        return;
    }

    results.forEach(study => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${study.Estudo}</h3>
            <div class="study-details">
                <p><strong>Doença:</strong> ${study.Doenca}</p>
                <p><strong>Fase:</strong> ${study.Fase}</p>
                <p><strong>Idade:</strong> ${study.Idade}</p>
                <p><strong>Droga em Estudo:</strong> ${study.Droga.join(', ')}</p>
            </div>
            <div class="study-criteria">
                <p><strong>Critérios de Exclusão:</strong></p>
                <ul>
                    ${study.Exclusao.map(criterion => `<li>${criterion}</li>`).join('')}
                </ul>
                <p><strong>Tratamento Prévio Necessário:</strong> ${study.Tratamento.join(', ') || 'Nenhum'}</p>
            </div>
            <div class="study-location">
                <p><strong>Local do Estudo:</strong> ${study.Local.join(', ')}</p>
                <p class="location-note">* Entre em contato com o centro de pesquisa para verificar a possibilidade de participação mesmo que esteja em outra localidade.</p>
            </div>
        `;
        resultsDiv.appendChild(card);
    });
}
