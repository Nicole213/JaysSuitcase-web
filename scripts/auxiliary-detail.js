// 辅材明细页面脚本

// 模拟辅材库存数据（物料+容器维度）
let auxiliaryData = [
    {
        id: 1,
        materialCode: 'FC-2024-001',
        materialName: '包装材料A型',
        containerCode: 'FC-001',
        containerType: '纸箱',
        locationCode: '1-1-2-1',
        area: '辅材库区',
        quantity: 500,
        palletTime: '2024-01-08 09:15:00',
        inboundTime: '2024-01-08 10:00:00',
        age: 27,
        status: '正常'
    },
    {
        id: 2,
        materialCode: 'FC-2024-002',
        materialName: '标签纸B型',
        containerCode: 'FC-002',
        containerType: '纸箱',
        locationCode: '1-2-2-1',
        area: '辅材库区',
        quantity: 1000,
        palletTime: '2024-01-10 14:20:00',
        inboundTime: '2024-01-10 15:05:00',
        age: 25,
        status: '正常'
    },
    {
        id: 3,
        materialCode: 'FC-2024-003',
        materialName: '胶带C型',
        containerCode: 'FC-003',
        containerType: '纸箱',
        locationCode: '1-3-2-1',
        area: '辅材库区',
        quantity: 200,
        palletTime: '2024-01-12 11:30:00',
        inboundTime: '2024-01-12 12:15:00',
        age: 23,
        status: '锁定'
    },
    {
        id: 4,
        materialCode: 'FC-2024-004',
        materialName: '泡沫填充物D型',
        containerCode: 'FC-004',
        containerType: '编织袋',
        locationCode: '1-4-2-1',
        area: '辅材库区',
        quantity: 50,
        palletTime: '2024-01-15 08:45:00',
        inboundTime: '2024-01-15 09:30:00',
        age: 20,
        status: '正常'
    },
    {
        id: 5,
        materialCode: 'FC-2024-005',
        materialName: '清洁剂E型',
        containerCode: 'FC-005',
        containerType: '塑料桶',
        locationCode: '2-1-2-1',
        area: '辅材库区',
        quantity: 20,
        palletTime: '2024-01-18 13:10:00',
        inboundTime: '2024-01-18 13:55:00',
        age: 17,
        status: '正常'
    },
    {
        id: 6,
        materialCode: 'FC-2024-006',
        materialName: '润滑油F型',
        containerCode: 'FC-006',
        containerType: '塑料桶',
        locationCode: '2-2-2-1',
        area: '辅材库区',
        quantity: 30,
        palletTime: '2024-01-20 10:25:00',
        inboundTime: '2024-01-20 11:10:00',
        age: 15,
        status: '锁定'
    },
    {
        id: 7,
        materialCode: 'FC-2024-007',
        materialName: '防护手套G型',
        containerCode: 'FC-007',
        containerType: '纸箱',
        locationCode: '2-3-2-1',
        area: '辅材库区',
        quantity: 100,
        palletTime: '2024-01-22 15:40:00',
        inboundTime: '2024-01-22 16:25:00',
        age: 13,
        status: '正常'
    },
    {
        id: 8,
        materialCode: 'FC-2024-008',
        materialName: '工具配件H型',
        containerCode: 'FC-008',
        containerType: '工具箱',
        locationCode: '2-4-2-1',
        area: '辅材库区',
        quantity: 80,
        palletTime: '2024-01-25 09:50:00',
        inboundTime: '2024-01-25 10:35:00',
        age: 10,
        status: '正常'
    },
    {
        id: 9,
        materialCode: 'FC-2024-009',
        materialName: '办公用品I型',
        containerCode: 'FC-009',
        containerType: '纸箱',
        locationCode: '3-1-2-1',
        area: '辅材库区',
        quantity: 150,
        palletTime: '2024-01-28 12:15:00',
        inboundTime: '2024-01-28 13:00:00',
        age: 7,
        status: '正常'
    },
    {
        id: 10,
        materialCode: 'FC-2024-010',
        materialName: '维修材料J型',
        containerCode: 'FC-010',
        containerType: '工具箱',
        locationCode: '3-2-2-1',
        area: '辅材库区',
        quantity: 60,
        palletTime: '2024-02-01 14:30:00',
        inboundTime: '2024-02-01 15:15:00',
        age: 3,
        status: '正常'
    },
    {
        id: 11,
        materialCode: 'FC-2024-011',
        materialName: '安全标识K型',
        containerCode: 'FC-011',
        containerType: '纸箱',
        locationCode: '3-3-2-1',
        area: '辅材库区',
        quantity: 300,
        palletTime: '2024-02-03 11:20:00',
        inboundTime: '2024-02-03 12:05:00',
        age: 1,
        status: '正常'
    },
    {
        id: 12,
        materialCode: 'FC-2024-012',
        materialName: '化学试剂L型',
        containerCode: 'FC-012',
        containerType: '防爆箱',
        locationCode: '3-4-2-1',
        area: '辅材库区',
        quantity: 10,
        palletTime: '2024-02-02 16:45:00',
        inboundTime: '2024-02-02 17:30:00',
        age: 2,
        status: '锁定'
    }
];

// 分页配置
let currentPage = 1;
const pageSize = 10;
let filteredData = [...auxiliaryData];
let selectedItems = new Set();

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    renderTable();
    initEventListeners();
});

// 渲染表格
function renderTable() {
    const tbody = document.getElementById('auxiliaryTableBody');
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = filteredData.slice(start, end);

    tbody.innerHTML = pageData.map(item => {
        const ageClass = item.age > 30 ? 'age-danger' : item.age > 15 ? 'age-warning' : 'age-normal';
        const statusClass = item.status === '锁定' ? 'locked' : 'normal';
        
        return `
        <tr class="${selectedItems.has(item.id) ? 'selected' : ''}">
            <td><input type="checkbox" class="item-checkbox" value="${item.id}" ${selectedItems.has(item.id) ? 'checked' : ''}></td>
            <td>${item.materialCode}</td>
            <td>${item.materialName}</td>
            <td>${item.containerCode}</td>
            <td>${item.containerType}</td>
            <td>${item.locationCode}</td>
            <td>${item.area}</td>
            <td>${item.quantity}</td>
            <td>${item.palletTime}</td>
            <td>${item.inboundTime}</td>
            <td class="${ageClass}">${item.age}</td>
            <td><span class="status-badge ${statusClass}">${item.status}</span></td>
        </tr>
    `}).join('');

    // 绑定复选框事件
    tbody.querySelectorAll('.item-checkbox').forEach(cb => {
        cb.addEventListener('change', function() {
            const id = parseInt(this.value);
            const row = this.closest('tr');
            
            if (this.checked) {
                selectedItems.add(id);
                row.classList.add('selected');
            } else {
                selectedItems.delete(id);
                row.classList.remove('selected');
            }
            updateSelectAll();
        });
    });

    updatePagination();
    updateSelectAll();
}

// 更新分页
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / pageSize);
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages || 1;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage >= totalPages;
}

// 更新全选状态
function updateSelectAll() {
    const checkboxes = document.querySelectorAll('.item-checkbox');
    const checkedCount = document.querySelectorAll('.item-checkbox:checked').length;
    const selectAll = document.getElementById('selectAll');
    
    if (checkboxes.length > 0) {
        selectAll.checked = checkedCount === checkboxes.length;
        selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
    } else {
        selectAll.checked = false;
        selectAll.indeterminate = false;
    }
}

// 初始化事件监听
function initEventListeners() {
    // 查询按钮
    document.getElementById('searchBtn').addEventListener('click', searchAuxiliary);
    
    // 重置按钮
    document.getElementById('resetBtn').addEventListener('click', resetSearch);
    
    // 全选
    document.getElementById('selectAll').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.item-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = this.checked;
            const id = parseInt(cb.value);
            const row = cb.closest('tr');
            
            if (this.checked) {
                selectedItems.add(id);
                row.classList.add('selected');
            } else {
                selectedItems.delete(id);
                row.classList.remove('selected');
            }
        });
    });
    
    // 物料锁定
    document.getElementById('lockBtn').addEventListener('click', lockMaterials);
    
    // 物料解锁
    document.getElementById('unlockBtn').addEventListener('click', unlockMaterials);
    
    // 清空库存
    document.getElementById('clearBtn').addEventListener('click', clearInventory);
    
    // 导出
    document.getElementById('exportBtn').addEventListener('click', exportData);
    
    // 分页按钮
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            selectedItems.clear();
            renderTable();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            selectedItems.clear();
            renderTable();
        }
    });
}

// 查询辅材
function searchAuxiliary() {
    const material = document.getElementById('searchMaterial').value.trim().toLowerCase();
    const container = document.getElementById('searchContainer').value.trim().toLowerCase();
    const status = document.getElementById('searchStatus').value;
    const row = document.getElementById('searchRow').value.trim();
    const col = document.getElementById('searchCol').value.trim();
    const level = document.getElementById('searchLevel').value.trim();
    const depth = document.getElementById('searchDepth').value.trim();
    
    filteredData = auxiliaryData.filter(item => {
        const matchMaterial = !material || 
            item.materialCode.toLowerCase().includes(material) || 
            item.materialName.toLowerCase().includes(material);
        const matchContainer = !container || item.containerCode.toLowerCase().includes(container);
        const matchStatus = !status || item.status === status;
        
        // 解析库位编码
        const locationParts = item.locationCode.split('-');
        const matchRow = !row || locationParts[0] === row;
        const matchCol = !col || locationParts[1] === col;
        const matchLevel = !level || locationParts[2] === level;
        const matchDepth = !depth || locationParts[3] === depth;
        
        return matchMaterial && matchContainer && matchStatus && 
               matchRow && matchCol && matchLevel && matchDepth;
    });
    
    currentPage = 1;
    selectedItems.clear();
    renderTable();
}

// 重置查询
function resetSearch() {
    document.getElementById('searchMaterial').value = '';
    document.getElementById('searchContainer').value = '';
    document.getElementById('searchStatus').value = '';
    document.getElementById('searchRow').value = '';
    document.getElementById('searchCol').value = '';
    document.getElementById('searchLevel').value = '';
    document.getElementById('searchDepth').value = '';
    
    filteredData = [...auxiliaryData];
    currentPage = 1;
    selectedItems.clear();
    renderTable();
}

// 物料锁定
function lockMaterials() {
    if (selectedItems.size === 0) {
        alert('请至少选择一条辅材记录！');
        return;
    }
    
    // 检查是否有已锁定的辅材
    const selectedData = auxiliaryData.filter(item => selectedItems.has(item.id));
    const alreadyLocked = selectedData.filter(item => item.status === '锁定');
    
    if (alreadyLocked.length > 0) {
        alert(`选中的记录中有 ${alreadyLocked.length} 条已经是锁定状态！`);
        return;
    }
    
    if (confirm(`确定要锁定选中的 ${selectedItems.size} 条辅材记录吗？\n\n锁定后，这些辅材将不可出库。`)) {
        selectedItems.forEach(id => {
            const item = auxiliaryData.find(i => i.id === id);
            if (item) {
                item.status = '锁定';
            }
        });
        
        alert(`成功锁定 ${selectedItems.size} 条辅材记录！`);
        selectedItems.clear();
        renderTable();
    }
}

// 物料解锁
function unlockMaterials() {
    if (selectedItems.size === 0) {
        alert('请至少选择一条辅材记录！');
        return;
    }
    
    // 检查是否有正常状态的辅材
    const selectedData = auxiliaryData.filter(item => selectedItems.has(item.id));
    const alreadyNormal = selectedData.filter(item => item.status === '正常');
    
    if (alreadyNormal.length > 0) {
        alert(`选中的记录中有 ${alreadyNormal.length} 条已经是正常状态！`);
        return;
    }
    
    if (confirm(`确定要解锁选中的 ${selectedItems.size} 条辅材记录吗？\n\n解锁后，这些辅材将可以正常出库。`)) {
        selectedItems.forEach(id => {
            const item = auxiliaryData.find(i => i.id === id);
            if (item) {
                item.status = '正常';
            }
        });
        
        alert(`成功解锁 ${selectedItems.size} 条辅材记录！`);
        selectedItems.clear();
        renderTable();
    }
}

// 清空库存
function clearInventory() {
    if (selectedItems.size === 0) {
        alert('请至少选择一条辅材记录！');
        return;
    }
    
    const selectedData = auxiliaryData.filter(item => selectedItems.has(item.id));
    const materialList = selectedData.map(item => 
        `${item.materialName}(${item.materialCode}) - 容器${item.containerCode} - 数量${item.quantity}`
    ).join('\n');
    
    if (confirm(`确定要清空选中的 ${selectedItems.size} 条辅材记录吗？\n\n将清空以下辅材：\n${materialList}\n\n此操作不可恢复！`)) {
        // 从数据中删除选中的记录
        auxiliaryData = auxiliaryData.filter(item => !selectedItems.has(item.id));
        filteredData = filteredData.filter(item => !selectedItems.has(item.id));
        
        alert(`成功清空 ${selectedItems.size} 条辅材记录！`);
        selectedItems.clear();
        
        // 如果当前页没有数据了，返回上一页
        const totalPages = Math.ceil(filteredData.length / pageSize);
        if (currentPage > totalPages && currentPage > 1) {
            currentPage = totalPages;
        }
        
        renderTable();
    }
}

// 导出数据
function exportData() {
    if (filteredData.length === 0) {
        alert('没有可导出的数据！');
        return;
    }
    
    // 构建CSV内容
    const headers = [
        '物料编码', '物料名称', '容器编码', '容器类型', '库位编码', 
        '库区', '库存数量', '组盘时间', '入库时间', '库龄(天)', '库存状态'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    filteredData.forEach(item => {
        const row = [
            item.materialCode,
            item.materialName,
            item.containerCode,
            item.containerType,
            item.locationCode,
            item.area,
            item.quantity,
            item.palletTime,
            item.inboundTime,
            item.age,
            item.status
        ];
        csvContent += row.join(',') + '\n';
    });
    
    // 创建下载链接
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', `辅材明细_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`成功导出 ${filteredData.length} 条辅材记录！`);
}