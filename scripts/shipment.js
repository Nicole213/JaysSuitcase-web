// 发货单管理页面脚本

// 模拟数据
let shipmentOrdersData = [
    {
        id: 1,
        shipmentNo: 'CH-2024-0001',
        source: '客户WMS同步',
        upstreamNo: 'WMS-OUT-20240115-001',
        platform: '1号月台',
        materials: [
            { code: 'WL-2024-001', name: '电子元件A型', plannedQty: 80, shippedQty: 80 }
        ],
        customerName: '吉仕箱包制造有限公司',
        deliveryAddress: '广东省东莞市工业园区88号',
        status: '已完成',
        createTime: '2024-01-15 09:30:00',
        canEdit: false,
        canDelete: false
    },
    {
        id: 2,
        shipmentNo: 'CH-2024-0002',
        source: '手工创建',
        upstreamNo: 'SO-2024-002',
        platform: '2号月台',
        materials: [
            { code: 'WL-2024-002', name: '机械零件B型', plannedQty: 60, shippedQty: 30 }
        ],
        customerName: '华北机械设备公司',
        deliveryAddress: '河北省石家庄市高新区科技路168号',
        status: '发货中',
        createTime: '2024-01-16 10:15:00',
        canEdit: false,
        canDelete: false
    },
    {
        id: 3,
        shipmentNo: 'CH-2024-0003',
        source: '手工创建',
        upstreamNo: 'SO-2024-003',
        platform: '1号月台',
        materials: [
            { code: 'WL-2024-003', name: '塑料配件C型', plannedQty: 100, shippedQty: 0 },
            { code: 'WL-2024-005', name: '金属材料E型', plannedQty: 50, shippedQty: 0 }
        ],
        customerName: '北方工业集团',
        deliveryAddress: '内蒙古呼和浩特市赛罕区新华大街256号',
        status: '待发货',
        createTime: '2024-01-17 14:20:00',
        canEdit: true,
        canDelete: true
    },
    {
        id: 4,
        shipmentNo: 'CH-2024-0004',
        source: '客户WMS同步',
        upstreamNo: 'WMS-OUT-20240118-002',
        platform: '3号月台',
        materials: [
            { code: 'WL-2024-004', name: '长物料钢材D型', plannedQty: 40, shippedQty: 20 }
        ],
        customerName: '晋能钢铁有限公司',
        deliveryAddress: '山西省太原市小店区长风街99号',
        status: '发货中',
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
let filteredData = [...shipmentOrdersData];
let editingOrderId = null;
let materialCounter = 0;
let detailOrderId = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    renderTable();
    initEventListeners();
});

// 渲染表格
function renderTable() {
    const tbody = document.getElementById('shipmentTableBody');
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = filteredData.slice(start, end);

    tbody.innerHTML = pageData.map(order => {
        const material = order.materials[0]; // 显示第一个物料
        return `
        <tr>
            <td>${order.shipmentNo}</td>
            <td>
                <span class="source-badge ${order.source === '客户WMS同步' ? 'sync' : 'manual'}">
                    ${order.source}
                </span>
            </td>
            <td>${order.platform}</td>
            <td>${material.code}</td>
            <td>${material.name}</td>
            <td>${order.customerName}</td>
            <td title="${order.deliveryAddress}">${order.deliveryAddress.length > 20 ? order.deliveryAddress.substring(0, 20) + '...' : order.deliveryAddress}</td>
            <td>${material.plannedQty}</td>
            <td>${material.shippedQty}</td>
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
                </div>
            </td>
        </tr>
    `}).join('');

    updatePagination();
}

// 获取状态样式类
function getStatusClass(status) {
    const statusMap = {
        '待发货': 'pending',
        '发货中': 'processing',
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
    
    // 详情弹窗
    document.getElementById('detailClose').addEventListener('click', closeDetailModal);
    document.getElementById('detailCloseBtn').addEventListener('click', closeDetailModal);
    
    // 点击弹窗外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
}

// 查询发货单
function searchOrders() {
    const shipmentNo = document.getElementById('searchShipmentNo').value.trim().toLowerCase();
    const upstreamNo = document.getElementById('searchUpstreamNo').value.trim().toLowerCase();
    const materialCode = document.getElementById('searchMaterialCode').value.trim().toLowerCase();
    const status = document.getElementById('searchStatus').value;
    const source = document.getElementById('searchSource').value;
    const startDate = document.getElementById('searchStartDate').value;
    const endDate = document.getElementById('searchEndDate').value;
    
    filteredData = shipmentOrdersData.filter(order => {
        const matchShipmentNo = !shipmentNo || order.shipmentNo.toLowerCase().includes(shipmentNo);
        const matchUpstreamNo = !upstreamNo || order.upstreamNo.toLowerCase().includes(upstreamNo);
        const matchMaterialCode = !materialCode || order.materials.some(m => m.code.toLowerCase().includes(materialCode));
        const matchStatus = !status || order.status === status;
        const matchSource = !source || order.source === source;
        
        let matchDate = true;
        if (startDate || endDate) {
            const orderDate = order.createTime.split(' ')[0];
            if (startDate && orderDate < startDate) matchDate = false;
            if (endDate && orderDate > endDate) matchDate = false;
        }
        
        return matchShipmentNo && matchUpstreamNo && matchMaterialCode && matchStatus && 
               matchSource && matchDate;
    });
    
    currentPage = 1;
    renderTable();
}

// 重置查询
function resetSearch() {
    document.getElementById('searchShipmentNo').value = '';
    document.getElementById('searchUpstreamNo').value = '';
    document.getElementById('searchMaterialCode').value = '';
    document.getElementById('searchStatus').value = '';
    document.getElementById('searchSource').value = '';
    document.getElementById('searchStartDate').value = '';
    document.getElementById('searchEndDate').value = '';
    filteredData = [...shipmentOrdersData];
    currentPage = 1;
    renderTable();
}

// 打开新增弹窗
function openAddModal() {
    editingOrderId = null;
    materialCounter = 0;
    document.getElementById('modalTitle').textContent = '新增发货单';
    document.getElementById('shipmentForm').reset();
    
    // 生成发货单号
    const shipmentNo = generateShipmentNo();
    document.getElementById('shipmentNo').value = shipmentNo;
    
    // 清空物料列表
    document.getElementById('materialList').innerHTML = '';
    
    document.getElementById('shipmentModal').classList.add('active');
}

// 生成发货单号
function generateShipmentNo() {
    const now = new Date();
    const year = now.getFullYear();
    const seq = String(shipmentOrdersData.length + 1).padStart(4, '0');
    return `CH-${year}-${seq}`;
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
                <label class="required">计划发货数量：</label>
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

// 编辑发货单
function editOrder(id) {
    const order = shipmentOrdersData.find(o => o.id === id);
    if (!order) return;
    
    editingOrderId = id;
    materialCounter = 0;
    document.getElementById('modalTitle').textContent = '编辑发货单';
    document.getElementById('shipmentNo').value = order.shipmentNo;
    document.getElementById('shipmentPlatform').value = order.platform;
    document.getElementById('upstreamNo').value = order.upstreamNo || '';
    document.getElementById('customerName').value = order.customerName;
    document.getElementById('deliveryAddress').value = order.deliveryAddress;
    document.getElementById('shipmentRemark').value = order.remark || '';
    
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
    
    document.getElementById('shipmentModal').classList.add('active');
}

// 保存发货单
function saveOrder() {
    const shipmentNo = document.getElementById('shipmentNo').value.trim();
    const platform = document.getElementById('shipmentPlatform').value;
    const upstreamNo = document.getElementById('upstreamNo').value.trim();
    const customerName = document.getElementById('customerName').value.trim();
    const deliveryAddress = document.getElementById('deliveryAddress').value.trim();
    const shipmentRemark = document.getElementById('shipmentRemark').value.trim();
    
    if (!shipmentNo || !platform || !customerName || !deliveryAddress) {
        alert('请填写所有必填项！');
        return;
    }
    
    // 获取物料明细
    const materialItems = document.querySelectorAll('.material-item');
    if (materialItems.length === 0) {
        alert('请至少添加一条物料明细！');
        return;
    }
    
    const materials = [];
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
            shippedQty: 0
        });
    }
    
    if (editingOrderId) {
        // 编辑
        const order = shipmentOrdersData.find(o => o.id === editingOrderId);
        if (order) {
            order.platform = platform;
            order.upstreamNo = upstreamNo;
            order.customerName = customerName;
            order.deliveryAddress = deliveryAddress;
            order.remark = shipmentRemark;
            order.materials = materials;
        }
        alert('发货单已更新！');
    } else {
        // 新增
        const now = new Date();
        const createTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        const newOrder = {
            id: shipmentOrdersData.length + 1,
            shipmentNo,
            source: '手工创建',
            upstreamNo,
            platform,
            materials,
            customerName,
            deliveryAddress,
            status: '待发货',
            createTime,
            remark: shipmentRemark,
            canEdit: true,
            canDelete: true
        };
        shipmentOrdersData.push(newOrder);
        alert('发货单添加成功！');
    }
    
    closeAllModals();
    searchOrders();
}

// 删除发货单
function deleteOrder(id) {
    const order = shipmentOrdersData.find(o => o.id === id);
    if (!order) return;
    
    if (!order.canDelete) {
        alert('该发货单不可删除！');
        return;
    }
    
    if (confirm(`确定要删除发货单"${order.shipmentNo}"吗？`)) {
        shipmentOrdersData = shipmentOrdersData.filter(o => o.id !== id);
        alert('发货单已删除！');
        searchOrders();
    }
}

// 显示详情
function showDetail(id) {
    detailOrderId = id;
    const order = shipmentOrdersData.find(o => o.id === id);
    if (!order) return;
    
    // 基本信息
    document.getElementById('detailShipmentNo').textContent = order.shipmentNo;
    document.getElementById('detailSource').textContent = order.source;
    document.getElementById('detailPlatform').textContent = order.platform;
    document.getElementById('detailStatus').innerHTML = `<span class="status-badge ${getStatusClass(order.status)}">${order.status}</span>`;
    document.getElementById('detailCustomer').textContent = order.customerName;
    document.getElementById('detailAddress').textContent = order.deliveryAddress;
    
    // 物料信息
    const materialBody = document.getElementById('detailMaterialBody');
    materialBody.innerHTML = order.materials.map(m => `
        <tr>
            <td>${m.code}</td>
            <td>${m.name}</td>
            <td>${m.plannedQty}</td>
            <td>${m.shippedQty}</td>
        </tr>
    `).join('');
    
    // 出库任务（模拟数据）
    const taskBody = document.getElementById('detailTaskBody');
    taskBody.innerHTML = `
        <tr>
            <td>TASK-${order.shipmentNo}-001</td>
            <td>${order.shipmentNo}</td>
            <td><span class="command-badge outbound">出库</span></td>
            <td><span class="task-type-badge">普通出库</span></td>
            <td>TP-001</td>
            <td>${order.materials[0].code} - ${order.materials[0].name} × 20</td>
            <td>1-5-12-1</td>
            <td>-</td>
            <td>-</td>
            <td>1号出库口</td>
            <td><span class="status-badge completed">已完成</span></td>
            <td>2024-01-17 15:20:00</td>
            <td>2024-01-17 15:25:00</td>
            <td>2024-01-17 15:30:25</td>
        </tr>
        <tr>
            <td>TASK-${order.shipmentNo}-002</td>
            <td>${order.shipmentNo}</td>
            <td><span class="command-badge outbound">出库</span></td>
            <td><span class="task-type-badge">普通出库</span></td>
            <td>TP-002</td>
            <td>${order.materials[0].code} - ${order.materials[0].name} × 30</td>
            <td>1-6-12-1</td>
            <td>-</td>
            <td>-</td>
            <td>1号出库口</td>
            <td><span class="status-badge processing">执行中</span></td>
            <td>2024-01-17 15:25:00</td>
            <td>2024-01-17 15:30:00</td>
            <td>-</td>
        </tr>
    `;
    
    document.getElementById('detailModal').classList.add('active');
}

// 关闭详情弹窗
function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
    detailOrderId = null;
}

// 关闭所有弹窗
function closeAllModals() {
    document.getElementById('shipmentModal').classList.remove('active');
    document.getElementById('detailModal').classList.remove('active');
    editingOrderId = null;
    detailOrderId = null;
}