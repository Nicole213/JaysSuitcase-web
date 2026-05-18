// 出库单管理页面脚本

const ENABLE_INSPECTION_OUTBOUND = false;

// 模拟数据
let outboundOrdersData = [
    {
        id: 1,
        orderNo: 'CK-2024-0001',
        source: '客户WMS同步',
        upstreamNo: 'WMS-OUT-20240115-001',
        type: '模具出库',
        outboundPort: '模具出库口',
        hasAllocatedForOutbound: true,
        materials: [
            { code: 'MJ-2024-001', name: '注塑模具A型', plannedQty: 80, outboundQty: 80, allocatedQty: 80 }
        ],
        status: '已完成',
        createTime: '2024-01-15 10:30:00',
        canEdit: false,
        canDelete: false
    },
    {
        id: 2,
        orderNo: 'CK-2024-0002',
        source: '手工创建',
        upstreamNo: '',
        type: '模具出库',
        outboundPort: '模具出库口',
        hasAllocatedForOutbound: true,
        materials: [
            { code: 'MJ-2024-002', name: '五金模具B型', plannedQty: 40, outboundQty: 20, allocatedQty: 40 }
        ],
        status: '出库中',
        createTime: '2024-01-16 11:15:00',
        canEdit: false,
        canDelete: false
    },
    {
        id: 3,
        orderNo: 'CK-2024-0003',
        source: '手工创建',
        upstreamNo: 'SO-2024-003',
        type: '模具出库',
        outboundPort: '',
        hasAllocatedForOutbound: false,
        materials: [
            { code: 'MJ-2024-003', name: '箱包模具C型', plannedQty: 60, outboundQty: 0, allocatedQty: 0 }
        ],
        status: '待出库',
        createTime: '2024-01-17 15:20:00',
        canEdit: true,
        canDelete: true
    },
    {
        id: 4,
        orderNo: 'CK-2024-0004',
        source: '手工创建',
        upstreamNo: '',
        type: '成品抽检出库',
        materials: [
            { code: 'CP-2024-003', name: '旅行箱成品C款', plannedQty: '6（托）', outboundQty: '0（托）', allocatedQty: '0（托）' }
        ],
        outboundPort: '',
        hasAllocatedForOutbound: false,
        mesWorkOrderNo: 'MES-MO-20240518-003',
        mesTotalPallets: 18,
        mesMaterialCode: 'CP-2024-003',
        mesMaterialName: '旅行箱成品C款',
        inspectionPalletCount: 6,
        inspectionRoom: '检验室2',
        status: '待出库',
        createTime: '2024-01-18 09:45:00',
        remark: '成品批次抽检',
        canEdit: true,
        canDelete: true
    },
    {
        id: 5,
        orderNo: 'CK-2024-0005',
        source: '手工创建',
        upstreamNo: '',
        type: '模具出库',
        outboundPort: '模具出库口',
        hasAllocatedForOutbound: true,
        materials: [
            { code: 'MJ-2024-004', name: '拉杆模具D型', plannedQty: 24, outboundQty: 0, allocatedQty: 24 }
        ],
        status: '待出库',
        createTime: '2024-01-18 10:30:00',
        canEdit: true,
        canDelete: true
    },
    {
        id: 6,
        orderNo: 'CK-2024-0006',
        source: '手工创建',
        upstreamNo: '',
        type: '成品抽检出库',
        materials: [
            { code: 'CP-2024-004', name: '商务箱成品D款', plannedQty: '4（托）', outboundQty: '0（托）', allocatedQty: '0（托）' }
        ],
        outboundPort: '',
        hasAllocatedForOutbound: false,
        mesWorkOrderNo: 'MES-MO-20240519-001',
        mesTotalPallets: 30,
        mesMaterialCode: 'CP-2024-004',
        mesMaterialName: '商务箱成品D款',
        inspectionPalletCount: 4,
        inspectionRoom: '',
        status: '待出库',
        createTime: '2024-01-18 11:00:00',
        remark: '待抽检分配出库',
        canEdit: true,
        canDelete: true
    }
];

// 系统物料数据（包含库存数量）
const systemMaterials = [
    { code: 'WL-2024-001', name: '电子元件A型', stockQty: 150 },
    { code: 'WL-2024-002', name: '机械零件B型', stockQty: 80 },
    { code: 'WL-2024-003', name: '塑料配件C型', stockQty: 200 },
    { code: 'WL-2024-004', name: '长物料钢材D型', stockQty: 45 },
    { code: 'WL-2024-005', name: '金属材料E型', stockQty: 120 }
];

// 分页配置
let currentPage = 1;
const pageSize = 10;
let filteredData = [...outboundOrdersData];
let editingOrderId = null;
let materialCounter = 0;
let detailOrderId = null;
let forceCompleteOrderId = null;
let manualAllocatingOrderId = null;
let autoAllocatingOrderId = null;
let currentAllocatingMaterial = null;
let allocationResults = [];
let selectedLocations = new Set();
let selectedOrders = new Set();
let batchAllocatingOrders = [];
let batchSelectedMaterials = [];
let batchAllocatingPort = '';
let batchAllocationResults = [];

// 模拟库位数据（包含物料库存）
const locationInventory = [
    { locationCode: '1-1-5-1', containerCode: 'TP-001', materialCode: 'WL-2024-001', availableQty: 30, row: 1, col: 1, level: 5, depth: 1 },
    { locationCode: '1-2-5-1', containerCode: 'TP-002', materialCode: 'WL-2024-001', availableQty: 25, row: 1, col: 2, level: 5, depth: 1 },
    { locationCode: '1-3-8-1', containerCode: 'TP-003', materialCode: 'WL-2024-002', availableQty: 20, row: 1, col: 3, level: 8, depth: 1 },
    { locationCode: '2-1-6-1', containerCode: 'TP-004', materialCode: 'WL-2024-002', availableQty: 15, row: 2, col: 1, level: 6, depth: 1 },
    { locationCode: '2-5-10-1', containerCode: 'TP-005', materialCode: 'WL-2024-003', availableQty: 50, row: 2, col: 5, level: 10, depth: 1 },
    { locationCode: '3-2-7-1', containerCode: 'TP-006', materialCode: 'WL-2024-003', availableQty: 40, row: 3, col: 2, level: 7, depth: 1 },
    { locationCode: '1-8-12-2', containerCode: 'TP-007', materialCode: 'WL-2024-001', availableQty: 20, row: 1, col: 8, level: 12, depth: 2 },
    { locationCode: '2-4-9-1', containerCode: 'TP-008', materialCode: 'WL-2024-002', availableQty: 18, row: 2, col: 4, level: 9, depth: 1 },
    { locationCode: '4-1-3-1', containerCode: 'TP-009', materialCode: 'MJ-2024-003', availableQty: 30, row: 4, col: 1, level: 3, depth: 1 },
    { locationCode: '4-2-3-1', containerCode: 'TP-010', materialCode: 'MJ-2024-003', availableQty: 30, row: 4, col: 2, level: 3, depth: 1 },
    { locationCode: '4-3-4-1', containerCode: 'TP-011', materialCode: 'MJ-2024-004', availableQty: 24, row: 4, col: 3, level: 4, depth: 1 }
];

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    filteredData = getVisibleOutboundOrders();
    renderTable();
    initEventListeners();
});

function getVisibleOutboundOrders() {
    if (ENABLE_INSPECTION_OUTBOUND) {
        return [...outboundOrdersData];
    }
    return outboundOrdersData.filter(order => !isInspectionOutboundType(order.type));
}

// 渲染表格
function renderTable() {
    const tbody = document.getElementById('outboundTableBody');
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = filteredData.slice(start, end);

    tbody.innerHTML = pageData.map(order => {
        const material = getPrimaryDisplayMaterial(order);
        const canAllocate = order.status === '待出库' && !order.hasAllocatedForOutbound;
        const canEdit = order.canEdit && !order.hasAllocatedForOutbound;
        const canDelete = order.canDelete && !order.hasAllocatedForOutbound;
        
        return `
        <tr>
            <td>${order.orderNo}</td>
            <td>
                <span class="source-badge ${order.source === '客户WMS同步' ? 'sync' : 'manual'}">
                    ${order.source}
                </span>
            </td>
            <td>${order.upstreamNo || '-'}</td>
            <td>${order.type}</td>
            <td>${material.code}</td>
            <td>${material.name}</td>
            <td>${material.plannedQty}</td>
            <td>${material.outboundQty}</td>
            <td>
                <span class="status-badge ${getStatusClass(order.status)}">
                    ${order.status}
                </span>
            </td>
            <td>${order.createTime}</td>
            <td>
                <div class="action-btns">
                    ${canAllocate ? `<button class="detail-btn" onclick="openAutoAllocate(${order.id})">分配出库</button>` : ''}
                    <button class="detail-btn" onclick="showDetail(${order.id})">详情</button>
                    ${canEdit ? `<button class="edit-btn" onclick="editOrder(${order.id})">编辑</button>` : ''}
                    ${canDelete ? `<button class="delete-btn" onclick="deleteOrder(${order.id})">删除</button>` : ''}
                    ${(order.status === '待出库' || order.status === '出库中') ? 
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
        '待出库': 'pending',
        '出库中': 'processing',
        '已完成': 'completed'
    };
    return statusMap[status] || 'pending';
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
    document.getElementById('searchBtn').addEventListener('click', searchOrders);
    document.getElementById('resetBtn').addEventListener('click', resetSearch);
    document.getElementById('addBtn').addEventListener('click', openAddModal);
    document.getElementById('orderType').addEventListener('change', handleOrderTypeChange);
    
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
    
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    document.getElementById('saveBtn').addEventListener('click', saveOrder);
    document.getElementById('cancelBtn').addEventListener('click', closeAllModals);
    document.getElementById('addMaterialBtn').addEventListener('click', addMaterialItem);
    document.getElementById('detailClose').addEventListener('click', closeDetailModal);
    document.getElementById('detailCloseBtn').addEventListener('click', closeDetailModal);
    document.getElementById('forceClose').addEventListener('click', closeForceModal);
    document.getElementById('forceSaveBtn').addEventListener('click', saveForceComplete);
    document.getElementById('forceCancelBtn').addEventListener('click', closeForceModal);
    
    // 手工分配
    document.getElementById('manualAllocateClose').addEventListener('click', closeManualAllocateModal);
    document.getElementById('confirmManualAllocateBtn').addEventListener('click', confirmManualAllocate);
    document.getElementById('manualAllocateCancelBtn').addEventListener('click', closeManualAllocateModal);
    document.getElementById('manualAllocatePort').addEventListener('change', renderManualDemand);
    
    // 库位分配
    document.getElementById('locationAllocateClose').addEventListener('click', closeLocationAllocateModal);
    document.getElementById('confirmLocationAllocateBtn').addEventListener('click', confirmLocationAllocate);
    document.getElementById('locationAllocateCancelBtn').addEventListener('click', closeLocationAllocateModal);
    document.getElementById('searchLocationBtn').addEventListener('click', searchLocations);
    document.getElementById('resetLocationBtn').addEventListener('click', resetLocationSearch);
    document.getElementById('selectAllLocations').addEventListener('change', toggleSelectAllLocations);
    
    // 合并订单确认
    document.getElementById('mergeOrderClose').addEventListener('click', closeMergeOrderModal);
    document.getElementById('confirmMergeOrderBtn').addEventListener('click', confirmMergeOrder);
    document.getElementById('mergeOrderCancelBtn').addEventListener('click', closeMergeOrderModal);
    document.getElementById('mergeOrderPort').addEventListener('change', renderMergeOrderMaterials);
    document.getElementById('selectAllMergeMaterials').addEventListener('change', toggleSelectAllMergeMaterials);
    
    // 批量分配
    document.getElementById('batchAllocateClose').addEventListener('click', closeBatchAllocateModal);
    document.getElementById('confirmBatchAllocateBtn').addEventListener('click', confirmBatchAllocate);
    document.getElementById('batchAllocateCancelBtn').addEventListener('click', closeBatchAllocateModal);
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
}

// 查询出库单
function searchOrders() {
    const orderNo = document.getElementById('searchOrderNo').value.trim().toLowerCase();
    const upstreamNo = document.getElementById('searchUpstreamNo').value.trim().toLowerCase();
    const materialCode = document.getElementById('searchMaterialCode').value.trim().toLowerCase();
    const status = document.getElementById('searchStatus').value;
    const source = document.getElementById('searchSource').value;
    const type = document.getElementById('searchType').value;
    const startDate = document.getElementById('searchStartDate').value;
    const endDate = document.getElementById('searchEndDate').value;
    
    filteredData = getVisibleOutboundOrders().filter(order => {
        const matchOrderNo = !orderNo || order.orderNo.toLowerCase().includes(orderNo);
        const matchUpstreamNo = !upstreamNo || order.upstreamNo.toLowerCase().includes(upstreamNo);
        const matchMaterialCode = !materialCode || (
            order.materials && order.materials.some(m => m.code.toLowerCase().includes(materialCode))
        );
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
    filteredData = getVisibleOutboundOrders();
    currentPage = 1;
    renderTable();
}

// 打开新增弹窗
function openAddModal() {
    editingOrderId = null;
    materialCounter = 0;
    document.getElementById('modalTitle').textContent = '新增出库单';
    document.getElementById('outboundForm').reset();
    
    const orderNo = generateOrderNo();
    document.getElementById('orderNo').value = orderNo;
    document.getElementById('materialList').innerHTML = '';
    updateOrderFormByType('');
    
    document.getElementById('outboundModal').classList.add('active');
}

// 生成出库单号
function generateOrderNo() {
    const now = new Date();
    const year = now.getFullYear();
    const seq = String(outboundOrdersData.length + 1).padStart(4, '0');
    return `CK-${year}-${seq}`;
}

function isInspectionOutboundType(type) {
    return type === '成品抽检出库';
}

function formatPalletCount(value) {
    const numericValue = Number(value || 0);
    return `${numericValue}（托）`;
}

function getPrimaryDisplayMaterial(order) {
    if (order.materials && order.materials.length > 0) {
        return order.materials[0];
    }

    if (isInspectionOutboundType(order.type)) {
        return {
            code: order.mesMaterialCode || '-',
            name: order.mesMaterialName || '-',
            plannedQty: formatPalletCount(order.inspectionPalletCount),
            outboundQty: formatPalletCount(order.outboundPalletCount),
            allocatedQty: formatPalletCount(order.allocatedPalletCount)
        };
    }

    return {
        code: '-',
        name: '-',
        plannedQty: 0,
        outboundQty: 0,
        allocatedQty: 0
    };
}

function handleOrderTypeChange() {
    updateOrderFormByType(document.getElementById('orderType').value);
}

function updateOrderFormByType() {
    document.getElementById('materialSection').classList.remove('hidden');
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
                <label>当前库存数量：</label>
                <input type="text" class="form-input material-stock-qty" readonly placeholder="-" style="background: #f5f5f5;">
            </div>
            <div class="form-group">
                <label class="required">计划出库数量：</label>
                <input type="number" class="form-input material-qty" min="1" required placeholder="请输入数量">
            </div>
        </div>
    `;
    
    materialList.appendChild(materialItem);
    initMaterialAutocomplete(materialItem);
}

// 删除物料项
function removeMaterialItem(id) {
    const item = document.querySelector(`.material-item[data-id="${id}"]`);
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
    
    const stockQtyInput = materialItem.querySelector('.material-stock-qty');
    
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
                `<div class="autocomplete-item" data-code="${m.code}" data-name="${m.name}" data-stock="${m.stockQty}">
                    ${m.code} - ${m.name}
                </div>`
            ).join('');
            codeDropdown.style.display = 'block';
            
            codeDropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                item.addEventListener('click', function() {
                    const code = this.dataset.code;
                    const name = this.dataset.name;
                    const stock = this.dataset.stock;
                    
                    codeSearch.value = code;
                    codeValue.value = code;
                    nameSearch.value = name;
                    nameValue.value = name;
                    stockQtyInput.value = stock;
                    
                    codeDropdown.style.display = 'none';
                    nameDropdown.style.display = 'none';
                });
            });
        } else {
            codeDropdown.style.display = 'none';
        }
    });
    
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
                `<div class="autocomplete-item" data-code="${m.code}" data-name="${m.name}" data-stock="${m.stockQty}">
                    ${m.code} - ${m.name}
                </div>`
            ).join('');
            nameDropdown.style.display = 'block';
            
            nameDropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                item.addEventListener('click', function() {
                    const code = this.dataset.code;
                    const name = this.dataset.name;
                    const stock = this.dataset.stock;
                    
                    codeSearch.value = code;
                    codeValue.value = code;
                    nameSearch.value = name;
                    nameValue.value = name;
                    stockQtyInput.value = stock;
                    
                    codeDropdown.style.display = 'none';
                    nameDropdown.style.display = 'none';
                });
            });
        } else {
            nameDropdown.style.display = 'none';
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!codeSearch.contains(e.target) && !codeDropdown.contains(e.target)) {
            codeDropdown.style.display = 'none';
        }
        if (!nameSearch.contains(e.target) && !nameDropdown.contains(e.target)) {
            nameDropdown.style.display = 'none';
        }
    });
}

// 编辑出库单
function editOrder(id) {
    const order = outboundOrdersData.find(o => o.id === id);
    if (!order) return;
    if (isInspectionOutboundType(order.type)) {
        alert('成品抽检出库功能暂未开放显示。');
        return;
    }
    if (order.hasAllocatedForOutbound) {
        alert('该出库单已分配出库，不允许编辑！');
        return;
    }
    
    editingOrderId = id;
    materialCounter = 0;
    document.getElementById('modalTitle').textContent = '编辑出库单';
    document.getElementById('orderNo').value = order.orderNo;
    document.getElementById('orderType').value = order.type;
    document.getElementById('upstreamNo').value = order.upstreamNo || '';
    document.getElementById('orderRemark').value = order.remark || '';
    document.getElementById('materialList').innerHTML = '';
    updateOrderFormByType(order.type);

    order.materials.forEach(material => {
        addMaterialItem();
        const items = document.querySelectorAll('.material-item');
        const lastItem = items[items.length - 1];
        lastItem.querySelector('.material-code-search').value = material.code;
        lastItem.querySelector('.material-code-value').value = material.code;
        lastItem.querySelector('.material-name-search').value = material.name;
        lastItem.querySelector('.material-name-value').value = material.name;
        lastItem.querySelector('.material-qty').value = material.plannedQty;
        
        const materialData = systemMaterials.find(m => m.code === material.code);
        if (materialData) {
            lastItem.querySelector('.material-stock-qty').value = materialData.stockQty;
        }
    });
    
    document.getElementById('outboundModal').classList.add('active');
}

// 保存出库单
function saveOrder() {
    const orderNo = document.getElementById('orderNo').value.trim();
    const orderType = document.getElementById('orderType').value;
    const upstreamNo = document.getElementById('upstreamNo').value.trim();
    const orderRemark = document.getElementById('orderRemark').value.trim();
    
    if (!ENABLE_INSPECTION_OUTBOUND && isInspectionOutboundType(orderType)) {
        alert('成品抽检出库功能暂未开放显示。');
        return;
    }

    if (!orderNo || !orderType) {
        alert('请填写所有必填项！');
        return;
    }

    let materials = [];
    const materialItems = document.querySelectorAll('.material-item');
    if (materialItems.length === 0) {
        alert('请至少添加一条物料明细！');
        return;
    }
    
    for (let item of materialItems) {
        const code = item.querySelector('.material-code-value').value.trim();
        const name = item.querySelector('.material-name-value').value.trim();
        const qty = parseInt(item.querySelector('.material-qty').value, 10);
        
        if (!code || !name || !qty) {
            alert('请填写所有物料明细的必填项！');
            return;
        }
        
        materials.push({
            code,
            name,
            plannedQty: qty,
            outboundQty: 0,
            allocatedQty: 0
        });
    }
    
    if (editingOrderId) {
        const order = outboundOrdersData.find(o => o.id === editingOrderId);
        if (order) {
            order.type = orderType;
            order.upstreamNo = upstreamNo;
            order.remark = orderRemark;
            order.materials = materials;
            order.outboundPort = order.outboundPort || '';
            order.hasAllocatedForOutbound = order.hasAllocatedForOutbound || false;
        }
        alert('出库单已更新！');
    } else {
        const now = new Date();
        const createTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        const newOrder = {
            id: outboundOrdersData.length + 1,
            orderNo,
            source: '手工创建',
            upstreamNo,
            type: orderType,
            materials,
            outboundPort: '',
            hasAllocatedForOutbound: false,
            status: '待出库',
            createTime,
            remark: orderRemark,
            canEdit: true,
            canDelete: true
        };
        outboundOrdersData.push(newOrder);
        alert('出库单添加成功！');
    }
    
    closeAllModals();
    searchOrders();
}

// 删除出库单
function deleteOrder(id) {
    const order = outboundOrdersData.find(o => o.id === id);
    if (!order) return;
    
    if (!order.canDelete || order.hasAllocatedForOutbound) {
        alert('该出库单不可删除！');
        return;
    }
    
    if (confirm(`确定要删除出库单"${order.orderNo}"吗？`)) {
        outboundOrdersData = outboundOrdersData.filter(o => o.id !== id);
        alert('出库单已删除！');
        searchOrders();
    }
}

// 显示详情
function showDetail(id) {
    detailOrderId = id;
    const order = outboundOrdersData.find(o => o.id === id);
    if (!order) return;
    const isInspection = isInspectionOutboundType(order.type);
    
    document.getElementById('detailOrderNo').textContent = order.orderNo;
    document.getElementById('detailSource').textContent = order.source;
    document.getElementById('detailType').textContent = order.type;
    document.getElementById('detailStatus').innerHTML = `<span class="status-badge ${getStatusClass(order.status)}">${order.status}</span>`;
    
    const firstMaterial = getPrimaryDisplayMaterial(order);
    const allocationBody = document.getElementById('detailAllocationBody');
    let detailAllocations = [];

    if (!order.hasAllocatedForOutbound) {
        detailAllocations = [];
    } else if (isInspection) {
        const allocatedPalletCount = order.hasAllocatedForOutbound
            ? Number(order.allocatedPalletCount || order.inspectionPalletCount || 0)
            : 0;
        const outboundPalletCount = Math.min(
            Number(order.outboundPalletCount || 0),
            allocatedPalletCount
        );

        detailAllocations = Array.from({ length: allocatedPalletCount }, (_, index) => {
            let statusClass = 'pending';
            let statusText = '待出库';

            if (index < outboundPalletCount) {
                statusClass = 'completed';
                statusText = '已完成';
            } else if (order.status === '出库中') {
                statusClass = 'processing';
                statusText = '出库中';
            } else if (order.status === '已完成') {
                statusClass = 'completed';
                statusText = '已完成';
            }

            return {
                code: firstMaterial.code,
                name: firstMaterial.name,
                containerCode: `TP-${String(order.id * 100 + index + 1).padStart(3, '0')}`,
                locationCode: `2-5-10-${(index % 2) + 1}`,
                allocatedQty: 1,
                allocatedQtyText: '1（托）',
                statusClass,
                statusText
            };
        });
    } else {
        const totalAllocatedQty = order.hasAllocatedForOutbound ? Number(firstMaterial.allocatedQty || 0) : 0;
        const totalOutboundQty = Math.min(Number(firstMaterial.outboundQty || 0), totalAllocatedQty);
        const remainingAllocatedQty = Math.max(totalAllocatedQty - totalOutboundQty, 0);

        if (totalOutboundQty > 0) {
            detailAllocations.push({
                code: firstMaterial.code,
                name: firstMaterial.name,
                containerCode: 'TP-001',
                locationCode: '1-5-12-1',
                allocatedQty: totalOutboundQty,
                allocatedQtyText: String(totalOutboundQty),
                statusClass: 'completed',
                statusText: '已完成'
            });
        }

        if (remainingAllocatedQty > 0) {
            detailAllocations.push({
                code: firstMaterial.code,
                name: firstMaterial.name,
                containerCode: totalOutboundQty > 0 ? 'TP-002' : 'TP-001',
                locationCode: totalOutboundQty > 0 ? '1-6-12-1' : '1-5-12-1',
                allocatedQty: remainingAllocatedQty,
                allocatedQtyText: String(remainingAllocatedQty),
                statusClass: order.status === '出库中' ? 'processing' : 'pending',
                statusText: order.status === '出库中' ? '出库中' : '待出库'
            });
        }
    }

    allocationBody.innerHTML = detailAllocations.map(item => `
        <tr>
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.containerCode}</td>
            <td>${item.locationCode}</td>
            <td>${item.allocatedQtyText}</td>
            <td><span class="status-badge ${item.statusClass}">${item.statusText}</span></td>
        </tr>
    `).join('');

    const allocatedQtyByMaterial = new Map();
    detailAllocations.forEach(item => {
        allocatedQtyByMaterial.set(item.code, (allocatedQtyByMaterial.get(item.code) || 0) + item.allocatedQty);
    });

    const detailMaterials = order.materials.map(material => {
        const allocatedQty = allocatedQtyByMaterial.get(material.code) || 0;
        const outboundQty = detailAllocations
            .filter(item => item.code === material.code && item.statusText === '已完成')
            .reduce((sum, item) => sum + item.allocatedQty, 0);

        if (isInspection) {
            return {
                ...material,
                allocatedQty: formatPalletCount(allocatedQty),
                outboundQty: formatPalletCount(outboundQty)
            };
        }

        return {
            ...material,
            allocatedQty,
            outboundQty
        };
    });

    const materialBody = document.getElementById('detailMaterialBody');
    materialBody.innerHTML = detailMaterials.map(m => `
        <tr>
            <td>${m.code}</td>
            <td>${m.name}</td>
            <td>${m.plannedQty}</td>
            <td>${m.allocatedQty || 0}</td>
            <td>${m.outboundQty || 0}</td>
        </tr>
    `).join('');
    
    const taskBody = document.getElementById('detailTaskBody');
    if (!order.hasAllocatedForOutbound) {
        taskBody.innerHTML = '';
    } else if (isInspection) {
        taskBody.innerHTML = detailAllocations.map((item, index) => {
            const startTime = item.statusText === '待出库' ? '-' : order.createTime;
            const endTime = item.statusText === '已完成' ? order.createTime : '-';

            return `
            <tr>
                <td>TASK-${order.orderNo}-${String(index + 1).padStart(3, '0')}</td>
                <td>${order.orderNo}</td>
                <td><span class="command-badge outbound">出库</span></td>
                <td><span class="task-type-badge">成品抽检出库</span></td>
                <td>${item.containerCode}</td>
                <td>${firstMaterial.code} - ${firstMaterial.name} × ${item.allocatedQtyText}</td>
                <td>${item.locationCode}</td>
                <td>${order.inspectionRoom || '-'}</td>
                <td>-</td>
                <td>${order.inspectionRoom || '-'}</td>
                <td><span class="status-badge ${item.statusClass}">${item.statusText}</span></td>
                <td>${order.createTime}</td>
                <td>${startTime}</td>
                <td>${endTime}</td>
            </tr>`;
        }).join('');
    } else {
        taskBody.innerHTML = detailAllocations.map((item, index) => {
            const startTime = item.statusText === '待出库' ? '-' : order.createTime;
            const endTime = item.statusText === '已完成' ? order.createTime : '-';

            return `
            <tr>
                <td>TASK-${order.orderNo}-${String(index + 1).padStart(3, '0')}</td>
                <td>${order.orderNo}</td>
                <td><span class="command-badge outbound">出库</span></td>
                <td><span class="task-type-badge">普通出库</span></td>
                <td>${item.containerCode}</td>
                <td>${firstMaterial.code} - ${firstMaterial.name} × ${item.allocatedQtyText}</td>
                <td>${item.locationCode}</td>
                <td>-</td>
                <td>-</td>
                <td>${order.outboundPort || '-'}</td>
                <td><span class="status-badge ${item.statusClass}">${item.statusText}</span></td>
                <td>${order.createTime}</td>
                <td>${startTime}</td>
                <td>${endTime}</td>
            </tr>`;
        }).join('');
    }
    
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
    
    const order = outboundOrdersData.find(o => o.id === forceCompleteOrderId);
    if (order) {
        order.status = '已完成';
        order.canEdit = false;
        order.canDelete = false;
        order.forceCompleteReason = reason;
        alert('出库单已强制完成！');
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
    document.getElementById('outboundModal').classList.remove('active');
    document.getElementById('detailModal').classList.remove('active');
    document.getElementById('forceCompleteModal').classList.remove('active');
    document.getElementById('manualAllocateModal').classList.remove('active');
    document.getElementById('locationAllocateModal').classList.remove('active');
    document.getElementById('mergeOrderModal').classList.remove('active');
    document.getElementById('batchAllocateModal').classList.remove('active');
    editingOrderId = null;
    detailOrderId = null;
    forceCompleteOrderId = null;
    manualAllocatingOrderId = null;
    autoAllocatingOrderId = null;
    currentAllocatingMaterial = null;
    allocationResults = [];
    selectedLocations.clear();
    batchAllocatingOrders = [];
    batchSelectedMaterials = [];
    batchAllocatingPort = '';
    batchAllocationResults = [];
}

// 打开手工分配弹窗
function openManualAllocate(id) {
    manualAllocatingOrderId = id;
    allocationResults = [];
    const order = outboundOrdersData.find(o => o.id === id);
    if (!order) return;
    
    document.getElementById('manualAllocateOrderNo').textContent = order.orderNo;
    document.getElementById('manualAllocatePort').value = '';
    document.getElementById('manualDemandBody').innerHTML = '';
    document.getElementById('manualResultBody').innerHTML = '';
    
    document.getElementById('manualAllocateModal').classList.add('active');
}

// 渲染订单需求列表
function renderManualDemand() {
    const port = document.getElementById('manualAllocatePort').value;
    const order = outboundOrdersData.find(o => o.id === manualAllocatingOrderId);
    if (!order || !port) {
        document.getElementById('manualDemandBody').innerHTML = '';
        return;
    }
    
    // 简化处理：出库口1对应物料WL-2024-001和WL-2024-002，出库口2对应WL-2024-003
    const portMaterials = port === '出库口1' ? 
        ['WL-2024-001', 'WL-2024-002'] : 
        ['WL-2024-003', 'WL-2024-004', 'WL-2024-005'];
    
    const filteredMaterials = order.materials.filter(m => portMaterials.includes(m.code));
    
    const tbody = document.getElementById('manualDemandBody');
    tbody.innerHTML = filteredMaterials.map(m => {
        const pendingQty = m.plannedQty - (m.outboundQty || 0);
        return `
        <tr>
            <td>${m.code}</td>
            <td>${m.name}</td>
            <td>${m.plannedQty}</td>
            <td>${m.outboundQty || 0}</td>
            <td>${pendingQty}</td>
            <td>${m.allocatedQty || 0}</td>
            <td>
                <button class="detail-btn" onclick="openLocationAllocate('${m.code}', '${m.name}', ${pendingQty})">库位分配</button>
            </td>
        </tr>
    `}).join('');
    
    renderAllocationResults();
}

// 渲染分配结果列表
function renderAllocationResults() {
    const tbody = document.getElementById('manualResultBody');
    tbody.innerHTML = allocationResults.map((result, index) => `
        <tr>
            <td>${result.materialCode}</td>
            <td>${result.materialName}</td>
            <td>${result.containerCode}</td>
            <td>${result.allocatedQty}</td>
            <td>
                <button class="delete-btn" onclick="removeAllocationResult(${index})">取消分配</button>
            </td>
        </tr>
    `).join('');
}

// 移除分配结果
function removeAllocationResult(index) {
    allocationResults.splice(index, 1);
    renderAllocationResults();
}

// 打开库位分配弹窗
function openLocationAllocate(materialCode, materialName, pendingQty) {
    currentAllocatingMaterial = { code: materialCode, name: materialName, pendingQty: pendingQty };
    selectedLocations.clear();
    
    document.getElementById('locationMaterialCode').textContent = materialCode;
    document.getElementById('locationMaterialName').textContent = materialName;
    document.getElementById('locationPendingQty').textContent = pendingQty;
    
    // 重置搜索条件
    document.getElementById('searchRow').value = '';
    document.getElementById('searchCol').value = '';
    document.getElementById('searchLevel').value = '';
    document.getElementById('searchDepth').value = '';
    
    renderLocationList();
    document.getElementById('locationAllocateModal').classList.add('active');
}

// 渲染库位列表
function renderLocationList() {
    if (!currentAllocatingMaterial) return;
    
    const row = document.getElementById('searchRow').value.trim();
    const col = document.getElementById('searchCol').value.trim();
    const level = document.getElementById('searchLevel').value.trim();
    const depth = document.getElementById('searchDepth').value.trim();
    
    // 筛选符合条件的库位
    let filtered = locationInventory.filter(loc => 
        loc.materialCode === currentAllocatingMaterial.code
    );
    
    if (row) filtered = filtered.filter(loc => loc.row === parseInt(row));
    if (col) filtered = filtered.filter(loc => loc.col === parseInt(col));
    if (level) filtered = filtered.filter(loc => loc.level === parseInt(level));
    if (depth) filtered = filtered.filter(loc => loc.depth === parseInt(depth));
    
    // 计算最大可分配数量（取库位可用数量和待出数量的较小值）
    const pendingQty = currentAllocatingMaterial.pendingQty || 0;
    
    const tbody = document.getElementById('locationListBody');
    tbody.innerHTML = filtered.map(loc => {
        const maxQty = Math.min(loc.availableQty, pendingQty);
        return `
            <tr>
                <td><input type="checkbox" class="location-checkbox" value="${loc.locationCode}" data-container="${loc.containerCode}" data-qty="${loc.availableQty}"></td>
                <td>${loc.locationCode}</td>
                <td>${loc.containerCode}</td>
                <td>${loc.availableQty}</td>
                <td><input type="number" class="form-input allocate-qty-input" data-location="${loc.locationCode}" data-max="${maxQty}" min="1" max="${maxQty}" placeholder="请输入数量" style="width: 100px;"></td>
            </tr>
        `;
    }).join('');
    
    // 绑定复选框事件
    tbody.querySelectorAll('.location-checkbox').forEach(cb => {
        cb.addEventListener('change', function() {
            if (this.checked) {
                selectedLocations.add(this.value);
            } else {
                selectedLocations.delete(this.value);
            }
            updateSelectAllLocations();
        });
    });
    
    // 绑定数量输入框验证事件
    tbody.querySelectorAll('.allocate-qty-input').forEach(input => {
        input.addEventListener('input', function() {
            const maxQty = parseInt(this.getAttribute('data-max')) || 0;
            const value = parseInt(this.value) || 0;
            
            if (value > maxQty) {
                this.value = maxQty;
                alert(`分配数量不能超过 ${maxQty}（待出数量限制）`);
            }
            if (value < 0) {
                this.value = 1;
            }
        });
        
        input.addEventListener('blur', function() {
            if (this.value && parseInt(this.value) < 1) {
                this.value = 1;
            }
        });
    });
}

// 搜索库位
function searchLocations() {
    renderLocationList();
}

// 重置库位搜索
function resetLocationSearch() {
    document.getElementById('searchRow').value = '';
    document.getElementById('searchCol').value = '';
    document.getElementById('searchLevel').value = '';
    document.getElementById('searchDepth').value = '';
    renderLocationList();
}

// 全选库位
function toggleSelectAllLocations(e) {
    document.querySelectorAll('#locationListBody .location-checkbox').forEach(cb => {
        cb.checked = e.target.checked;
        if (e.target.checked) {
            selectedLocations.add(cb.value);
        } else {
            selectedLocations.delete(cb.value);
        }
    });
}

// 更新全选状态
function updateSelectAllLocations() {
    const checkboxes = document.querySelectorAll('#locationListBody .location-checkbox');
    const checkedCount = document.querySelectorAll('#locationListBody .location-checkbox:checked').length;
    const selectAll = document.getElementById('selectAllLocations');
    
    selectAll.checked = checkboxes.length > 0 && checkedCount === checkboxes.length;
    selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
}

// 确认库位分配
function confirmLocationAllocate() {
    if (selectedLocations.size === 0) {
        alert('请至少选择一个库位！');
        return;
    }
    
    const tbody = document.getElementById('locationListBody');
    let totalAllocated = 0;
    const pendingQty = currentAllocatingMaterial.pendingQty || 0;
    
    selectedLocations.forEach(locationCode => {
        const row = tbody.querySelector(`input[value="${locationCode}"]`).closest('tr');
        const qtyInput = row.querySelector('.allocate-qty-input');
        const qty = parseInt(qtyInput.value) || 0;
        
        if (qty > 0) {
            const containerCode = row.querySelector('.location-checkbox').dataset.container;
            
            const result = {
                materialCode: currentAllocatingMaterial.code,
                materialName: currentAllocatingMaterial.name,
                containerCode: containerCode,
                locationCode: locationCode,
                allocatedQty: qty
            };
            
            // 判断是手工分配还是批量分配
            if (document.getElementById('batchAllocateModal').classList.contains('active')) {
                batchAllocationResults.push(result);
            } else {
                allocationResults.push(result);
            }
            
            totalAllocated += qty;
        }
    });
    
    if (totalAllocated === 0) {
        alert('请为选中的库位填写分配数量！');
        return;
    }
    
    // 验证总分配数量不超过待出数量
    if (totalAllocated > pendingQty) {
        alert(`分配数量不能超过待出数量！\n当前分配：${totalAllocated}\n待出数量：${pendingQty}`);
        return;
    }
    
    alert(`库位分配成功！共分配 ${totalAllocated} 件`);
    closeLocationAllocateModal();
    
    // 根据上下文更新不同的结果列表
    if (document.getElementById('batchAllocateModal').classList.contains('active')) {
        renderBatchDemand();
        renderBatchAllocationResults();
    } else {
        renderAllocationResults();
    }
}

// 确认手工分配
function confirmManualAllocate() {
    if (allocationResults.length === 0) {
        alert('请先进行库位分配！');
        return;
    }
    
    const order = outboundOrdersData.find(o => o.id === manualAllocatingOrderId);
    if (!order) return;
    
    // 更新物料的已分配数量
    allocationResults.forEach(result => {
        const material = order.materials.find(m => m.code === result.materialCode);
        if (material) {
            material.allocatedQty = (material.allocatedQty || 0) + result.allocatedQty;
        }
    });
    
    // 更新订单状态
    if (order.status === '待出库') {
        order.status = '出库中';
    }
    
    // 检查是否全部分配完成
    const allAllocated = order.materials.every(m => (m.allocatedQty || 0) >= m.plannedQty);
    if (allAllocated) {
        // 可以选择是否自动完成，这里保持出库中状态
    }
    
    alert(`手工分配成功！\n已分配托盘数：${allocationResults.length}\n本次分配数量：${allocationResults.reduce((sum, r) => sum + r.allocatedQty, 0)}`);
    
    closeManualAllocateModal();
    renderTable();
}

// 打开自动分配（显示出库口选择弹窗）
function openAutoAllocate(id) {
    autoAllocatingOrderId = id;
    const order = outboundOrdersData.find(o => o.id === id);
    if (!order) return;
    if (isInspectionOutboundType(order.type)) {
        alert('成品抽检出库功能暂未开放显示。');
        return;
    }
    applyAutoAllocate(order, '模具出库口');
}

function applyAutoAllocate(order, port) {
    const filteredMaterials = order.materials;

    // 自动分配逻辑：为每个物料自动选择库位
    let totalAllocated = 0;
    let allocationCount = 0;
    
    filteredMaterials.forEach(material => {
        const plannedQty = Number(material.plannedQty || 0);
        const currentAllocatedQty = Number(material.allocatedQty || 0);
        const pendingQty = plannedQty - currentAllocatedQty;
        if (pendingQty <= 0) return;

        // 自动分配逻辑：为每个物料自动选择库位
        const availableLocations = locationInventory.filter(loc => 
            loc.materialCode === material.code
        );
        
        let remaining = pendingQty;
        availableLocations.forEach(loc => {
            if (remaining <= 0) return;
            
            const allocateQty = Math.min(remaining, loc.availableQty);
            material.allocatedQty = (material.allocatedQty || 0) + allocateQty;
            remaining -= allocateQty;
            totalAllocated += allocateQty;
            allocationCount++;
        });
    });
    
    if (totalAllocated === 0) {
        alert('没有可用的库位进行自动分配！');
        return;
    }
    
    // 更新订单状态
    if (order.status === '待出库') {
        order.status = '出库中';
    }
    order.outboundPort = port;
    order.hasAllocatedForOutbound = true;
    
    alert(`分配出库成功！\n出库口：${port}\n已分配托盘数：${allocationCount}\n本次分配数量：${totalAllocated}`);
    autoAllocatingOrderId = null;
    renderTable();
}

// 关闭手工分配弹窗
function closeManualAllocateModal() {
    document.getElementById('manualAllocateModal').classList.remove('active');
    manualAllocatingOrderId = null;
    allocationResults = [];
}

// 关闭库位分配弹窗
function closeLocationAllocateModal() {
    document.getElementById('locationAllocateModal').classList.remove('active');
    currentAllocatingMaterial = null;
    selectedLocations.clear();
}

// 全选订单
function toggleSelectAllOrders(e) {
    document.querySelectorAll('.order-checkbox:not(:disabled)').forEach(cb => {
        cb.checked = e.target.checked;
        const id = parseInt(cb.value);
        if (e.target.checked) {
            selectedOrders.add(id);
        } else {
            selectedOrders.delete(id);
        }
    });
}

// 更新全选订单状态
function updateSelectAllOrders() {
    const checkboxes = document.querySelectorAll('.order-checkbox:not(:disabled)');
    const checkedCount = document.querySelectorAll('.order-checkbox:checked').length;
    const selectAll = document.getElementById('selectAllOrders');
    
    if (checkboxes.length > 0) {
        selectAll.checked = checkedCount === checkboxes.length;
        selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
    }
}

// 打开批量分配
function openBatchAllocate() {
    if (selectedOrders.size === 0) {
        alert('请至少选择一个出库单！');
        return;
    }
    
    // 验证所选订单是否满足条件
    const orders = outboundOrdersData.filter(o => selectedOrders.has(o.id));
    const invalidOrders = orders.filter(o => {
        const isValidStatus = o.status === '待出库' || o.status === '出库中';
        const hasUnallocated = o.materials.some(m => (m.allocatedQty || 0) < m.plannedQty);
        return !isValidStatus || !hasUnallocated;
    });
    
    if (invalidOrders.length > 0) {
        alert('所选订单中包含不满足条件的订单！\n请确保所选订单状态为"待出库"或"出库中"，且已分配数量小于计划数量。');
        return;
    }
    
    batchAllocatingOrders = orders;
    document.getElementById('mergeOrderPort').value = '';
    document.getElementById('mergeOrderMaterialBody').innerHTML = '';
    
    document.getElementById('mergeOrderModal').classList.add('active');
}

// 渲染合并订单物料明细
function renderMergeOrderMaterials() {
    const port = document.getElementById('mergeOrderPort').value;
    const table = document.getElementById('mergeOrderMaterialTable');
    const thead = table.querySelector('thead tr');
    const tbody = document.getElementById('mergeOrderMaterialBody');
    
    if (!port) {
        tbody.innerHTML = '';
        // 重置表头
        thead.innerHTML = `
            <th width="50"><input type="checkbox" id="selectAllMergeMaterials"></th>
            <th>物料编码</th>
            <th>物料名称</th>
            <th>订单待出库合计数</th>
            <th>库存数</th>
        `;
        return;
    }
    
    // 根据出库口筛选物料
    const portMaterials = port === '出库口1' ? 
        ['WL-2024-001', 'WL-2024-002'] : 
        ['WL-2024-003', 'WL-2024-004', 'WL-2024-005'];
    
    // 合并所有订单的物料，并记录每个订单的数量
    const materialMap = new Map();
    const orderNos = batchAllocatingOrders.map(o => o.orderNo);
    
    batchAllocatingOrders.forEach(order => {
        order.materials.forEach(m => {
            if (!portMaterials.includes(m.code)) return;
            
            const pendingQty = m.plannedQty - (m.allocatedQty || 0);
            
            if (!materialMap.has(m.code)) {
                materialMap.set(m.code, {
                    code: m.code,
                    name: m.name,
                    totalPending: 0,
                    orderQuantities: {} // 存储每个订单的数量
                });
            }
            
            const material = materialMap.get(m.code);
            if (pendingQty > 0) {
                material.totalPending += pendingQty;
                material.orderQuantities[order.orderNo] = pendingQty;
            }
        });
    });
    
    // 动态生成表头，包含所有订单列
    thead.innerHTML = `
        <th width="50"><input type="checkbox" id="selectAllMergeMaterials"></th>
        <th>物料编码</th>
        <th>物料名称</th>
        <th>订单待出库合计数</th>
        ${orderNos.map(orderNo => `<th>${orderNo}</th>`).join('')}
        <th>库存数</th>
    `;
    
    // 重新绑定全选事件
    document.getElementById('selectAllMergeMaterials').addEventListener('change', toggleSelectAllMergeMaterials);
    
    // 生成表格内容（只显示订单待出库合计数大于0的物料）
    tbody.innerHTML = Array.from(materialMap.values())
        .filter(m => m.totalPending > 0) // 过滤掉合计数为0的物料
        .map(m => {
            const materialData = systemMaterials.find(sm => sm.code === m.code);
            const stockQty = materialData ? materialData.stockQty : 0;
            
            // 为每个订单生成对应的数量列，如果该订单没有此物料则显示0
            const orderColumns = orderNos.map(orderNo => {
                const qty = m.orderQuantities[orderNo] || 0;
                return `<td>${qty}</td>`;
            }).join('');
            
            return `
            <tr>
                <td><input type="checkbox" class="merge-material-checkbox" value="${m.code}" data-total="${m.totalPending}" data-stock="${stockQty}"></td>
                <td>${m.code}</td>
                <td>${m.name}</td>
                <td>${m.totalPending}</td>
                ${orderColumns}
                <td>${stockQty}</td>
            </tr>
        `}).join('');
}

// 全选合并物料
function toggleSelectAllMergeMaterials(e) {
    document.querySelectorAll('.merge-material-checkbox').forEach(cb => {
        cb.checked = e.target.checked;
    });
}

// 确认合并订单
function confirmMergeOrder() {
    const port = document.getElementById('mergeOrderPort').value;
    if (!port) {
        alert('请选择出库口！');
        return;
    }
    
    const selectedMaterials = [];
    document.querySelectorAll('.merge-material-checkbox:checked').forEach(cb => {
        selectedMaterials.push({
            code: cb.value,
            totalPending: parseInt(cb.dataset.total),
            stockQty: parseInt(cb.dataset.stock)
        });
    });
    
    if (selectedMaterials.length === 0) {
        alert('请至少选择一个物料！');
        return;
    }
    
    // 验证库存
    const insufficientMaterials = selectedMaterials.filter(m => m.totalPending > m.stockQty);
    if (insufficientMaterials.length > 0) {
        const materialCodes = insufficientMaterials.map(m => m.code).join('、');
        alert(`以下物料库存不足，请重新勾选：\n${materialCodes}`);
        return;
    }
    
    // 保存选择的数据
    batchSelectedMaterials = selectedMaterials;
    batchAllocatingPort = port;
    batchAllocationResults = [];
    
    // 关闭合并订单弹窗（不清理数据）
    document.getElementById('mergeOrderModal').classList.remove('active');
    
    // 打开批量分配页面
    openBatchAllocateModal();
}

// 打开批量分配页面
function openBatchAllocateModal() {
    document.getElementById('batchAllocatePort').textContent = batchAllocatingPort;
    renderBatchDemand();
    renderBatchAllocationResults();
    document.getElementById('batchAllocateModal').classList.add('active');
}

// 渲染批量分配订单需求
function renderBatchDemand() {
    const portMaterials = batchAllocatingPort === '出库口1' ? 
        ['WL-2024-001', 'WL-2024-002'] : 
        ['WL-2024-003', 'WL-2024-004', 'WL-2024-005'];
    
    const table = document.getElementById('batchDemandTable');
    const thead = table.querySelector('thead tr');
    const tbody = document.getElementById('batchDemandBody');
    const orderNos = batchAllocatingOrders.map(o => o.orderNo);
    
    // 只显示在合并订单确认页面中勾选的物料
    const materialMap = new Map();
    
    // 初始化所有勾选的物料
    batchSelectedMaterials.forEach(sm => {
        materialMap.set(sm.code, {
            code: sm.code,
            name: '', // 将从订单中获取
            totalPending: 0,
            orderQuantities: {},
            allocatedQty: 0
        });
    });
    
    // 填充各订单的物料数量
    batchAllocatingOrders.forEach(order => {
        order.materials.forEach(m => {
            if (!materialMap.has(m.code)) return; // 只处理勾选的物料
            
            const pendingQty = m.plannedQty - (m.allocatedQty || 0);
            const material = materialMap.get(m.code);
            
            // 设置物料名称
            if (!material.name) {
                material.name = m.name;
            }
            
            if (pendingQty > 0) {
                material.totalPending += pendingQty;
                material.orderQuantities[order.orderNo] = pendingQty;
            }
        });
    });
    
    // 动态生成表头，包含所有订单列
    thead.innerHTML = `
        <th>物料编码</th>
        <th>物料名称</th>
        <th>订单待出库合计数</th>
        ${orderNos.map(orderNo => `<th>${orderNo}</th>`).join('')}
        <th>已分配数量</th>
        <th width="100">操作</th>
    `;
    
    // 生成表格内容（只显示勾选的物料）
    tbody.innerHTML = Array.from(materialMap.values())
        .filter(m => m.totalPending > 0) // 只显示有待出库数量的物料
        .map(m => {
            const allocated = batchAllocationResults
                .filter(r => r.materialCode === m.code)
                .reduce((sum, r) => sum + r.allocatedQty, 0);
            
            // 为每个订单生成对应的数量列，如果该订单没有此物料则显示0
            const orderColumns = orderNos.map(orderNo => {
                const qty = m.orderQuantities[orderNo] || 0;
                return `<td>${qty}</td>`;
            }).join('');
            
            return `
            <tr>
                <td>${m.code}</td>
                <td>${m.name}</td>
                <td>${m.totalPending}</td>
                ${orderColumns}
                <td>${allocated}</td>
                <td>
                    <button class="detail-btn" onclick="openBatchLocationAllocate('${m.code}', '${m.name}', ${m.totalPending})">库位分配</button>
                </td>
            </tr>
        `}).join('');
}

// 打开批量库位分配
function openBatchLocationAllocate(materialCode, materialName, pendingQty) {
    currentAllocatingMaterial = { code: materialCode, name: materialName, pendingQty: pendingQty };
    selectedLocations.clear();
    
    document.getElementById('locationMaterialCode').textContent = materialCode;
    document.getElementById('locationMaterialName').textContent = materialName;
    document.getElementById('locationPendingQty').textContent = pendingQty;
    
    document.getElementById('searchRow').value = '';
    document.getElementById('searchCol').value = '';
    document.getElementById('searchLevel').value = '';
    document.getElementById('searchDepth').value = '';
    
    renderLocationList();
    document.getElementById('locationAllocateModal').classList.add('active');
}

// 渲染批量分配结果
function renderBatchAllocationResults() {
    const tbody = document.getElementById('batchResultBody');
    tbody.innerHTML = batchAllocationResults.map((result, index) => `
        <tr>
            <td>${result.materialCode}</td>
            <td>${result.materialName}</td>
            <td>${result.containerCode}</td>
            <td>${result.allocatedQty}</td>
            <td>
                <button class="delete-btn" onclick="removeBatchAllocationResult(${index})">取消分配</button>
            </td>
        </tr>
    `).join('');
}

// 移除批量分配结果
function removeBatchAllocationResult(index) {
    batchAllocationResults.splice(index, 1);
    renderBatchDemand();
    renderBatchAllocationResults();
}

// 确认批量分配
function confirmBatchAllocate() {
    if (batchAllocationResults.length === 0) {
        alert('请先进行库位分配！');
        return;
    }
    
    // 按物料汇总已分配数量
    const materialAllocations = new Map();
    batchAllocationResults.forEach(result => {
        if (!materialAllocations.has(result.materialCode)) {
            materialAllocations.set(result.materialCode, 0);
        }
        materialAllocations.set(result.materialCode, 
            materialAllocations.get(result.materialCode) + result.allocatedQty);
    });
    
    // 按比例分配给各订单
    batchAllocatingOrders.forEach(order => {
        order.materials.forEach(material => {
            const totalAllocated = materialAllocations.get(material.code) || 0;
            if (totalAllocated === 0) return;
            
            const pendingQty = material.plannedQty - (material.allocatedQty || 0);
            if (pendingQty <= 0) return;
            
            // 计算该订单在此物料中的占比
            let totalPending = 0;
            batchAllocatingOrders.forEach(o => {
                const m = o.materials.find(mat => mat.code === material.code);
                if (m) {
                    const pending = m.plannedQty - (m.allocatedQty || 0);
                    if (pending > 0) totalPending += pending;
                }
            });
            
            // 按比例分配
            if (totalPending > 0) {
                const allocatedForThisOrder = Math.floor((pendingQty / totalPending) * totalAllocated);
                material.allocatedQty = (material.allocatedQty || 0) + allocatedForThisOrder;
                
                // 更新订单状态
                if (order.status === '待出库') {
                    order.status = '出库中';
                }
            }
        });
    });
    
    alert(`批量分配成功！\n已分配托盘数：${batchAllocationResults.length}\n本次分配数量：${batchAllocationResults.reduce((sum, r) => sum + r.allocatedQty, 0)}`);
    
    // 成功分配后完全关闭所有相关弹窗
    document.getElementById('batchAllocateModal').classList.remove('active');
    document.getElementById('mergeOrderModal').classList.remove('active');
    batchAllocatingOrders = [];
    batchSelectedMaterials = [];
    batchAllocatingPort = '';
    batchAllocationResults = [];
    selectedOrders.clear();
    renderTable();
}

// 关闭合并订单弹窗
function closeMergeOrderModal() {
    document.getElementById('mergeOrderModal').classList.remove('active');
    // 如果从合并订单弹窗取消，清理所有批量分配相关数据
    batchAllocatingOrders = [];
    batchSelectedMaterials = [];
    batchAllocatingPort = '';
    batchAllocationResults = [];
}

// 关闭批量分配弹窗（返回到合并订单确认弹窗）
function closeBatchAllocateModal() {
    document.getElementById('batchAllocateModal').classList.remove('active');
    batchAllocationResults = [];
    // 返回到合并订单确认弹窗
    document.getElementById('mergeOrderModal').classList.add('active');
}
