// 入库单管理页面脚本

const ENABLE_INSPECTION_INBOUND = false;

// 模拟数据
let inboundOrdersData = [
    {
        id: 1,
        orderNo: 'RK-2024-0001',
        source: '客户WMS同步',
        upstreamNo: 'WMS-IN-20240115-001',
        type: '模具入库',
        materials: [
            { code: 'MJ-2024-001', name: '注塑模具A型', plannedQty: 12, inboundQty: 12, portAisle: '1号巷道' }
        ],
        status: '已完成',
        createTime: '2024-01-15 09:30:00',
        canEdit: false,
        canDelete: false
    },
    {
        id: 2,
        orderNo: 'RK-2024-0002',
        source: '手工创建',
        upstreamNo: '',
        type: '包装纸箱入库',
        materials: [
            { code: 'BZ-2024-002', name: '24寸拉杆箱包装纸箱', plannedQty: 200, inboundQty: 120, portAisle: '1号巷道' }
        ],
        status: '入库中',
        createTime: '2024-01-16 10:15:00',
        canEdit: false,
        canDelete: false
    },
    {
        id: 3,
        orderNo: 'RK-2024-0003',
        source: '手工创建',
        upstreamNo: 'PO-2024-003',
        type: '包装纸箱入库',
        materials: [
            { code: 'BZ-2024-003', name: '20寸登机箱包装纸箱', plannedQty: 150, inboundQty: 0, portAisle: '1号巷道' },
            { code: 'BZ-2024-004', name: '28寸旅行箱包装纸箱', plannedQty: 90, inboundQty: 0, portAisle: '1号巷道' },
            { code: 'BZ-2024-005', name: '配件内衬纸箱', plannedQty: 60, inboundQty: 0, portAisle: '1号巷道' }
        ],
        status: '待入库',
        createTime: '2024-01-17 14:20:00',
        canEdit: true,
        canDelete: true
    },
    {
        id: 4,
        orderNo: 'RK-2024-0004',
        source: '系统自动创建',
        upstreamNo: 'WMS-IN-20240118-002',
        type: '成品抽检入库',
        materials: [
            { code: 'CP-2024-004', name: '商务箱成品D款', plannedQty: 8, inboundQty: 8, portAisle: '2号巷道' }
        ],
        status: '已完成',
        createTime: '2024-01-18 11:00:00',
        canEdit: false,
        canDelete: false
    }
];

// 系统物料数据
const systemMaterials = [
    { code: 'WL-2024-001', name: '电子元件A型', containerTypes: ['小金属框'], maxQtyPerContainer: 50 },
    { code: 'WL-2024-002', name: '机械零件B型', containerTypes: ['小金属框', '大金属框'], maxQtyPerContainer: 30 },
    { code: 'WL-2024-003', name: '塑料配件C型', containerTypes: ['塑料托盘'], maxQtyPerContainer: 100 },
    { code: 'WL-2024-004', name: '长物料钢材D型', containerTypes: ['长物料钢托盘'], maxQtyPerContainer: 20 },
    { code: 'WL-2024-005', name: '金属材料E型', containerTypes: ['大金属框'], maxQtyPerContainer: 40 }
];

// 分页配置
let currentPage = 1;
const pageSize = 10;
let filteredData = [...inboundOrdersData];
let editingOrderId = null;
let materialCounter = 0;
let detailOrderId = null;
let forceCompleteOrderId = null;
let allocatingOrderId = null;
let selectedPallets = new Set();
let customSelectedPallets = new Set();

// 模拟托盘数据
const availablePallets = [
    { 
        id: 1, 
        code: 'TP-001', 
        currentMaterials: '电子元件A型 × 30',
        locationCode: '1-3-8-1',
        availableCapacity: 20, 
        recommended: true,
        defaultMaterial: 'WL-2024-001', // 默认推荐物料：电子元件A型
        defaultQuantity: 20
    },
    { 
        id: 2, 
        code: 'TP-002', 
        currentMaterials: '空托盘',
        locationCode: '入库口1',
        availableCapacity: 50, 
        recommended: true,
        defaultMaterial: 'WL-2024-003', // 默认推荐物料：塑料配件C型
        defaultQuantity: 50
    },
    { 
        id: 3, 
        code: 'TP-003', 
        currentMaterials: '机械零件B型 × 15、塑料配件C型 × 10',
        locationCode: '2-5-10-1',
        availableCapacity: 25, 
        recommended: true,
        defaultMaterial: 'WL-2024-005', // 默认推荐物料：金属材料E型
        defaultQuantity: 25
    },
    { 
        id: 4, 
        code: 'TP-010', 
        currentMaterials: '塑料配件C型 × 20、金属材料E型 × 8',
        locationCode: '1-8-12-2',
        availableCapacity: 22, 
        recommended: false
    },
    { 
        id: 5, 
        code: 'TP-011', 
        currentMaterials: '空托盘',
        locationCode: '入库口2',
        availableCapacity: 50, 
        recommended: false
    },
    { 
        id: 6, 
        code: 'TP-012', 
        currentMaterials: '电子元件A型 × 10、机械零件B型 × 12、金属材料E型 × 5',
        locationCode: '3-2-6-1',
        availableCapacity: 23, 
        recommended: false
    }
];

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    filteredData = getVisibleInboundOrders();
    renderTable();
    initEventListeners();
});

function isInspectionInboundType(type) {
    return type === '成品抽检入库';
}

function getVisibleInboundOrders() {
    if (ENABLE_INSPECTION_INBOUND) {
        return [...inboundOrdersData];
    }
    return inboundOrdersData.filter(order => !isInspectionInboundType(order.type));
}

// 渲染表格
function renderTable() {
    const tbody = document.getElementById('inboundTableBody');
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = filteredData.slice(start, end);

    tbody.innerHTML = pageData.map(order => {
        const material = order.materials[0]; // 显示第一个物料
        return `
        <tr>
            <td>${order.orderNo}</td>
            <td>
                <span class="source-badge ${getSourceClass(order.source)}">
                    ${order.source}
                </span>
            </td>
            <td>${order.upstreamNo || '-'}</td>
            <td>${order.type}</td>
            <td>${material.code}</td>
            <td>${material.name}</td>
            <td>${material.plannedQty}</td>
            <td>${material.inboundQty}</td>
            <td>
                <span class="status-badge ${getStatusClass(order.status)}">
                    ${order.status}
                </span>
            </td>
            <td>${order.createTime}</td>
            <td>
                <div class="action-btns">
                    <button class="detail-btn" onclick="showDetail(${order.id})">详情</button>
                    ${order.canEdit ? `<button class="edit-btn" onclick="editOrder(${order.id})">编辑</button>` : ''}
                    ${order.canDelete ? `<button class="delete-btn" onclick="deleteOrder(${order.id})">删除</button>` : ''}
                    ${(order.status === '待入库' || order.status === '入库中') ? 
                        `<button class="force-btn" onclick="forceComplete(${order.id})">强制完成</button>` : ''}
                </div>
            </td>
        </tr>
    `}).join('');

    updatePagination();
}

// 获取状态样式类
function getStatusClass(status) {
    const statusMap = {
        '待入库': 'pending',
        '入库中': 'processing',
        '已完成': 'completed'
    };
    return statusMap[status] || 'pending';
}

function getSourceClass(source) {
    if (source === '客户WMS同步') {
        return 'sync';
    }
    if (source === '系统自动创建') {
        return 'system';
    }
    return 'manual';
}

// 更新分页
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / pageSize);
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages || 1;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage >= totalPages;
}

// 初始化事件监听
function initEventListeners() {
    // 查询按钮
    document.getElementById('searchBtn').addEventListener('click', searchOrders);
    
    // 重置按钮
    document.getElementById('resetBtn').addEventListener('click', resetSearch);
    
    // 新增按钮
    document.getElementById('addBtn').addEventListener('click', openAddModal);
    
    // 分页按钮
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });
    
    // 弹窗关闭按钮
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // 保存按钮
    document.getElementById('saveBtn').addEventListener('click', saveOrder);
    document.getElementById('cancelBtn').addEventListener('click', closeAllModals);
    
    // 添加物料按钮
    document.getElementById('addMaterialBtn').addEventListener('click', addMaterialItem);
    
    // 添加托盘按钮
    document.getElementById('addPalletBtn').addEventListener('click', addPalletItem);
    
    // 入库类型变化监听
    document.getElementById('orderType').addEventListener('change', handleOrderTypeChange);
    
    // 详情弹窗
    document.getElementById('detailClose').addEventListener('click', closeDetailModal);
    document.getElementById('detailCloseBtn').addEventListener('click', closeDetailModal);
    
    // 强制完成
    document.getElementById('forceClose').addEventListener('click', closeForceModal);
    document.getElementById('forceSaveBtn').addEventListener('click', saveForceComplete);
    document.getElementById('forceCancelBtn').addEventListener('click', closeForceModal);
    
    // 分配托盘
    document.getElementById('allocateClose').addEventListener('click', closeAllocateModal);
    document.getElementById('confirmAllocateBtn').addEventListener('click', confirmAllocate);
    document.getElementById('allocateCancelBtn').addEventListener('click', closeAllocateModal);
    document.getElementById('customAllocateBtn').addEventListener('click', openCustomAllocateModal);
    
    // 自定义分配
    document.getElementById('customClose').addEventListener('click', closeCustomAllocateModal);
    document.getElementById('confirmCustomBtn').addEventListener('click', confirmCustomAllocate);
    document.getElementById('customCancelBtn').addEventListener('click', closeCustomAllocateModal);
    
    // 全选托盘
    document.getElementById('selectAllPallets').addEventListener('change', function(e) {
        document.querySelectorAll('#recommendPalletBody input[type="checkbox"]').forEach(cb => {
            cb.checked = e.target.checked;
            const id = parseInt(cb.value);
            if (e.target.checked) {
                selectedPallets.add(id);
            } else {
                selectedPallets.delete(id);
            }
        });
    });
    
    document.getElementById('selectAllCustomPallets').addEventListener('change', function(e) {
        document.querySelectorAll('#customPalletBody input[type="checkbox"]').forEach(cb => {
            cb.checked = e.target.checked;
            const id = parseInt(cb.value);
            if (e.target.checked) {
                customSelectedPallets.add(id);
            } else {
                customSelectedPallets.delete(id);
            }
        });
    });
    
    // 点击弹窗外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
}

// 查询入库单
function searchOrders() {
    const orderNo = document.getElementById('searchOrderNo').value.trim().toLowerCase();
    const upstreamNo = document.getElementById('searchUpstreamNo').value.trim().toLowerCase();
    const materialCode = document.getElementById('searchMaterialCode').value.trim().toLowerCase();
    const status = document.getElementById('searchStatus').value;
    const source = document.getElementById('searchSource').value;
    const type = document.getElementById('searchType').value;
    const startDate = document.getElementById('searchStartDate').value;
    const endDate = document.getElementById('searchEndDate').value;
    
    filteredData = getVisibleInboundOrders().filter(order => {
        const matchOrderNo = !orderNo || order.orderNo.toLowerCase().includes(orderNo);
        const matchUpstreamNo = !upstreamNo || order.upstreamNo.toLowerCase().includes(upstreamNo);
        const matchMaterialCode = !materialCode || order.materials.some(m => m.code.toLowerCase().includes(materialCode));
        const matchStatus = !status || order.status === status;
        const matchSource = !source || order.source === source;
        const matchType = !type || order.type === type;
        
        let matchDate = true;
        if (startDate || endDate) {
            const orderDate = order.createTime.split(' ')[0];
            if (startDate && orderDate < startDate) matchDate = false;
            if (endDate && orderDate > endDate) matchDate = false;
        }
        
        return matchOrderNo && matchUpstreamNo && matchMaterialCode && matchStatus && 
               matchSource && matchType && matchDate;
    });
    
    currentPage = 1;
    renderTable();
}

// 重置查询
function resetSearch() {
    document.getElementById('searchOrderNo').value = '';
    document.getElementById('searchUpstreamNo').value = '';
    document.getElementById('searchMaterialCode').value = '';
    document.getElementById('searchStatus').value = '';
    document.getElementById('searchSource').value = '';
    document.getElementById('searchType').value = '';
    document.getElementById('searchStartDate').value = '';
    document.getElementById('searchEndDate').value = '';
    filteredData = getVisibleInboundOrders();
    currentPage = 1;
    renderTable();
}

// 打开新增弹窗
function openAddModal() {
    editingOrderId = null;
    materialCounter = 0;
    document.getElementById('modalTitle').textContent = '新增入库单';
    document.getElementById('inboundForm').reset();
    
    // 生成入库单号
    const orderNo = generateOrderNo();
    document.getElementById('orderNo').value = orderNo;
    
    // 清空物料列表
    document.getElementById('materialList').innerHTML = '';
    
    document.getElementById('inboundModal').classList.add('active');
}

// 生成入库单号
function generateOrderNo() {
    const now = new Date();
    const year = now.getFullYear();
    const seq = String(inboundOrdersData.length + 1).padStart(4, '0');
    return `RK-${year}-${seq}`;
}

// 添加物料项
function addMaterialItem() {
    materialCounter++;
    const materialList = document.getElementById('materialList');
    const materialItem = document.createElement('div');
    materialItem.className = 'material-item';
    materialItem.dataset.id = materialCounter;
    
    materialItem.innerHTML = `
        <div class="material-item-header">
            <span class="material-item-title">物料 ${materialCounter}</span>
            <button type="button" class="remove-material-btn" onclick="removeMaterialItem(${materialCounter})">删除</button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="required">物料编码：</label>
                <div class="autocomplete-wrapper">
                    <input type="text" class="form-input material-code-search" required placeholder="请搜索物料编码" autocomplete="off">
                    <input type="hidden" class="material-code-value">
                    <div class="autocomplete-dropdown"></div>
                </div>
            </div>
            <div class="form-group">
                <label class="required">物料名称：</label>
                <div class="autocomplete-wrapper">
                    <input type="text" class="form-input material-name-search" required placeholder="请搜索物料名称" autocomplete="off">
                    <input type="hidden" class="material-name-value">
                    <div class="autocomplete-dropdown"></div>
                </div>
            </div>
            <div class="form-group">
                <label class="required">计划入库数量：</label>
                <input type="number" class="form-input material-qty" min="1" required placeholder="请输入数量">
            </div>
        </div>
    `;
    
    materialList.appendChild(materialItem);
    
    // 初始化自动完成功能
    initMaterialAutocomplete(materialItem);
}

// 删除物料项
function removeMaterialItem(id) {
    const item = document.querySelector(`.material-item[data-id="${id}"]`);
    if (item) {
        item.remove();
    }
}

// 处理入库类型变化
function handleOrderTypeChange() {
    const orderType = document.getElementById('orderType').value;
    const materialSection = document.getElementById('materialSection');
    const materialList = document.getElementById('materialList');
    const palletSection = document.getElementById('palletSection');
    const palletList = document.getElementById('palletList');
    
    if (orderType === '空托盘入库') {
        // 隐藏物料明细，显示托盘编码
        materialSection.style.display = 'none';
        materialList.style.display = 'none';
        palletSection.style.display = 'block';
        palletList.style.display = 'block';
        
        // 清空物料列表
        materialList.innerHTML = '';
        materialCounter = 0;
        
        // 如果托盘列表为空，添加一个默认项
        if (palletList.children.length === 0) {
            addPalletItem();
        }
    } else {
        // 显示物料明细，隐藏托盘编码
        materialSection.style.display = 'block';
        materialList.style.display = 'block';
        palletSection.style.display = 'none';
        palletList.style.display = 'none';
        
        // 清空托盘列表
        palletList.innerHTML = '';
    }
}

// 添加托盘项
let palletCounter = 0;
function addPalletItem() {
    palletCounter++;
    const palletList = document.getElementById('palletList');
    const palletItem = document.createElement('div');
    palletItem.className = 'pallet-item';
    palletItem.dataset.id = palletCounter;
    
    palletItem.innerHTML = `
        <label>托盘编码：</label>
        <input type="text" class="form-input pallet-code" placeholder="请输入托盘编码，如：TP-001" required>
        <button type="button" class="remove-btn" onclick="removePalletItem(${palletCounter})">删除</button>
    `;
    
    palletList.appendChild(palletItem);
}

// 删除托盘项
function removePalletItem(id) {
    const item = document.querySelector(`.pallet-item[data-id="${id}"]`);
    if (item) {
        item.remove();
    }
}

// 初始化物料自动完成
function initMaterialAutocomplete(materialItem) {
    const codeSearch = materialItem.querySelector('.material-code-search');
    const codeValue = materialItem.querySelector('.material-code-value');
    const codeDropdown = codeSearch.nextElementSibling.nextElementSibling;
    
    const nameSearch = materialItem.querySelector('.material-name-search');
    const nameValue = materialItem.querySelector('.material-name-value');
    const nameDropdown = nameSearch.nextElementSibling.nextElementSibling;
    
    // 物料编码搜索
    codeSearch.addEventListener('input', function() {
        const searchText = this.value.toLowerCase();
        if (!searchText) {
            codeDropdown.style.display = 'none';
            return;
        }
        
        const filtered = systemMaterials.filter(m => 
            m.code.toLowerCase().includes(searchText)
        );
        
        if (filtered.length > 0) {
            codeDropdown.innerHTML = filtered.map(m => 
                `<div class="autocomplete-item" data-code="${m.code}" data-name="${m.name}">
                    ${m.code} - ${m.name}
                </div>`
            ).join('');
            codeDropdown.style.display = 'block';
            
            // 绑定点击事件
            codeDropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                item.addEventListener('click', function() {
                    const code = this.dataset.code;
                    const name = this.dataset.name;
                    
                    codeSearch.value = code;
                    codeValue.value = code;
                    nameSearch.value = name;
                    nameValue.value = name;
                    
                    codeDropdown.style.display = 'none';
                    nameDropdown.style.display = 'none';
                });
            });
        } else {
            codeDropdown.style.display = 'none';
        }
    });
    
    // 物料名称搜索
    nameSearch.addEventListener('input', function() {
        const searchText = this.value.toLowerCase();
        if (!searchText) {
            nameDropdown.style.display = 'none';
            return;
        }
        
        const filtered = systemMaterials.filter(m => 
            m.name.toLowerCase().includes(searchText)
        );
        
        if (filtered.length > 0) {
            nameDropdown.innerHTML = filtered.map(m => 
                `<div class="autocomplete-item" data-code="${m.code}" data-name="${m.name}">
                    ${m.code} - ${m.name}
                </div>`
            ).join('');
            nameDropdown.style.display = 'block';
            
            // 绑定点击事件
            nameDropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                item.addEventListener('click', function() {
                    const code = this.dataset.code;
                    const name = this.dataset.name;
                    
                    codeSearch.value = code;
                    codeValue.value = code;
                    nameSearch.value = name;
                    nameValue.value = name;
                    
                    codeDropdown.style.display = 'none';
                    nameDropdown.style.display = 'none';
                });
            });
        } else {
            nameDropdown.style.display = 'none';
        }
    });
    
    // 点击外部关闭下拉框
    document.addEventListener('click', function(e) {
        if (!codeSearch.contains(e.target) && !codeDropdown.contains(e.target)) {
            codeDropdown.style.display = 'none';
        }
        if (!nameSearch.contains(e.target) && !nameDropdown.contains(e.target)) {
            nameDropdown.style.display = 'none';
        }
    });
}

// 编辑入库单
function editOrder(id) {
    const order = inboundOrdersData.find(o => o.id === id);
    if (!order) return;
    
    editingOrderId = id;
    materialCounter = 0;
    document.getElementById('modalTitle').textContent = '编辑入库单';
    document.getElementById('orderNo').value = order.orderNo;
    document.getElementById('orderType').value = order.type;
    document.getElementById('upstreamNo').value = order.upstreamNo || '';
    document.getElementById('orderRemark').value = order.remark || '';
    
    // 加载物料列表
    document.getElementById('materialList').innerHTML = '';
    order.materials.forEach(material => {
        addMaterialItem();
        const items = document.querySelectorAll('.material-item');
        const lastItem = items[items.length - 1];
        lastItem.querySelector('.material-code-search').value = material.code;
        lastItem.querySelector('.material-code-value').value = material.code;
        lastItem.querySelector('.material-name-search').value = material.name;
        lastItem.querySelector('.material-name-value').value = material.name;
        lastItem.querySelector('.material-qty').value = material.plannedQty;
    });
    
    document.getElementById('inboundModal').classList.add('active');
}

// 保存入库单
function saveOrder() {
    const orderNo = document.getElementById('orderNo').value.trim();
    const orderType = document.getElementById('orderType').value;
    const upstreamNo = document.getElementById('upstreamNo').value.trim();
    const orderRemark = document.getElementById('orderRemark').value.trim();
    
    if (!orderNo || !orderType) {
        alert('请填写所有必填项！');
        return;
    }
    
    let materials = [];
    
    // 判断是否为空托盘入库
    if (orderType === '空托盘入库') {
        // 获取托盘编码
        const palletItems = document.querySelectorAll('.pallet-item');
        if (palletItems.length === 0) {
            alert('请至少添加一个托盘编码！');
            return;
        }
        
        const palletCodes = [];
        for (let item of palletItems) {
            const code = item.querySelector('.pallet-code').value.trim();
            
            if (!code) {
                alert('请填写所有托盘编码！');
                return;
            }
            
            palletCodes.push(code);
        }
        
        // 空托盘入库不需要物料明细，使用空数组
        materials = [];
        
        // 将托盘编码信息保存到备注中（或者可以添加新字段）
        const palletInfo = `托盘编码：${palletCodes.join('、')}`;
        const finalRemark = orderRemark ? `${orderRemark}；${palletInfo}` : palletInfo;
        
        if (editingOrderId) {
            // 编辑
            const order = inboundOrdersData.find(o => o.id === editingOrderId);
            if (order) {
                order.type = orderType;
                order.upstreamNo = upstreamNo;
                order.remark = finalRemark;
                order.materials = materials;
                order.palletCodes = palletCodes; // 保存托盘编码
            }
            alert('空托盘入库单已更新！');
        } else {
            // 新增
            const now = new Date();
            const createTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
            
            const newOrder = {
                id: inboundOrdersData.length + 1,
                orderNo,
                source: '手工创建',
                upstreamNo,
                type: orderType,
                materials,
                status: '待入库',
                createTime,
                remark: finalRemark,
                palletCodes: palletCodes, // 保存托盘编码
                canEdit: true,
                canDelete: true
            };
            inboundOrdersData.push(newOrder);
            alert('空托盘入库单添加成功！');
        }
    } else {
        // 普通入库单，需要物料明细
        const materialItems = document.querySelectorAll('.material-item');
        if (materialItems.length === 0) {
            alert('请至少添加一条物料明细！');
            return;
        }
        
        for (let item of materialItems) {
            const code = item.querySelector('.material-code-value').value.trim();
            const name = item.querySelector('.material-name-value').value.trim();
            const qty = parseInt(item.querySelector('.material-qty').value);
            
            if (!code || !name || !qty) {
                alert('请填写所有物料明细的必填项！');
                return;
            }
            
            materials.push({
                code,
                name,
                plannedQty: qty,
                inboundQty: 0
            });
        }
        
        if (editingOrderId) {
            // 编辑
            const order = inboundOrdersData.find(o => o.id === editingOrderId);
            if (order) {
                order.type = orderType;
                order.upstreamNo = upstreamNo;
                order.remark = orderRemark;
                order.materials = materials;
            }
            alert('入库单已更新！');
        } else {
            // 新增
            const now = new Date();
            const createTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
            
            const newOrder = {
                id: inboundOrdersData.length + 1,
                orderNo,
                source: '手工创建',
                upstreamNo,
                type: orderType,
                materials,
                status: '待入库',
                createTime,
                remark: orderRemark,
                canEdit: true,
                canDelete: true
            };
            inboundOrdersData.push(newOrder);
            alert('入库单添加成功！');
        }
    }
    
    closeAllModals();
    searchOrders();
}

// 删除入库单
function deleteOrder(id) {
    const order = inboundOrdersData.find(o => o.id === id);
    if (!order) return;
    
    if (!order.canDelete) {
        alert('该入库单不可删除！');
        return;
    }
    
    if (confirm(`确定要删除入库单"${order.orderNo}"吗？`)) {
        inboundOrdersData = inboundOrdersData.filter(o => o.id !== id);
        alert('入库单已删除！');
        searchOrders();
    }
}

// 显示详情
function showDetail(id) {
    detailOrderId = id;
    const order = inboundOrdersData.find(o => o.id === id);
    if (!order) return;
    const isInspectionInbound = order.type === '成品抽检入库';
    
    // 基本信息
    document.getElementById('detailOrderNo').textContent = order.orderNo;
    document.getElementById('detailSource').textContent = order.source;
    document.getElementById('detailType').textContent = order.type;
    document.getElementById('detailStatus').innerHTML = `<span class="status-badge ${getStatusClass(order.status)}">${order.status}</span>`;
    
    // 物料信息
    const materialBody = document.getElementById('detailMaterialBody');
    materialBody.innerHTML = order.materials.map(m => `
        <tr>
            <td>${m.code}</td>
            <td>${m.name}</td>
            <td>${m.plannedQty}</td>
            <td>${m.inboundQty}</td>
        </tr>
    `).join('');
    
    // 组盘记录（模拟数据）
    const palletBody = document.getElementById('detailPalletBody');
    const palletRecords = [];

    if (isInspectionInbound && order.materials.length > 0) {
        const material = order.materials[0];
        palletRecords.push({
            containerCode: `TP-CJ-${String(order.id).padStart(3, '0')}`,
            statusText: '已入库',
            statusClass: 'completed',
            materialCode: material.code,
            materialName: material.name,
            actualQty: material.plannedQty
        });
    } else if (order.status === '已完成') {
        order.materials.forEach((material, index) => {
            const actualQty = Number(material.inboundQty || material.plannedQty || 0);
            if (actualQty <= 0) return;

            palletRecords.push({
                containerCode: `TP-${String(order.id).padStart(3, '0')}-${String(index + 1).padStart(2, '0')}`,
                statusText: '已入库',
                statusClass: 'completed',
                materialCode: material.code,
                materialName: material.name,
                actualQty
            });
        });
    } else if (order.status === '入库中') {
        order.materials.forEach((material, index) => {
            const actualQty = Number(material.inboundQty || 0);
            if (actualQty <= 0) return;

            palletRecords.push({
                containerCode: `TP-${String(order.id).padStart(3, '0')}-${String(index + 1).padStart(2, '0')}`,
                statusText: '入库中',
                statusClass: 'processing',
                materialCode: material.code,
                materialName: material.name,
                actualQty
            });
        });
    }

    palletBody.innerHTML = palletRecords.length > 0
        ? palletRecords.map(record => `
            <tr>
                <td>${record.containerCode}</td>
                <td><span class="status-badge ${record.statusClass}">${record.statusText}</span></td>
                <td>${record.materialCode}</td>
                <td>${record.materialName}</td>
                <td>${record.actualQty}</td>
            </tr>
        `).join('')
        : `
            <tr>
                <td colspan="5">暂无组盘记录</td>
            </tr>
        `;
    
    // 入库任务（模拟数据）
    const taskBody = document.getElementById('detailTaskBody');
    taskBody.innerHTML = palletRecords.length > 0
        ? palletRecords.map((record, index) => {
            const inboundPort = order.materials[0]?.portAisle === '2号巷道' ? '2号入库口' : '1号入库口';
            const taskType = isInspectionInbound ? '成品抽检入库' : '普通入库';
            const pickupPort = isInspectionInbound ? '检验室1' : inboundPort;
            const startTime = order.status === '待入库' ? '-' : order.createTime;
            const endTime = record.statusText === '已入库' ? order.createTime : '-';

            return `
            <tr>
                <td>TASK-${order.orderNo}-${String(index + 1).padStart(3, '0')}</td>
                <td>${order.orderNo}</td>
                <td><span class="command-badge inbound">入库</span></td>
                <td><span class="task-type-badge">${taskType}</span></td>
                <td>${record.containerCode}</td>
                <td>${record.materialCode} - ${record.materialName} × ${record.actualQty}</td>
                <td>-</td>
                <td>${order.materials[0]?.portAisle === '2号巷道' ? '2-5-10-1' : '1-5-12-1'}</td>
                <td>${pickupPort}</td>
                <td>-</td>
                <td><span class="status-badge ${record.statusClass}">${record.statusText}</span></td>
                <td>${order.createTime}</td>
                <td>${startTime}</td>
                <td>${endTime}</td>
            </tr>
        `;
        }).join('')
        : `
            <tr>
                <td colspan="14">暂无入库任务</td>
            </tr>
        `;
    
    document.getElementById('detailModal').classList.add('active');
}

// 强制完成
function forceComplete(id) {
    forceCompleteOrderId = id;
    document.getElementById('forceReason').value = '';
    document.getElementById('forceCompleteModal').classList.add('active');
}

// 保存强制完成
function saveForceComplete() {
    const reason = document.getElementById('forceReason').value.trim();
    
    if (!reason) {
        alert('请填写完成原因！');
        return;
    }
    
    const order = inboundOrdersData.find(o => o.id === forceCompleteOrderId);
    if (order) {
        order.status = '已完成';
        order.canEdit = false;
        order.canDelete = false;
        order.forceCompleteReason = reason;
        alert('入库单已强制完成！');
        closeForceModal();
        renderTable();
    }
}

// 关闭详情弹窗
function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
    detailOrderId = null;
}

// 关闭强制完成弹窗
function closeForceModal() {
    document.getElementById('forceCompleteModal').classList.remove('active');
    forceCompleteOrderId = null;
}

// 关闭所有弹窗
function closeAllModals() {
    document.getElementById('inboundModal').classList.remove('active');
    document.getElementById('detailModal').classList.remove('active');
    document.getElementById('forceCompleteModal').classList.remove('active');
    document.getElementById('allocatePalletModal').classList.remove('active');
    document.getElementById('customAllocateModal').classList.remove('active');
    editingOrderId = null;
    detailOrderId = null;
    forceCompleteOrderId = null;
    allocatingOrderId = null;
    selectedPallets.clear();
    customSelectedPallets.clear();
}

// 分配托盘
function allocatePallet(id) {
    allocatingOrderId = id;rderId = id;
    const order = inboundOrdersData.find(o => o.id === id);
    if (!order) return;
    
    selectedPallets.clear();
    
    // 填充入库单信息
    document.getElementById('allocateOrderNo').textContent = order.orderNo;
    
    // 自动选择入库口（如果所有物料属于同一个巷道）
    const aisles = [...new Set(order.materials.map(m => m.portAisle))];
    let defaultPort = '';
    if (aisles.length === 1) {
        // 所有物料属于同一巷道，自动选择对应入库口
        defaultPort = aisles[0] === '1号巷道' ? '1号入库口' : '2号入库口';
    }
    document.getElementById('allocatePort').value = defaultPort;
    
    // 渲染物料明细
    const materialBody = document.getElementById('allocateMaterialBody');
    materialBody.innerHTML = order.materials.map(m => `
        <tr>
            <td>${m.code}</td>
            <td>${m.name}</td>
            <td>${m.plannedQty}</td>
            <td>${m.inboundQty || 0}</td>
            <td>${m.plannedQty - (m.inboundQty || 0)}</td>
        </tr>
    `).join('');
    
    // 渲染推荐托盘列表
    renderRecommendPallets();
    
    document.getElementById('allocatePalletModal').classList.add('active');
}

// 渲染推荐托盘列表
function renderRecommendPallets() {
    const tbody = document.getElementById('recommendPalletBody');
    const order = inboundOrdersData.find(o => o.id === allocatingOrderId);
    if (!order) return;
    
    const selectedPort = document.getElementById('allocatePort').value;
    const recommendedPallets = availablePallets.filter(p => p.recommended);
    
    // 获取当前入库口对应的物料（根据巷道筛选）
    let availableMaterials = order.materials;
    if (selectedPort) {
        // 这里简化处理，实际应该根据入库口和巷道的映射关系筛选
        // 假设1号入库口对应1号巷道，2号入库口对应2号巷道
        const portAisle = selectedPort === '1号入库口' ? '1号巷道' : '2号巷道';
        availableMaterials = order.materials.filter(m => m.portAisle === portAisle);
    }
    
    tbody.innerHTML = recommendedPallets.map(pallet => {
        // 如果托盘有默认推荐物料且未设置allocateData，则使用默认值
        let palletData = pallet.allocateData;
        if (!palletData && pallet.defaultMaterial) {
            // 检查默认物料是否在可用物料列表中
            const materialAvailable = availableMaterials.some(m => m.code === pallet.defaultMaterial);
            if (materialAvailable) {
                palletData = { 
                    materialCode: pallet.defaultMaterial, 
                    quantity: pallet.defaultQuantity || pallet.availableCapacity 
                };
            } else {
                palletData = { materialCode: '', quantity: pallet.availableCapacity };
            }
        } else if (!palletData) {
            palletData = { materialCode: '', quantity: pallet.availableCapacity };
        }
        
        return `
        <tr>
            <td><input type="checkbox" class="pallet-checkbox" value="${pallet.id}" ${selectedPallets.has(pallet.id) ? 'checked' : ''}></td>
            <td>${pallet.code}</td>
            <td>${pallet.currentMaterials}</td>
            <td>${pallet.locationCode || '-'}</td>
            <td>
                <select class="form-input pallet-material-select" data-pallet-id="${pallet.id}" ${!selectedPort ? 'disabled' : ''}>
                    <option value="">请选择物料</option>
                    ${availableMaterials.map(m => {
                        const remaining = m.plannedQty - (m.inboundQty || 0);
                        return `<option value="${m.code}" ${palletData.materialCode === m.code ? 'selected' : ''}>
                            ${m.code} - ${m.name} (待入库: ${remaining})
                        </option>`;
                    }).join('')}
                </select>
            </td>
            <td>
                <input type="number" class="form-input pallet-qty-input" data-pallet-id="${pallet.id}" 
                    value="${palletData.quantity}" min="1" placeholder="数量" ${!selectedPort ? 'disabled' : ''}>
            </td>
        </tr>
    `}).join('');
    
    // 绑定复选框事件
    tbody.querySelectorAll('.pallet-checkbox').forEach(cb => {
        cb.addEventListener('change', function() {
            const id = parseInt(this.value);
            if (this.checked) {
                selectedPallets.add(id);
            } else {
                selectedPallets.delete(id);
            }
            updateSelectAllPallets();
        });
    });
    
    // 绑定物料选择事件
    tbody.querySelectorAll('.pallet-material-select').forEach(select => {
        select.addEventListener('change', function() {
            const palletId = parseInt(this.dataset.palletId);
            const pallet = availablePallets.find(p => p.id === palletId);
            if (pallet) {
                if (!pallet.allocateData) pallet.allocateData = {};
                pallet.allocateData.materialCode = this.value;
                
                // 验证数量
                const qtyInput = tbody.querySelector(`.pallet-qty-input[data-pallet-id="${palletId}"]`);
                validateQuantity(qtyInput, this.value);
            }
        });
    });
    
    // 绑定数量输入事件
    tbody.querySelectorAll('.pallet-qty-input').forEach(input => {
        input.addEventListener('input', function() {
            const palletId = parseInt(this.dataset.palletId);
            const pallet = availablePallets.find(p => p.id === palletId);
            if (pallet) {
                if (!pallet.allocateData) pallet.allocateData = {};
                pallet.allocateData.quantity = parseInt(this.value) || 0;
                
                // 获取选中的物料
                const materialSelect = tbody.querySelector(`.pallet-material-select[data-pallet-id="${palletId}"]`);
                validateQuantity(this, materialSelect.value);
            }
        });
    });
}

// 验证数量
function validateQuantity(input, materialCode) {
    if (!materialCode) return;
    
    const order = inboundOrdersData.find(o => o.id === allocatingOrderId);
    if (!order) return;
    
    const material = order.materials.find(m => m.code === materialCode);
    if (!material) return;
    
    const remaining = material.plannedQty - (material.inboundQty || 0);
    const qty = parseInt(input.value) || 0;
    
    if (qty > remaining) {
        input.value = remaining;
        alert(`数量不能超过待入库数量 ${remaining}`);
    }
}

// 监听入库口变化
document.getElementById('allocatePort').addEventListener('change', function() {
    renderRecommendPallets();
});

// 更新全选状态
function updateSelectAllPallets() {
    const checkboxes = document.querySelectorAll('#recommendPalletBody .pallet-checkbox');
    const checkedCount = document.querySelectorAll('#recommendPalletBody .pallet-checkbox:checked').length;
    const selectAll = document.getElementById('selectAllPallets');
    
    selectAll.checked = checkboxes.length > 0 && checkedCount === checkboxes.length;
    selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
}

// 打开自定义分配弹窗
function openCustomAllocateModal() {
    customSelectedPallets.clear();
    
    const tbody = document.getElementById('customPalletBody');
    const customPallets = availablePallets.filter(p => !p.recommended);
    
    tbody.innerHTML = customPallets.map(pallet => `
        <tr>
            <td><input type="checkbox" class="custom-pallet-checkbox" value="${pallet.id}"></td>
            <td>${pallet.code}</td>
            <td>${pallet.currentMaterials}</td>
            <td>${pallet.locationCode || '-'}</td>
            <td>${pallet.availableCapacity}</td>
        </tr>
    `).join('');
    
    // 绑定复选框事件
    tbody.querySelectorAll('.custom-pallet-checkbox').forEach(cb => {
        cb.addEventListener('change', function() {
            const id = parseInt(this.value);
            if (this.checked) {
                customSelectedPallets.add(id);
            } else {
                customSelectedPallets.delete(id);
            }
        });
    });
    
    document.getElementById('customAllocateModal').classList.add('active');
}

// 确认自定义分配
function confirmCustomAllocate() {
    if (customSelectedPallets.size === 0) {
        alert('请至少选择一个托盘！');
        return;
    }
    
    // 将自定义选择的托盘添加到推荐列表
    customSelectedPallets.forEach(id => {
        const pallet = availablePallets.find(p => p.id === id);
        if (pallet) {
            pallet.recommended = true;
            selectedPallets.add(id);
        }
    });
    
    renderRecommendPallets();
    closeCustomAllocateModal();
}

// 确认分配托盘
function confirmAllocate() {
    const port = document.getElementById('allocatePort').value;
    
    if (!port) {
        alert('请选择入库口！');
        return;
    }
    
    const order = inboundOrdersData.find(o => o.id === allocatingOrderId);
    if (!order) return;
    
    // 从推荐托盘列表中收集所有有效的分配数据（不管是否勾选）
    const allocations = [];
    const tbody = document.getElementById('recommendPalletBody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const materialSelect = row.querySelector('.pallet-material-select');
        const qtyInput = row.querySelector('.pallet-qty-input');
        
        if (materialSelect && qtyInput) {
            const materialCode = materialSelect.value;
            const quantity = parseInt(qtyInput.value) || 0;
            
            // 如果物料和数量都不为空，则添加到分配列表
            if (materialCode && quantity > 0) {
                const palletId = parseInt(materialSelect.dataset.palletId);
                allocations.push({
                    palletId: palletId,
                    materialCode: materialCode,
                    quantity: quantity
                });
            }
        }
    });
    
    // 验证是否有有效的分配数据
    if (allocations.length === 0) {
        alert('请至少为一个托盘选择物料并填写数量！');
        return;
    }
    
    // 更新各物料的入库数量
    allocations.forEach(alloc => {
        const material = order.materials.find(m => m.code === alloc.materialCode);
        if (material) {
            material.inboundQty = (material.inboundQty || 0) + alloc.quantity;
        }
    });
    
    // 第一次分配后，状态变为入库中
    if (order.status === '待入库') {
        order.status = '入库中';
    }
    
    // 检查是否所有物料都已完成入库
    const allCompleted = order.materials.every(m => m.inboundQty >= m.plannedQty);
    if (allCompleted) {
        order.status = '已完成';
        order.canEdit = false;
        order.canDelete = false;
    }
    
    const totalQty = allocations.reduce((sum, alloc) => sum + alloc.quantity, 0);
    
    alert(`托盘分配成功！\n\n已分配托盘数：${allocations.length}\n本次分配数量：${totalQty}`);
    
    // 清除托盘的分配数据
    allocations.forEach(alloc => {
        const pallet = availablePallets.find(p => p.id === alloc.palletId);
        if (pallet) {
            delete pallet.allocateData;
        }
    });
    
    closeAllocateModal();
    renderTable();
}

// 关闭分配托盘弹窗
function closeAllocateModal() {
    document.getElementById('allocatePalletModal').classList.remove('active');
    allocatingOrderId = null;
    selectedPallets.clear();
}

// 关闭自定义分配弹窗
function closeCustomAllocateModal() {
    document.getElementById('customAllocateModal').classList.remove('active');
    customSelectedPallets.clear();
}
