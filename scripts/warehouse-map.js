// 库位地图交互功能
document.addEventListener('DOMContentLoaded', function() {
    // 当前选中的层，默认12层
    let currentLevel = 12;
    
    // 生成库位网格
    generateWarehouseGrid(currentLevel);

    const detailPopup = document.getElementById('detailPopup');
    let currentSelectedCell = null;
    let currentLocationData = null; // 存储当前选中库位的数据
    let currentLocatedCell = null; // 存储当前定位的库位（用于定位功能）

    // 模拟容器数据（参考容器管理规则）
    const mockContainers = generateMockContainers();
    
    // 模拟物料数据
    const mockMaterials = generateMockMaterials();

    // 生成模拟容器数据（按容器管理规则）
    function generateMockContainers() {
        const containers = [];
        const types = ['小金属框', '大金属框', '塑料托盘', '长物料钢托盘'];
        
        // 生成TP系列容器
        for (let i = 1; i <= 80; i++) {
            containers.push({
                code: `TP-${i.toString().padStart(3, '0')}`,
                type: types[Math.floor(Math.random() * types.length)],
                name: `托盘${i}`
            });
        }
        
        // 生成RQ系列容器
        for (let i = 1; i <= 20; i++) {
            containers.push({
                code: `RQ-2024-${i.toString().padStart(3, '0')}`,
                type: types[Math.floor(Math.random() * types.length)],
                name: `容器${i}`
            });
        }
        
        return containers;
    }

    // 生成模拟物料数据
    function generateMockMaterials() {
        const materials = [];
        const materialTypes = ['电子元件', '机械零件', '化工原料', '包装材料', '工具配件'];
        for (let i = 0; i < 50; i++) {
            materials.push({
                code: `MAT${(i + 1).toString().padStart(6, '0')}`,
                name: `${materialTypes[i % materialTypes.length]}-${i + 1}`
            });
        }
        return materials;
    }

    // 生成随机物料数据（用于有货库位）
    function generateRandomMaterials() {
        const count = Math.floor(Math.random() * 3) + 1; // 1-3个物料
        const materials = [];
        for (let i = 0; i < count; i++) {
            const material = mockMaterials[Math.floor(Math.random() * mockMaterials.length)];
            materials.push({
                code: material.code,
                name: material.name,
                quantity: Math.floor(Math.random() * 100) + 1
            });
        }
        return materials;
    }

    // 生成随机物料数据（用于物料锁定库位，确保至少2条）
    function generateRandomMaterialsForLocked() {
        const count = Math.floor(Math.random() * 2) + 2; // 2-3个物料
        const materials = [];
        for (let i = 0; i < count; i++) {
            const material = mockMaterials[Math.floor(Math.random() * mockMaterials.length)];
            materials.push({
                code: material.code,
                name: material.name,
                quantity: Math.floor(Math.random() * 100) + 1
            });
        }
        return materials;
    }

    // 生成随机容器编码
    function generateRandomContainerCode() {
        const container = mockContainers[Math.floor(Math.random() * mockContainers.length)];
        return container.code;
    }

    // 更新插入库存按钮状态
    function updateInsertStockButton() {
        const insertBtn = document.getElementById('insertStockBtn');
        // 空库位、空托库位、有货库位可以插入库存
        if (currentLocationData && 
            (currentLocationData.status === 'empty' || 
             currentLocationData.status === 'empty-pallet' || 
             currentLocationData.status === 'occupied') &&
            !currentSelectedCell.classList.contains('disabled')) {
            insertBtn.disabled = false;
            insertBtn.style.opacity = '1';
            insertBtn.style.cursor = 'pointer';
        } else {
            insertBtn.disabled = true;
            insertBtn.style.opacity = '0.5';
            insertBtn.style.cursor = 'not-allowed';
        }
    }

    // 更新清空库存按钮状态
    function updateClearStockButton() {
        const clearBtn = document.getElementById('clearStockBtn');
        if (currentLocationData && 
            currentLocationData.status === 'occupied' && 
            !currentSelectedCell.classList.contains('disabled')) {
            clearBtn.disabled = false;
            clearBtn.style.opacity = '1';
            clearBtn.style.cursor = 'pointer';
        } else {
            clearBtn.disabled = true;
            clearBtn.style.opacity = '0.5';
            clearBtn.style.cursor = 'not-allowed';
        }
    }

    // 更新库位锁定按钮状态
    function updateLockLocationButton() {
        const lockBtn = document.getElementById('lockLocationBtn');
        console.log('更新库位锁定按钮状态：', {
            currentLocationData: currentLocationData,
            status: currentLocationData ? currentLocationData.status : 'null',
            disabled: currentSelectedCell ? currentSelectedCell.classList.contains('disabled') : 'no cell'
        });
        
        // 只有"有货"、"空库位"、"空托"、"物料锁定"状态的库位可以锁定
        if (currentLocationData && 
            (currentLocationData.status === 'occupied' || 
             currentLocationData.status === 'empty' || 
             currentLocationData.status === 'empty-pallet' || 
             currentLocationData.status === 'material-locked') &&
            !currentSelectedCell.classList.contains('disabled')) {
            lockBtn.disabled = false;
            lockBtn.style.opacity = '1';
            lockBtn.style.cursor = 'pointer';
            console.log('✅ 库位锁定按钮已启用');
        } else {
            lockBtn.disabled = true;
            lockBtn.style.opacity = '0.5';
            lockBtn.style.cursor = 'not-allowed';
            console.log('❌ 库位锁定按钮已禁用');
        }
    }

    // 更新库位解锁按钮状态
    function updateUnlockLocationButton() {
        const unlockBtn = document.getElementById('unlockLocationBtn');
        // 只有"库位锁定"状态的库位可以解锁
        if (currentLocationData && 
            currentLocationData.status === 'locked' &&
            !currentSelectedCell.classList.contains('disabled')) {
            unlockBtn.disabled = false;
            unlockBtn.style.opacity = '1';
            unlockBtn.style.cursor = 'pointer';
        } else {
            unlockBtn.disabled = true;
            unlockBtn.style.opacity = '0.5';
            unlockBtn.style.cursor = 'not-allowed';
        }
    }

    // 更新成品明细按钮状态
    function updateInventoryDetailButton() {
        const detailBtn = document.getElementById('inventoryDetailBtn');
        // 任何选中的库位都可以查看成品明细
        if (currentLocationData && !currentSelectedCell.classList.contains('disabled')) {
            detailBtn.disabled = false;
            detailBtn.style.opacity = '1';
            detailBtn.style.cursor = 'pointer';
        } else {
            detailBtn.disabled = true;
            detailBtn.style.opacity = '0.5';
            detailBtn.style.cursor = 'not-allowed';
        }
    }

    // 随机生成库位状态（全局函数）
    function getRandomStatus() {
        const rand = Math.random();
        if (rand < 0.5) return 'occupied'; // 50%有货
        if (rand < 0.7) return 'empty'; // 20%空库位
        if (rand < 0.8) return 'empty-pallet'; // 10%空托
        if (rand < 0.9) return 'material-locked'; // 10%物料锁定
        if (rand < 0.95) return 'locked'; // 5%库位锁定
        return 'disabled'; // 5%禁用
    }

    // 获取状态文本（全局函数）
    function getStatusText(status) {
        switch(status) {
            case 'occupied': return '有货';
            case 'empty': return '空库位';
            case 'empty-pallet': return '空托';
            case 'material-locked': return '物料锁定';
            case 'locked': return '库位锁定';
            case 'disabled': return '禁用';
            default: return '未知';
        }
    }

    // 生成库位网格函数
    function generateWarehouseGrid(level) {
        const container = document.getElementById('warehouseGrid');
        container.innerHTML = ''; // 清空现有内容
        
        const rows = 4; // 4排
        const cols = 32; // 32列

        // 生成每一排
        for (let row = 1; row <= rows; row++) {
            // 1排有2深，其他排只有1深
            const depths = (row === 1) ? 2 : 1;
            
            // 排标题 - 显示排和层
            const stackHeader = document.createElement('div');
            stackHeader.className = 'stack-header';
            stackHeader.setAttribute('data-row', row);
            stackHeader.innerHTML = `<h3 class="stack-title">${row}排-${level}层</h3>`;
            container.appendChild(stackHeader);

            // 表格容器
            const gridTable = document.createElement('div');
            gridTable.className = 'grid-table';
            gridTable.setAttribute('data-row', row);

            // 表头
            const gridHeader = document.createElement('div');
            gridHeader.className = 'grid-header';
            gridHeader.innerHTML = '<div class="grid-cell header-cell">深 / 列</div>';
            
            for (let col = 1; col <= cols; col++) {
                const headerCell = document.createElement('div');
                headerCell.className = 'grid-cell header-cell';
                headerCell.textContent = col;
                gridHeader.appendChild(headerCell);
            }
            gridTable.appendChild(gridHeader);

            // 生成每一深
            for (let depth = 1; depth <= depths; depth++) {
                const gridRow = document.createElement('div');
                gridRow.className = 'grid-row';

                // 行头
                const rowHeader = document.createElement('div');
                rowHeader.className = 'grid-cell row-header';
                rowHeader.textContent = depth;
                gridRow.appendChild(rowHeader);

                // 生成每一列
                for (let col = 1; col <= cols; col++) {
                    // 库位编码格式：排-列-层-深
                    const location = `${row}-${col}-${level}-${depth}`;
                    const status = getRandomStatus();
                    
                    const cell = document.createElement('div');
                    cell.className = `grid-cell location-cell ${status}`;
                    cell.setAttribute('data-location', location);
                    cell.innerHTML = `
                        <div class="cell-code">${row}-${col}-${level}-${depth}</div>
                        <div class="cell-status">${getStatusText(status)}</div>
                    `;
                    
                    gridRow.appendChild(cell);
                }

                gridTable.appendChild(gridRow);
            }

            container.appendChild(gridTable);
        }

        // 绑定点击事件
        bindLocationCellEvents();
        
        // 应用排的筛选
        const rowSelect = document.getElementById('rowSelect');
        if (rowSelect) {
            const checkboxes = rowSelect.querySelectorAll('input[type="checkbox"]');
            const selectedRows = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            filterWarehouseRows(selectedRows);
        }
    }

    // 绑定库位单元格事件
    function bindLocationCellEvents() {
        const locationCells = document.querySelectorAll('.location-cell');
        
        locationCells.forEach(cell => {
            cell.addEventListener('click', function(e) {
                e.stopPropagation(); // 阻止事件冒泡
                
                const location = this.getAttribute('data-location');
                const rect = this.getBoundingClientRect();
                
                // 移除之前的选中状态
                if (currentSelectedCell) {
                    currentSelectedCell.classList.remove('selected');
                }
                
                // 移除定位标记（如果存在）
                if (currentLocatedCell) {
                    currentLocatedCell.classList.remove('selected');
                    currentLocatedCell = null;
                }
                
                // 添加选中状态
                this.classList.add('selected');
                currentSelectedCell = this;
                
                // 解析库位编码
                const parts = location.split('-');
                const row = parts[0];
                const col = parts[1];
                const level = parts[2];
                const depth = parts[3];
                
                // 判断库位状态
                const isOccupied = this.classList.contains('occupied');
                const isEmpty = this.classList.contains('empty');
                const isEmptyPallet = this.classList.contains('empty-pallet');
                const isMaterialLocked = this.classList.contains('material-locked');
                const isLocked = this.classList.contains('locked');
                const isDisabled = this.classList.contains('disabled');
                
                // 获取库位数据
                const data = {
                    location: location,
                    name: `${row}排-${col}列-${level}层-${depth}深`,
                    area: `${row}排库区`,
                    container: isEmpty ? '-' : generateRandomContainerCode(),
                    qty: isEmpty ? 0 : Math.floor(Math.random() * 10) + 1,
                    status: isOccupied ? 'occupied' : 
                            (isEmpty ? 'empty' : 
                            (isEmptyPallet ? 'empty-pallet' : 
                            (isMaterialLocked ? 'material-locked' : 
                            (isLocked ? 'locked' : 'other')))),
                    materials: isMaterialLocked ? generateRandomMaterialsForLocked() : 
                              (isOccupied ? generateRandomMaterials() : [])
                };
                
                // 保存当前库位数据
                currentLocationData = data;
                
                // 更新插入库存按钮状态
                updateInsertStockButton();
                
                // 更新清空库存按钮状态
                updateClearStockButton();
                
                // 更新库位锁定按钮状态
                updateLockLocationButton();
                
                // 更新库位解锁按钮状态
                updateUnlockLocationButton();
                
                // 更新成品明细按钮状态
                updateInventoryDetailButton();
                
                // 更新弹窗内容
                document.getElementById('popupLocation').textContent = location;
                document.getElementById('popupName').textContent = data.name;
                document.getElementById('popupArea').textContent = data.area;
                document.getElementById('popupContainer').textContent = data.container;
                document.getElementById('popupQty').textContent = data.qty;
                
                // 显示弹窗
                detailPopup.classList.add('active');
                
                // 定位弹窗（在单元格旁边）
                const popupWidth = detailPopup.offsetWidth || 280;
                const popupHeight = detailPopup.offsetHeight || 200;
                
                // 计算弹窗位置（优先显示在右侧）
                let left = rect.right + 10 + window.scrollX;
                let top = rect.top + window.scrollY;
                
                // 如果右侧空间不够，显示在左侧
                if (left + popupWidth > window.innerWidth + window.scrollX) {
                    left = rect.left - popupWidth - 10 + window.scrollX;
                }
                
                // 如果左侧也不够，显示在单元格下方
                if (left < window.scrollX) {
                    left = rect.left + window.scrollX;
                    top = rect.bottom + 10 + window.scrollY;
                }
                
                // 如果下方空间不够，向上调整
                if (top + popupHeight > window.innerHeight + window.scrollY) {
                    top = rect.top - popupHeight - 10 + window.scrollY;
                }
                
                // 确保不超出视口顶部
                if (top < window.scrollY) {
                    top = window.scrollY + 10;
                }
                
                detailPopup.style.left = left + 'px';
                detailPopup.style.top = top + 'px';
            });
        });
    }

    // 点击其他地方关闭弹窗
    document.addEventListener('click', function(e) {
        // 排除库位单元格、详情弹窗、操作按钮的点击
        if (!e.target.closest('.location-cell') && 
            !e.target.closest('.detail-popup') && 
            !e.target.closest('.op-btn')) {
            detailPopup.classList.remove('active');
            if (currentSelectedCell) {
                currentSelectedCell.classList.remove('selected');
                currentSelectedCell = null;
                currentLocationData = null;
                updateInsertStockButton();
                updateClearStockButton();
                updateLockLocationButton();
                updateUnlockLocationButton();
                updateInventoryDetailButton();
            }
        }
    });

    // ========== 插入库存功能 ==========
    const insertStockModal = document.getElementById('insertStockModal');
    const insertStockBtn = document.getElementById('insertStockBtn');
    const closeInsertModal = document.getElementById('closeInsertModal');
    const cancelInsertBtn = document.getElementById('cancelInsertBtn');
    const confirmInsertBtn = document.getElementById('confirmInsertBtn');
    const containerCodeInput = document.getElementById('containerCodeInput');
    const containerDropdown = document.getElementById('containerDropdown');
    const addMaterialBtn = document.getElementById('addMaterialBtn');
    const materialTableBody = document.getElementById('materialTableBody');

    let selectedContainer = null;
    let materialList = [];

    // 打开插入库存弹窗（支持空库位、空托库位、有货库位）
    insertStockBtn.addEventListener('click', function() {
        if (!currentLocationData) return;
        
        // 只有空库位、空托库位、有货库位才能插入库存
        if (currentLocationData.status !== 'empty' && 
            currentLocationData.status !== 'empty-pallet' && 
            currentLocationData.status !== 'occupied') {
            alert('只有空库位、空托库位、有货库位才能插入库存');
            return;
        }

        // 重置数据
        selectedContainer = null;
        materialList = [];

        // 填充库位信息
        document.getElementById('modalLocationCode').value = currentLocationData.location;
        document.getElementById('modalLocationName').value = currentLocationData.name;

        // 根据库位状态设置容器编码和物料明细
        if (currentLocationData.status === 'empty') {
            // 空库位：可选择容器，物料为空
            containerCodeInput.value = '';
            containerCodeInput.readOnly = false;
            containerCodeInput.placeholder = '请输入容器编码进行搜索';
        } else if (currentLocationData.status === 'empty-pallet') {
            // 空托库位：默认已选容器（只读），物料为空
            containerCodeInput.value = currentLocationData.container;
            containerCodeInput.readOnly = true;
            selectedContainer = { code: currentLocationData.container };
        } else if (currentLocationData.status === 'occupied') {
            // 有货库位：默认已选容器（只读），显示现有物料（只读）
            containerCodeInput.value = currentLocationData.container;
            containerCodeInput.readOnly = true;
            selectedContainer = { code: currentLocationData.container };
            
            // 加载现有物料（只读）
            if (currentLocationData.materials && currentLocationData.materials.length > 0) {
                materialList = currentLocationData.materials.map(m => ({
                    code: m.code,
                    name: m.name,
                    quantity: m.quantity,
                    readonly: true
                }));
            }
        }

        // 渲染物料表格
        renderMaterialTable();

        // 显示弹窗
        insertStockModal.style.display = 'flex';
        
        console.log('打开插入库存弹窗：', currentLocationData.location, '状态：', currentLocationData.status);
    });

    // 关闭插入库存弹窗
    function closeInsertStockModal() {
        insertStockModal.style.display = 'none';
        containerCodeInput.value = '';
        containerCodeInput.readOnly = false;
        containerDropdown.style.display = 'none';
        materialList = [];
        selectedContainer = null;
        renderMaterialTable();
        console.log('插入库存弹窗已关闭');
    }

    closeInsertModal.addEventListener('click', closeInsertStockModal);
    cancelInsertBtn.addEventListener('click', closeInsertStockModal);

    // 点击弹窗外部关闭
    insertStockModal.addEventListener('click', function(e) {
        if (e.target === insertStockModal) {
            closeInsertStockModal();
        }
    });

    // 容器编码搜索
    containerCodeInput.addEventListener('input', function() {
        // 如果是只读状态，不响应输入
        if (this.readOnly) {
            return;
        }
        
        const keyword = this.value.trim();
        
        // 用户输入时，清除已选择的容器
        selectedContainer = null;
        
        if (!keyword) {
            containerDropdown.style.display = 'none';
            return;
        }

        // 模糊搜索容器
        const filtered = mockContainers.filter(c => 
            c.code.toLowerCase().includes(keyword.toLowerCase())
        ).slice(0, 10); // 最多显示10条

        if (filtered.length > 0) {
            containerDropdown.innerHTML = filtered.map(c => `
                <div class="dropdown-item" data-code="${c.code}" data-name="${c.name}" data-type="${c.type}">
                    <div class="dropdown-code">${c.code}</div>
                    <div class="dropdown-name">${c.name} (${c.type})</div>
                </div>
            `).join('');
            
            // 使用fixed定位，计算下拉框位置
            const rect = this.getBoundingClientRect();
            containerDropdown.style.left = rect.left + 'px';
            containerDropdown.style.top = (rect.bottom + 4) + 'px';
            containerDropdown.style.width = rect.width + 'px';
            containerDropdown.style.display = 'block';
        } else {
            containerDropdown.innerHTML = '<div class="dropdown-empty">未找到匹配的容器</div>';
            
            // 使用fixed定位，计算下拉框位置
            const rect = this.getBoundingClientRect();
            containerDropdown.style.left = rect.left + 'px';
            containerDropdown.style.top = (rect.bottom + 4) + 'px';
            containerDropdown.style.width = rect.width + 'px';
            containerDropdown.style.display = 'block';
        }
    });

    // 选择容器
    containerDropdown.addEventListener('click', function(e) {
        const item = e.target.closest('.dropdown-item');
        if (item) {
            const code = item.getAttribute('data-code');
            const name = item.getAttribute('data-name');
            const type = item.getAttribute('data-type');
            
            containerCodeInput.value = code;
            selectedContainer = { 
                code: code,
                name: name,
                type: type
            };
            containerDropdown.style.display = 'none';
            
            console.log('已选择容器：', selectedContainer);
        }
    });

    // 点击其他地方关闭容器下拉框
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-input-wrapper') || !e.target.closest('#insertStockModal')) {
            containerDropdown.style.display = 'none';
        }
    });

    // 添加物料
    addMaterialBtn.addEventListener('click', function() {
        // 添加新的可编辑物料行
        materialList.push({
            code: '',
            name: '',
            quantity: 1,
            readonly: false
        });
        renderMaterialTable();
    });

    // 渲染物料表格
    function renderMaterialTable() {
        if (materialList.length === 0) {
            materialTableBody.innerHTML = '<tr><td colspan="4" class="empty-row">暂无物料，点击"添加物料"按钮添加</td></tr>';
            return;
        }

        materialTableBody.innerHTML = materialList.map((material, index) => {
            if (material.readonly) {
                // 只读行（现有物料）
                return `
                    <tr class="readonly-row">
                        <td>${material.code}</td>
                        <td>${material.name}</td>
                        <td>${material.quantity}</td>
                        <td><span class="readonly-tag">只读</span></td>
                    </tr>
                `;
            } else {
                // 可编辑行（新增物料）
                return `
                    <tr data-index="${index}">
                        <td>
                            <div class="search-input-wrapper">
                                <input type="text" class="table-input material-code-input" 
                                       value="${material.code}" placeholder="输入物料编码搜索"
                                       data-index="${index}">
                                <div class="material-dropdown" id="materialCodeDropdown${index}"></div>
                            </div>
                        </td>
                        <td>
                            <div class="search-input-wrapper">
                                <input type="text" class="table-input material-name-input" 
                                       value="${material.name}" placeholder="输入物料名称搜索"
                                       data-index="${index}">
                                <div class="material-dropdown" id="materialNameDropdown${index}"></div>
                            </div>
                        </td>
                        <td>
                            <input type="number" class="table-input" 
                                   value="${material.quantity}" min="1"
                                   data-index="${index}" data-field="quantity">
                        </td>
                        <td>
                            <button class="delete-btn" data-index="${index}">删除</button>
                        </td>
                    </tr>
                `;
            }
        }).join('');

        // 绑定物料编码输入事件（只针对可编辑行）
        const materialCodeInputs = materialTableBody.querySelectorAll('.material-code-input');
        materialCodeInputs.forEach(input => {
            const index = parseInt(input.getAttribute('data-index'));
            const dropdown = document.getElementById(`materialCodeDropdown${index}`);
            
            input.addEventListener('input', function() {
                const keyword = this.value.trim();
                
                if (!keyword) {
                    dropdown.style.display = 'none';
                    return;
                }

                // 模糊搜索物料（按编码）
                const filtered = mockMaterials.filter(m => 
                    m.code.toLowerCase().includes(keyword.toLowerCase())
                ).slice(0, 10);

                if (filtered.length > 0) {
                    dropdown.innerHTML = filtered.map(m => `
                        <div class="dropdown-item" data-index="${index}" data-code="${m.code}" data-name="${m.name}">
                            <div class="dropdown-code">${m.code}</div>
                            <div class="dropdown-name">${m.name}</div>
                        </div>
                    `).join('');
                    
                    // 使用fixed定位，计算下拉框位置
                    const rect = this.getBoundingClientRect();
                    dropdown.style.left = rect.left + 'px';
                    dropdown.style.top = (rect.bottom + 2) + 'px';
                    dropdown.style.width = rect.width + 'px';
                    dropdown.style.display = 'block';
                } else {
                    dropdown.innerHTML = '<div class="dropdown-empty">未找到匹配的物料</div>';
                    
                    // 使用fixed定位，计算下拉框位置
                    const rect = this.getBoundingClientRect();
                    dropdown.style.left = rect.left + 'px';
                    dropdown.style.top = (rect.bottom + 2) + 'px';
                    dropdown.style.width = rect.width + 'px';
                    dropdown.style.display = 'block';
                }
            });

            input.addEventListener('blur', function() {
                setTimeout(() => {
                    dropdown.style.display = 'none';
                }, 200);
            });

            dropdown.addEventListener('click', function(e) {
                const item = e.target.closest('.dropdown-item');
                if (item) {
                    const idx = parseInt(item.getAttribute('data-index'));
                    const code = item.getAttribute('data-code');
                    const name = item.getAttribute('data-name');
                    
                    materialList[idx].code = code;
                    materialList[idx].name = name;
                    renderMaterialTable();
                }
            });
        });

        // 绑定物料名称输入事件（只针对可编辑行）
        const materialNameInputs = materialTableBody.querySelectorAll('.material-name-input');
        materialNameInputs.forEach(input => {
            const index = parseInt(input.getAttribute('data-index'));
            const dropdown = document.getElementById(`materialNameDropdown${index}`);
            
            input.addEventListener('input', function() {
                const keyword = this.value.trim();
                
                if (!keyword) {
                    dropdown.style.display = 'none';
                    return;
                }

                // 模糊搜索物料（按名称）
                const filtered = mockMaterials.filter(m => 
                    m.name.toLowerCase().includes(keyword.toLowerCase())
                ).slice(0, 10);

                if (filtered.length > 0) {
                    dropdown.innerHTML = filtered.map(m => `
                        <div class="dropdown-item" data-index="${index}" data-code="${m.code}" data-name="${m.name}">
                            <div class="dropdown-code">${m.code}</div>
                            <div class="dropdown-name">${m.name}</div>
                        </div>
                    `).join('');
                    
                    // 使用fixed定位，计算下拉框位置
                    const rect = this.getBoundingClientRect();
                    dropdown.style.left = rect.left + 'px';
                    dropdown.style.top = (rect.bottom + 2) + 'px';
                    dropdown.style.width = rect.width + 'px';
                    dropdown.style.display = 'block';
                } else {
                    dropdown.innerHTML = '<div class="dropdown-empty">未找到匹配的物料</div>';
                    
                    // 使用fixed定位，计算下拉框位置
                    const rect = this.getBoundingClientRect();
                    dropdown.style.left = rect.left + 'px';
                    dropdown.style.top = (rect.bottom + 2) + 'px';
                    dropdown.style.width = rect.width + 'px';
                    dropdown.style.display = 'block';
                }
            });

            input.addEventListener('blur', function() {
                setTimeout(() => {
                    dropdown.style.display = 'none';
                }, 200);
            });

            dropdown.addEventListener('click', function(e) {
                const item = e.target.closest('.dropdown-item');
                if (item) {
                    const idx = parseInt(item.getAttribute('data-index'));
                    const code = item.getAttribute('data-code');
                    const name = item.getAttribute('data-name');
                    
                    materialList[idx].code = code;
                    materialList[idx].name = name;
                    renderMaterialTable();
                }
            });
        });

        // 绑定数量输入事件（只针对可编辑行）
        const quantityInputs = materialTableBody.querySelectorAll('input[data-field="quantity"]');
        quantityInputs.forEach(input => {
            input.addEventListener('change', function() {
                const index = parseInt(this.getAttribute('data-index'));
                materialList[index].quantity = parseInt(this.value) || 1;
            });
        });

        // 绑定删除按钮（只针对可编辑行）
        const deleteBtns = materialTableBody.querySelectorAll('.delete-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                materialList.splice(index, 1);
                renderMaterialTable();
            });
        });
    }

    // 确认插入库存
    confirmInsertBtn.addEventListener('click', function() {
        console.log('点击确认按钮，开始校验');
        
        // 1. 校验容器编码（只在非只读状态下校验）
        if (!containerCodeInput.readOnly) {
            const containerCode = containerCodeInput.value.trim();
            if (!containerCode) {
                alert('请填写容器编码');
                containerCodeInput.focus();
                return;
            }
        }
        
        // 2. 校验物料明细（如果添加了物料）
        if (materialList.length > 0) {
            // 只校验可编辑的物料行
            for (let i = 0; i < materialList.length; i++) {
                const material = materialList[i];
                
                // 跳过只读行
                if (material.readonly) {
                    continue;
                }
                
                // 计算实际行号（用于提示）
                const rowNumber = i + 1;
                
                // 校验物料编码（必填）
                if (!material.code || material.code.trim() === '') {
                    alert(`第 ${rowNumber} 行物料：请填写物料编码`);
                    return;
                }
                
                // 校验物料名称（必填）
                if (!material.name || material.name.trim() === '') {
                    alert(`第 ${rowNumber} 行物料：请填写物料名称`);
                    return;
                }
                
                // 校验数量（必填）
                if (!material.quantity || material.quantity < 1) {
                    alert(`第 ${rowNumber} 行物料：请填写数量（必须大于0）`);
                    return;
                }
            }
        }
        
        // 校验通过，关闭弹窗
        console.log('校验通过，关闭弹窗');
        closeInsertStockModal();
    });

    // ========== 清空库存功能 ==========
    const clearStockModal = document.getElementById('clearStockModal');
    const clearStockBtn = document.getElementById('clearStockBtn');
    const closeClearModal = document.getElementById('closeClearModal');
    const cancelClearBtn = document.getElementById('cancelClearBtn');
    const confirmClearOnlyBtn = document.getElementById('confirmClearOnlyBtn');
    
    // 调试：检查元素是否正确获取
    console.log('清空库存元素检查：', {
        clearStockModal: clearStockModal !== null,
        clearStockBtn: clearStockBtn !== null,
        closeClearModal: closeClearModal !== null,
        cancelClearBtn: cancelClearBtn !== null,
        confirmClearOnlyBtn: confirmClearOnlyBtn !== null
    });

    // 打开清空库存确认弹窗
    clearStockBtn.addEventListener('click', function() {
        if (!currentLocationData || currentLocationData.status !== 'occupied') {
            alert('请选择有货库位');
            return;
        }

        // 填充确认弹窗信息
        document.getElementById('clearLocationCode').textContent = currentLocationData.location;
        document.getElementById('clearLocationName').textContent = currentLocationData.name;
        document.getElementById('clearContainerCode').textContent = currentLocationData.container;
        
        // 计算物料总数量
        const totalMaterials = currentLocationData.materials ? currentLocationData.materials.length : 0;
        const totalQuantity = currentLocationData.materials ? 
            currentLocationData.materials.reduce((sum, m) => sum + m.quantity, 0) : 0;
        document.getElementById('clearMaterialCount').textContent = `${totalMaterials}种物料，共${totalQuantity}件`;

        // 显示确认弹窗
        clearStockModal.style.display = 'flex';
        
        console.log('打开清空库存确认弹窗：', currentLocationData.location);
    });

    // 关闭清空库存弹窗
    function closeClearStockModal() {
        clearStockModal.style.display = 'none';
        console.log('清空库存弹窗已关闭');
    }

    closeClearModal.addEventListener('click', closeClearStockModal);
    cancelClearBtn.addEventListener('click', closeClearStockModal);

    // 【确认】按钮 - 仅关闭弹窗
    if (confirmClearOnlyBtn) {
        confirmClearOnlyBtn.addEventListener('click', function() {
            console.log('点击确认按钮，关闭弹窗');
            closeClearStockModal();
        });
    }

    // 点击弹窗外部关闭
    clearStockModal.addEventListener('click', function(e) {
        if (e.target === clearStockModal) {
            closeClearStockModal();
        }
    });

    // ========== 库位锁定功能 ==========
    const lockLocationModal = document.getElementById('lockLocationModal');
    const lockLocationBtn = document.getElementById('lockLocationBtn');
    const closeLockModal = document.getElementById('closeLockModal');
    const cancelLockBtn = document.getElementById('cancelLockBtn');
    const confirmLockBtn = document.getElementById('confirmLockBtn');
    const lockReasonInput = document.getElementById('lockReason');

    // 调试：检查元素是否正确获取
    console.log('库位锁定元素检查：', {
        lockLocationModal: lockLocationModal !== null,
        lockLocationBtn: lockLocationBtn !== null,
        closeLockModal: closeLockModal !== null,
        cancelLockBtn: cancelLockBtn !== null,
        confirmLockBtn: confirmLockBtn !== null,
        lockReasonInput: lockReasonInput !== null
    });

    // 打开库位锁定弹窗
    if (lockLocationBtn) {
        lockLocationBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            
            console.log('库位锁定按钮被点击', {
                currentLocationData: currentLocationData,
                disabled: this.disabled,
                status: currentLocationData ? currentLocationData.status : 'null'
            });
            
            // 如果按钮被禁用，不执行操作
            if (this.disabled) {
                console.log('按钮被禁用，无法打开弹窗');
                return;
            }
            
            if (!currentLocationData) {
                alert('请选择库位');
                return;
            }

            // 填充库位信息
            document.getElementById('lockLocationCode').value = currentLocationData.location;
            document.getElementById('lockLocationName').value = currentLocationData.name;
            
            // 清空锁定原因输入框
            if (lockReasonInput) {
                lockReasonInput.value = '';
            }

            // 显示弹窗
            if (lockLocationModal) {
                lockLocationModal.style.display = 'flex';
                console.log('✅ 库位锁定弹窗已显示');
            } else {
                console.error('❌ lockLocationModal 元素不存在');
            }
        });
    } else {
        console.error('❌ 库位锁定按钮元素不存在！');
    }

    // 关闭库位锁定弹窗
    function closeLockLocationModal() {
        lockLocationModal.style.display = 'none';
        lockReasonInput.value = '';
        console.log('库位锁定弹窗已关闭');
    }

    closeLockModal.addEventListener('click', closeLockLocationModal);
    cancelLockBtn.addEventListener('click', closeLockLocationModal);

    // 点击弹窗外部关闭
    lockLocationModal.addEventListener('click', function(e) {
        if (e.target === lockLocationModal) {
            closeLockLocationModal();
        }
    });

    // 确定锁定
    if (confirmLockBtn) {
        confirmLockBtn.addEventListener('click', function() {
            console.log('🔵 确定锁定按钮被点击');
            
            const reason = lockReasonInput.value.trim();
            console.log('锁定原因：', reason);
            
            // 验证锁定原因是否填写
            if (!reason) {
                alert('请填写锁定原因');
                lockReasonInput.focus();
                return;
            }

            console.log('锁定原因已填写，关闭弹窗：', {
                location: currentLocationData ? currentLocationData.location : 'null',
                reason: reason
            });

            // 关闭弹窗
            closeLockLocationModal();
            console.log('✅ 弹窗关闭函数已调用');
        });
    } else {
        console.error('❌ confirmLockBtn 元素不存在');
    }

    // ========== 库位解锁功能 ==========
    const unlockLocationModal = document.getElementById('unlockLocationModal');
    const unlockLocationBtn = document.getElementById('unlockLocationBtn');
    const closeUnlockModal = document.getElementById('closeUnlockModal');
    const cancelUnlockBtn = document.getElementById('cancelUnlockBtn');
    const confirmUnlockBtn = document.getElementById('confirmUnlockBtn');

    // 打开库位解锁弹窗
    if (unlockLocationBtn) {
        unlockLocationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            console.log('库位解锁按钮被点击');
            
            if (this.disabled) {
                console.log('按钮被禁用，无法打开弹窗');
                return;
            }
            
            if (!currentLocationData) {
                alert('请选择库位');
                return;
            }

            // 填充库位信息
            document.getElementById('unlockLocationCode').textContent = currentLocationData.location;
            document.getElementById('unlockLocationName').textContent = currentLocationData.name;

            // 显示弹窗
            if (unlockLocationModal) {
                unlockLocationModal.style.display = 'flex';
                console.log('✅ 库位解锁弹窗已显示');
            }
        });
    }

    // 关闭库位解锁弹窗
    function closeUnlockLocationModal() {
        unlockLocationModal.style.display = 'none';
        console.log('库位解锁弹窗已关闭');
    }

    if (closeUnlockModal) {
        closeUnlockModal.addEventListener('click', closeUnlockLocationModal);
    }
    
    if (cancelUnlockBtn) {
        cancelUnlockBtn.addEventListener('click', closeUnlockLocationModal);
    }

    // 点击弹窗外部关闭
    if (unlockLocationModal) {
        unlockLocationModal.addEventListener('click', function(e) {
            if (e.target === unlockLocationModal) {
                closeUnlockLocationModal();
            }
        });
    }

    // 确认解锁
    if (confirmUnlockBtn) {
        confirmUnlockBtn.addEventListener('click', function() {
            console.log('确认解锁按钮被点击');
            
            // 关闭弹窗
            closeUnlockLocationModal();
        });
    }

    // ========== 成品明细功能 ==========
    const inventoryDetailModal = document.getElementById('inventoryDetailModal');
    const inventoryDetailBtn = document.getElementById('inventoryDetailBtn');
    const closeInventoryDetailModal = document.getElementById('closeInventoryDetailModal');
    const closeInventoryDetailBtn = document.getElementById('closeInventoryDetailBtn');
    const inventoryDetailTableBody = document.getElementById('inventoryDetailTableBody');

    // 生成模拟成品明细数据（根据库位状态）
    function generateInventoryDetails(materials, containerCode, locationStatus) {
        // 空库位和空托库位：没有物料数据
        if (locationStatus === 'empty' || locationStatus === 'empty-pallet') {
            return [];
        }

        // 如果没有物料数据，返回空
        if (!materials || materials.length === 0) {
            return [];
        }

        const now = new Date();

        return materials.map((material, index) => {
            // 随机生成组盘时间（1-30天前）
            const palletDays = Math.floor(Math.random() * 30) + 1;
            const palletTime = new Date(now.getTime() - palletDays * 24 * 60 * 60 * 1000);
            
            // 随机生成入库时间（组盘后0-5天）
            const inboundDays = Math.floor(Math.random() * 5);
            const inboundTime = new Date(palletTime.getTime() + inboundDays * 24 * 60 * 60 * 1000);
            
            // 计算库龄（从入库时间到现在）
            const age = Math.floor((now - inboundTime) / (24 * 60 * 60 * 1000));

            // 根据库位状态设置物料状态
            let status = '正常';
            if (locationStatus === 'material-locked') {
                // 物料锁定库位：至少有一条物料是锁定状态
                // 第一条物料设为锁定，其他随机
                if (index === 0) {
                    status = '锁定';
                } else {
                    status = Math.random() > 0.5 ? '正常' : '锁定';
                }
            } else if (locationStatus === 'occupied') {
                // 有货库位：所有物料都是正常状态
                status = '正常';
            }

            return {
                code: material.code,
                name: material.name,
                quantity: material.quantity,
                palletTime: formatDateTime(palletTime),
                inboundTime: formatDateTime(inboundTime),
                age: age,
                status: status
            };
        });
    }

    // 检查是否有物料被锁定
    function hasMaterialLocked(inventoryDetails) {
        if (!inventoryDetails || inventoryDetails.length === 0) {
            return false;
        }
        return inventoryDetails.some(item => item.status === '锁定');
    }

    // 更新库位状态（根据物料锁定情况）
    function updateLocationStatusByMaterial(inventoryDetails) {
        if (!currentSelectedCell || !currentLocationData) {
            return;
        }

        // 只有有货库位才需要检查物料锁定状态
        if (currentLocationData.status !== 'occupied') {
            return;
        }

        const hasLocked = hasMaterialLocked(inventoryDetails);
        
        if (hasLocked) {
            // 如果有物料被锁定，库位状态变为"物料锁定"
            if (currentLocationData.status !== 'material-locked') {
                currentSelectedCell.classList.remove('occupied');
                currentSelectedCell.classList.add('material-locked');
                
                const statusDiv = currentSelectedCell.querySelector('.cell-status');
                if (statusDiv) {
                    statusDiv.textContent = '物料锁定';
                }
                
                currentLocationData.status = 'material-locked';
                
                console.log('库位状态已更新为物料锁定：', currentLocationData.location);
            }
        } else {
            // 如果没有物料被锁定，库位状态恢复为"有货"
            if (currentLocationData.status === 'material-locked') {
                currentSelectedCell.classList.remove('material-locked');
                currentSelectedCell.classList.add('occupied');
                
                const statusDiv = currentSelectedCell.querySelector('.cell-status');
                if (statusDiv) {
                    statusDiv.textContent = '有货';
                }
                
                currentLocationData.status = 'occupied';
                
                console.log('库位状态已恢复为有货：', currentLocationData.location);
            }
        }
    }

    // 格式化日期时间
    function formatDateTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    // 打开成品明细弹窗
    if (inventoryDetailBtn) {
        inventoryDetailBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            console.log('成品明细按钮被点击');
            
            if (this.disabled) {
                console.log('按钮被禁用，无法打开弹窗');
                return;
            }
            
            if (!currentLocationData) {
                alert('请选择库位');
                return;
            }

            // 填充库位信息
            document.getElementById('detailLocationCode').value = currentLocationData.location;
            document.getElementById('detailLocationName').value = currentLocationData.name;

            // 填充容器信息
            if (currentLocationData.container && currentLocationData.container !== '-') {
                document.getElementById('detailContainerCode').value = currentLocationData.container;
                
                // 查找容器类型
                const container = mockContainers.find(c => c.code === currentLocationData.container);
                document.getElementById('detailContainerType').value = container ? container.type : '-';
            } else {
                document.getElementById('detailContainerCode').value = '-';
                document.getElementById('detailContainerType').value = '-';
            }

            // 生成并渲染物料明细（传入库位状态）
            const inventoryDetails = generateInventoryDetails(
                currentLocationData.materials, 
                currentLocationData.container,
                currentLocationData.status
            );
            renderInventoryDetailTable(inventoryDetails);

            // 根据物料锁定情况更新库位状态
            updateLocationStatusByMaterial(inventoryDetails);

            // 显示弹窗
            if (inventoryDetailModal) {
                inventoryDetailModal.style.display = 'flex';
                console.log('✅ 成品明细弹窗已显示');
            }
        });
    }

    // 渲染成品明细表格
    function renderInventoryDetailTable(details) {
        if (!details || details.length === 0) {
            inventoryDetailTableBody.innerHTML = '<tr><td colspan="7" class="empty-row">暂无物料</td></tr>';
            return;
        }

        inventoryDetailTableBody.innerHTML = details.map(item => `
            <tr>
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.palletTime}</td>
                <td>${item.inboundTime}</td>
                <td>${item.age}</td>
                <td>${item.status}</td>
            </tr>
        `).join('');
    }

    // 关闭成品明细弹窗
    function closeInventoryDetailModalFunc() {
        inventoryDetailModal.style.display = 'none';
        console.log('成品明细弹窗已关闭');
    }

    if (closeInventoryDetailModal) {
        closeInventoryDetailModal.addEventListener('click', closeInventoryDetailModalFunc);
    }
    
    if (closeInventoryDetailBtn) {
        closeInventoryDetailBtn.addEventListener('click', closeInventoryDetailModalFunc);
    }

    // 点击弹窗外部关闭
    if (inventoryDetailModal) {
        inventoryDetailModal.addEventListener('click', function(e) {
            if (e.target === inventoryDetailModal) {
                closeInventoryDetailModalFunc();
            }
        });
    }



    // 自定义多选下拉框
    const customSelects = document.querySelectorAll('.custom-select');
    customSelects.forEach(select => {
        const trigger = select.querySelector('.select-trigger');
        const checkboxes = select.querySelectorAll('input[type="checkbox"]');
        const selectText = select.querySelector('.select-text');

        // 更新显示文本
        function updateText() {
            const checked = Array.from(checkboxes).filter(cb => cb.checked);
            const total = checkboxes.length;
            
            if (checked.length === 0) {
                selectText.textContent = '请选择';
            } else if (checked.length === total) {
                selectText.textContent = '全部';
            } else {
                const labels = checked.map(cb => cb.nextElementSibling.textContent);
                selectText.textContent = labels.join(', ');
            }
        }

        // 初始化显示
        updateText();

        // 点击触发器切换下拉框
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // 关闭其他下拉框
            customSelects.forEach(s => {
                if (s !== select) {
                    s.classList.remove('active');
                }
            });
            
            // 切换当前下拉框
            select.classList.toggle('active');
        });

        // 复选框变化时更新文本
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                updateText();
                
                // 获取选中的值
                const selectedValues = Array.from(checkboxes)
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);
                
                console.log('选中的值：', selectedValues);
                
                // 如果是排的筛选，触发库位显示更新
                if (select.id === 'rowSelect') {
                    filterWarehouseRows(selectedValues);
                    
                    // 如果当前在侧视图，重新生成侧视图
                    if (sideViewContainer.style.display !== 'none') {
                        generateSideView(currentDepth);
                    }
                }
            });
        });
    });

    // 筛选库位排显示
    function filterWarehouseRows(selectedRows) {
        const allStackHeaders = document.querySelectorAll('.stack-header');
        const allGridTables = document.querySelectorAll('.grid-table');
        
        if (selectedRows.length === 0) {
            // 如果没有选中任何排，隐藏所有
            allStackHeaders.forEach(element => {
                element.style.display = 'none';
            });
            allGridTables.forEach(element => {
                element.style.display = 'none';
            });
            return;
        }
        
        // 显示/隐藏对应的排
        allStackHeaders.forEach(header => {
            const row = header.getAttribute('data-row');
            if (selectedRows.includes(row)) {
                header.style.display = 'block';
            } else {
                header.style.display = 'none';
            }
        });
        
        allGridTables.forEach(table => {
            const row = table.getAttribute('data-row');
            if (selectedRows.includes(row)) {
                table.style.display = 'table';
            } else {
                table.style.display = 'none';
            }
        });
    }

    // 点击其他地方关闭下拉框
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.custom-select')) {
            customSelects.forEach(select => {
                select.classList.remove('active');
            });
        }
    });

    // 视图切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    const topViewContainer = document.getElementById('warehouseGrid');
    const sideViewContainer = document.getElementById('warehouseSideView');
    const levelFilterGroup = document.getElementById('levelFilterGroup');
    const depthFilterGroup = document.getElementById('depthFilterGroup');
    let currentDepth = 1; // 当前选择的深度，默认1深
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.getAttribute('data-view');
            console.log('切换到视图：', view);
            
            if (view === 'top') {
                // 显示俯视图
                topViewContainer.style.display = 'block';
                sideViewContainer.style.display = 'none';
                
                // 显示"层"筛选，隐藏"深"筛选
                if (levelFilterGroup) levelFilterGroup.style.display = 'block';
                if (depthFilterGroup) depthFilterGroup.style.display = 'none';
            } else if (view === 'side') {
                // 显示侧视图
                topViewContainer.style.display = 'none';
                sideViewContainer.style.display = 'block';
                
                // 隐藏"层"筛选，显示"深"筛选
                if (levelFilterGroup) levelFilterGroup.style.display = 'none';
                if (depthFilterGroup) depthFilterGroup.style.display = 'block';
                
                // 生成侧视图
                generateSideView(currentDepth);
            }
        });
    });

    // 生成侧视图（全景：4排并排显示）
    function generateSideView(depth) {
        sideViewContainer.innerHTML = '';
        
        const rows = 4; // 4排
        const cols = 32; // 32列
        const levels = 12; // 12层

        // 获取选中的排
        const rowSelect = document.getElementById('rowSelect');
        const rowCheckboxes = rowSelect.querySelectorAll('input[type="checkbox"]');
        const selectedRows = Array.from(rowCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => parseInt(cb.value));

        // 如果没有选中任何排，不显示任何内容
        if (selectedRows.length === 0) {
            return;
        }

        // 为每一排生成侧视图
        for (let row = 1; row <= rows; row++) {
            // 如果该排未被选中，跳过
            if (!selectedRows.includes(row)) {
                continue;
            }

            // 如果选择2深，只显示1排
            if (depth === 2 && row > 1) {
                continue;
            }

            // 排标题
            const rowHeader = document.createElement('div');
            rowHeader.className = 'side-view-row-header';
            rowHeader.innerHTML = `<h3 class="side-view-title">${row}排 - ${depth}深</h3>`;
            sideViewContainer.appendChild(rowHeader);

            // 创建侧视图表格容器
            const sideTable = document.createElement('div');
            sideTable.className = 'side-view-table';
            sideTable.setAttribute('data-row', row);

            // 表头（列号）
            const headerRow = document.createElement('div');
            headerRow.className = 'side-view-header-row';
            headerRow.innerHTML = '<div class="side-view-cell side-view-corner">层/列</div>';
            
            for (let col = 1; col <= cols; col++) {
                const headerCell = document.createElement('div');
                headerCell.className = 'side-view-cell side-view-header-cell';
                headerCell.textContent = col;
                headerRow.appendChild(headerCell);
            }
            sideTable.appendChild(headerRow);

            // 生成每一层（从上到下：12层到1层）
            for (let level = levels; level >= 1; level--) {
                const levelRow = document.createElement('div');
                levelRow.className = 'side-view-data-row';

                // 行头（层号）
                const levelHeader = document.createElement('div');
                levelHeader.className = 'side-view-cell side-view-level-header';
                levelHeader.textContent = `${level}层`;
                levelRow.appendChild(levelHeader);

                // 生成每一列
                for (let col = 1; col <= cols; col++) {
                    const location = `${row}-${col}-${level}-${depth}`;
                    const status = getRandomStatus();
                    
                    const cell = document.createElement('div');
                    cell.className = `side-view-cell side-view-location-cell ${status}`;
                    cell.setAttribute('data-location', location);
                    cell.innerHTML = `
                        <div class="cell-code">${row}-${col}-${level}-${depth}</div>
                        <div class="cell-status">${getStatusText(status)}</div>
                    `;
                    
                    levelRow.appendChild(cell);
                }

                sideTable.appendChild(levelRow);
            }

            sideViewContainer.appendChild(sideTable);
        }

        // 绑定点击事件
        bindSideViewCellEvents();
    }

    // 绑定侧视图单元格事件
    function bindSideViewCellEvents() {
        const locationCells = sideViewContainer.querySelectorAll('.side-view-location-cell');
        
        locationCells.forEach(cell => {
            cell.addEventListener('click', function(e) {
                e.stopPropagation();
                
                const location = this.getAttribute('data-location');
                const rect = this.getBoundingClientRect();
                
                // 移除之前的选中状态
                if (currentSelectedCell) {
                    currentSelectedCell.classList.remove('selected');
                }
                
                // 移除定位标记（如果存在）
                if (currentLocatedCell) {
                    currentLocatedCell.classList.remove('selected');
                    currentLocatedCell = null;
                }
                
                // 添加选中状态
                this.classList.add('selected');
                currentSelectedCell = this;
                
                // 解析库位编码
                const parts = location.split('-');
                const row = parts[0];
                const col = parts[1];
                const level = parts[2];
                const depth = parts[3];
                
                // 判断库位状态
                const isOccupied = this.classList.contains('occupied');
                const isEmpty = this.classList.contains('empty');
                const isEmptyPallet = this.classList.contains('empty-pallet');
                const isMaterialLocked = this.classList.contains('material-locked');
                const isLocked = this.classList.contains('locked');
                const isDisabled = this.classList.contains('disabled');
                
                // 获取库位数据
                const data = {
                    location: location,
                    name: `${row}排-${col}列-${level}层-${depth}深`,
                    area: `${row}排库区`,
                    container: isEmpty ? '-' : generateRandomContainerCode(),
                    qty: isEmpty ? 0 : Math.floor(Math.random() * 10) + 1,
                    status: isOccupied ? 'occupied' : 
                            (isEmpty ? 'empty' : 
                            (isEmptyPallet ? 'empty-pallet' : 
                            (isMaterialLocked ? 'material-locked' : 
                            (isLocked ? 'locked' : 'other')))),
                    materials: isMaterialLocked ? generateRandomMaterialsForLocked() : 
                              (isOccupied ? generateRandomMaterials() : [])
                };
                
                // 保存当前库位数据
                currentLocationData = data;
                
                // 更新按钮状态
                updateInsertStockButton();
                updateClearStockButton();
                updateLockLocationButton();
                updateUnlockLocationButton();
                updateInventoryDetailButton();
                
                // 更新弹窗内容
                document.getElementById('popupLocation').textContent = location;
                document.getElementById('popupName').textContent = data.name;
                document.getElementById('popupArea').textContent = data.area;
                document.getElementById('popupContainer').textContent = data.container;
                document.getElementById('popupQty').textContent = data.qty;
                
                // 显示弹窗
                detailPopup.classList.add('active');
                
                // 定位弹窗
                const popupWidth = detailPopup.offsetWidth || 280;
                const popupHeight = detailPopup.offsetHeight || 200;
                
                let left = rect.right + 10 + window.scrollX;
                let top = rect.top + window.scrollY;
                
                if (left + popupWidth > window.innerWidth + window.scrollX) {
                    left = rect.left - popupWidth - 10 + window.scrollX;
                }
                
                if (left < window.scrollX) {
                    left = rect.left + window.scrollX;
                    top = rect.bottom + 10 + window.scrollY;
                }
                
                if (top + popupHeight > window.innerHeight + window.scrollY) {
                    top = rect.top - popupHeight - 10 + window.scrollY;
                }
                
                if (top < window.scrollY) {
                    top = window.scrollY + 10;
                }
                
                detailPopup.style.left = left + 'px';
                detailPopup.style.top = top + 'px';
            });
        });
    }

    // 数字输入框增减
    const numBtns = document.querySelectorAll('.num-btn');
    numBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            let input;
            
            if (target) {
                // 定位库位的输入框
                input = document.getElementById(`locate${target.charAt(0).toUpperCase() + target.slice(1)}`);
            } else {
                // 其他输入框
                input = this.parentElement.querySelector('.num-input');
            }
            
            if (!input) return;
            
            let value = parseInt(input.value) || 1;
            const min = parseInt(input.getAttribute('min')) || 1;
            const max = parseInt(input.getAttribute('max')) || 999;
            
            if (this.textContent === '+') {
                if (value < max) value++;
            } else if (this.textContent === '-' && value > min) {
                value--;
            }
            
            input.value = value;
        });
    });

    // 定位按钮
    const searchBtn = document.querySelector('.search-btn');
    searchBtn.addEventListener('click', function() {
        locateWarehousePosition();
    });

    // 库位定位功能
    function locateWarehousePosition() {
        const row = parseInt(document.getElementById('locateRow').value);
        const col = parseInt(document.getElementById('locateCol').value);
        const level = parseInt(document.getElementById('locateLevel').value);
        const depth = parseInt(document.getElementById('locateDepth').value);

        // 验证输入
        if (row < 1 || row > 4) {
            alert('排的范围是1-4');
            return;
        }
        if (col < 1 || col > 32) {
            alert('列的范围是1-32');
            return;
        }
        if (level < 1 || level > 12) {
            alert('层的范围是1-12');
            return;
        }
        if (depth < 1 || depth > 2) {
            alert('深的范围是1-2');
            return;
        }
        
        // 如果是2-4排，深度只能是1
        if (row > 1 && depth > 1) {
            alert('2-4排只有1深');
            return;
        }

        // 检查当前是俯视图还是侧视图
        const isTopView = topViewContainer.style.display !== 'none';
        const isSideView = sideViewContainer.style.display !== 'none';

        if (isTopView) {
            // 俯视图逻辑
            // 如果当前层不是目标层，切换到目标层
            if (currentLevel !== level) {
                currentLevel = level;
                
                // 更新层选择下拉框
                const levelSelect = document.getElementById('levelSelect');
                levelSelect.value = level;
                
                // 重新生成库位网格
                generateWarehouseGrid(currentLevel);
            }

            // 确保目标排被选中
            const rowSelect = document.getElementById('rowSelect');
            const rowCheckboxes = rowSelect.querySelectorAll('input[type="checkbox"]');
            let targetRowChecked = false;
            
            rowCheckboxes.forEach(cb => {
                if (cb.value === row.toString()) {
                    if (!cb.checked) {
                        cb.checked = true;
                        targetRowChecked = true;
                    }
                }
            });
            
            // 如果刚勾选了目标排，需要更新显示
            if (targetRowChecked) {
                const selectedRows = Array.from(rowCheckboxes)
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);
                filterWarehouseRows(selectedRows);
                
                // 更新排选择器的显示文本
                const selectText = rowSelect.querySelector('.select-text');
                if (selectText) {
                    if (selectedRows.length === 4) {
                        selectText.textContent = '全部';
                    } else {
                        const labels = selectedRows.map(r => r + '排');
                        selectText.textContent = labels.join(', ');
                    }
                }
            }
        } else if (isSideView) {
            // 侧视图逻辑
            // 如果当前深度不是目标深度，切换到目标深度
            if (currentDepth !== depth) {
                currentDepth = depth;
                
                // 更新深度选择下拉框
                const depthSelect = document.getElementById('depthSelect');
                depthSelect.value = depth;
                
                // 重新生成侧视图
                generateSideView(currentDepth);
            }

            // 确保目标排被选中
            const rowSelect = document.getElementById('rowSelect');
            const rowCheckboxes = rowSelect.querySelectorAll('input[type="checkbox"]');
            let targetRowChecked = false;
            
            rowCheckboxes.forEach(cb => {
                if (cb.value === row.toString()) {
                    if (!cb.checked) {
                        cb.checked = true;
                        targetRowChecked = true;
                    }
                }
            });
            
            // 如果刚勾选了目标排，需要更新显示
            if (targetRowChecked) {
                const selectedRows = Array.from(rowCheckboxes)
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);
                
                // 更新排选择器的显示文本
                const selectText = rowSelect.querySelector('.select-text');
                if (selectText) {
                    if (selectedRows.length === 4) {
                        selectText.textContent = '全部';
                    } else {
                        const labels = selectedRows.map(r => r + '排');
                        selectText.textContent = labels.join(', ');
                    }
                }
                
                // 重新生成侧视图
                generateSideView(currentDepth);
            }
        }

        // 构建库位编码
        const location = `${row}-${col}-${level}-${depth}`;
        
        // 延迟查找和定位，确保DOM已更新
        setTimeout(() => {
            const targetCell = document.querySelector(`[data-location="${location}"]`);
            
            if (targetCell) {
                // 移除之前定位库位的标记
                if (currentLocatedCell) {
                    currentLocatedCell.classList.remove('selected');
                }
                
                // 为新定位的库位添加蓝色边框标识
                targetCell.classList.add('selected');
                currentLocatedCell = targetCell;
                
                // 滚动到目标库位
                targetCell.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'center'
                });
                
                // 高亮闪烁效果
                targetCell.style.animation = 'highlight-flash 1s ease-in-out';
                setTimeout(() => {
                    targetCell.style.animation = '';
                }, 1000);
                
                console.log('已定位到库位：', location);
            } else {
                alert(`未找到库位：${location}`);
            }
        }, 100);
    }

    // 常用操作按钮
    const opBtns = document.querySelectorAll('.op-btn, .op-btn-link');
    opBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('执行操作：', this.textContent);
            // 这里可以添加操作逻辑
        });
    });

    // 筛选下拉框
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            console.log('筛选条件变更：', this.value);
            
            // 如果是层的筛选，重新生成库位网格（俯视图）
            if (this.id === 'levelSelect') {
                currentLevel = parseInt(this.value);
                generateWarehouseGrid(currentLevel);
            }
            
            // 如果是深的筛选，重新生成侧视图
            if (this.id === 'depthSelect') {
                currentDepth = parseInt(this.value);
                console.log('切换深度：', currentDepth);
                
                // 如果当前在侧视图，重新生成
                if (sideViewContainer.style.display !== 'none') {
                    generateSideView(currentDepth);
                }
            }
        });
    });
});
