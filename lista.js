// Funzione principale per inizializzare tutti i controlli e gli eventi
function initializeApp() {
    // Inizializza i controlli di quantità
    document.querySelectorAll('.check-item').forEach(item => {
        initializeItem(item);
    });

    // Inizializza i pulsanti toggle (espandi/comprimi)
    document.querySelectorAll('.btn-toggle').forEach(toggleBtn => {
        toggleBtn.addEventListener('click', () => {
            const sezione = toggleBtn.closest('.sezione');
            const sectionContent = sezione.querySelector('.sezione-content');
            const icon = toggleBtn.querySelector('i');
            
            if (sectionContent.style.display === 'none') { //Espandi
                sectionContent.style.display = 'block';
                icon.classList.replace('bi-chevron-down', 'bi-chevron-up');
            } else { //Comprimi
                sectionContent.style.display = 'none';
                icon.classList.replace('bi-chevron-up', 'bi-chevron-down');
            }
        });
    });

    // Inizializza i pulsanti per aggiungere elementi
    document.querySelectorAll('.btn-add').forEach(addBtn => {
        addBtn.addEventListener('click', () => {
            const sezione = addBtn.closest('.sezione');
            const itemList = sezione.querySelector('.item-list');
            
            const newItem = document.createElement('div');
            newItem.className = 'check-item';
            newItem.innerHTML = `
                <input type="checkbox" name="${sezione.id}" value="" id="" disabled>
                <input type="text" class="edit-label" placeholder="Inserisci nome elemento" autofocus>
                <div class="quantity-controls">
                    <button class="quantity-btn minus-btn" style="display: none;">
                        <i class="bi bi-dash"></i>
                    </button>
                    <span class="quantity-display" style="display: none;">1</span>
                    <button class="quantity-btn plus-btn">
                        <i class="bi bi-plus"></i>
                    </button>
                </div>
                <button class="btn-delete" title="Elimina">
                    <i class="bi bi-x-lg"></i>
                </button>`;
            itemList.appendChild(newItem);
            
            const textInput = newItem.querySelector('.edit-label');
            textInput.focus();
            
            function saveItem() {
                const elementName = textInput.value.trim();
                
                if (!elementName) {
                    newItem.remove();
                    return;
                }
                
                const elementId = elementName.toLowerCase()
                      .replace(/\s+/g, '-')       // Sostituisci spazi con trattini
                      .replace(/[^\w-]/g, '')     // Rimuovi caratteri non alfanumerici
                      .replace(/--+/g, '-');      // Riduci trattini multipli a uno solo
    
                
                const checkbox = newItem.querySelector('input[type="checkbox"]');
                checkbox.id = elementId;
                checkbox.value = elementId;
                checkbox.disabled = false;
                
                const label = document.createElement('label');
                label.setAttribute('for', elementId);
                label.textContent = elementName;
                textInput.replaceWith(label);
                
                initializeItem(newItem);
            }
            
            textInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveItem();
                }
            });
            textInput.addEventListener('blur', saveItem);
        });
    });
}


// Funzione per inizializzare i bottoni di un elemento
function initializeItem(item) {
    // Inizializza i controlli di quantità
    const minusBtn = item.querySelector('.minus-btn');
    const plusBtn = item.querySelector('.plus-btn');
    const quantityDisplay = item.querySelector('.quantity-display');
    let quantity = 1;

    function updateQuantityDisplay() {
        if (quantity > 1) {
            minusBtn.style.display = 'flex';
            quantityDisplay.style.display = 'inline';
            quantityDisplay.textContent = quantity;
        } else {
            minusBtn.style.display = 'none';
            quantityDisplay.style.display = 'none';
        }
    }

    plusBtn.addEventListener('click', () => {
        quantity++;
        updateQuantityDisplay();
    });

    minusBtn.addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            updateQuantityDisplay();
        }
    });

    // Inizializza il pulsante elimina
    const deleteBtn = item.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', () => {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.9)';
        setTimeout(() => item.remove(), 200);
    });
}

// Inizializza tutto quando il documento è caricato
document.addEventListener('DOMContentLoaded', initializeApp);