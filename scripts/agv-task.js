// AGV任务管理页面脚本

// 模拟AGV任务数据
let agvTaskData = [
    {
        id: 1,
        taskNo: 'AGV-TASK-RK-2024-0001-001',
        orderNo: 'RK-2024-0001',
        commandType: '搬运',
        taskType: '入库搬运',
        agvNo: 'AGV-001',
        description: '搬运容器TP-001至入库口1',
        startLocation: '充电桩1',
        targetLocation: '入库口1',
        currentLocation: '入库口1',
        batteryLevel: 85,
        status: '已完成',
        createTime: '2024-01-17 15:20:00',
        startTime: '2024-01-17 15:22:00',
        completeTime: '2024-01-17 15:28:00',
        errorReason: '',
        isUrgent: false
    },
    {
        id: 2,
        taskNo: 'AGV-TASK-RK-2024-0002-001',
        orderNo: 'RK-2024-0002',
        commandType: '搬运',
        taskType: '入库搬运',
        agvNo: 'AGV-002',
        description: '搬运容器TP-002至入库口2',
        startLocation: '待机区A',
        targetLocation: '入库口2',
        currentLocation: '通道3',
        batteryLevel: 72,
        status: '执行中',
        createTime: '2024-01-17 16:00:00',
        startTime: '2024-01-17 16:02:00',
        completeTime: '-',
        errorReason: '',
        isUrgent: false
    },
    {
        id: 3,
        taskNo: 'AGV-TASK-CK-2024-0001-001',
        orderNo: 'CK-2024-0001',
        commandType: '搬运',
        taskType: '出库搬运',
        agvNo: 'AGV-001',
        description: '搬运容器TP-001至出库口1',
        startLocation: '库位1-5-12-1',
        targetLocation: '出库口1',
        currentLocation: '出库口1',
        batteryLevel: 78,
        status: '已完成',
        createTime: '2024-01-18 09:00:00',
        startTime: '2024-01-18 09:02:00',
        completeTime: '2024-01-18 09:08:00',
        errorReason: '',
        isUrgent: false
    },
    {
        id: 4,
        taskNo: 'AGV-TASK-CK-2024-0002-001',
        orderNo: 'CK-2024-0002',
        commandType: '搬运',
        taskType: '出库搬运',
        agvNo: 'AGV-003',
        description: '搬运容器TP-003至出库口2',
        startLocation: '库位1-3-8-1',
        targetLocation: '出库口2',
        currentLocation: '库位1-3-8-1',
        batteryLevel: 65,
        status: '待执行',
        createTime: '2024-01-18 10:30:00',
        startTime: '-',
        completeTime: '-',
        errorReason: '',
        isUrgent: false
    },
    {
        id: 5,
        taskNo: 'AGV-TASK-MOVE-001',
        orderNo: '-',
        commandType: '搬运',
        taskType: '库内搬运',
        agvNo: 'AGV-002',
        description: '搬运空托盘至待机区',
        startLocation: '出库口1',
        targetLocation: '待机区B',
        currentLocation: '出库口1',
        batteryLevel: 45,
        status: '已完成',
        createTime: '2024-01-19 14:00:00',
        startTime: '2024-01-19 14:02:00',
        completeTime: '2024-01-19 14:06:00',
        errorReason: '',
        isUrgent: false
    },
    {
        id: 6,
        taskNo: 'AGV-TASK-CHARGE-001',
        orderNo: '-',
        commandType: '充电',
        taskType: '充电任务',
        agvNo: 'AGV-002',
        description: 'AGV-002充电任务',
        startLocation: '待机区B',
        targetLocation: '充电桩2',
        currentLocation: '充电桩2',
        batteryLevel: 95,
        status: '已完成',
        createTime: '2024-01-19 15:00:00',
        startTime: '2024-01-19 15:02:00',
        completeTime: '2024-01-19 16:30:00',
        errorReason: '',
        isUrgent: false
    },
    {
        id: 7,
        taskNo: 'AGV-TASK-ERROR-001',
        orderNo: 'CK-2024-0003',
        commandType: '搬运',
        taskType: '出库搬运',
        agvNo: 'AGV-004',
        description: '搬运容器TP-006至出库口1',
        startLocation: '库位3-2-7-1',
        targetLocation: '出库口1',
        currentLocation: '通道5',
        batteryLevel: 55,
        status: '异常',
        createTime: '2024-01-20 11:00:00',
        startTime: '2024-01-20 11:02:00',
        completeTime: '-',
        errorReason: '路径阻塞',
        isUrgent: false
    },
    {
        id: 8,
        taskNo: 'AGV-TASK-CK-2024-0004-001',
        orderNo: 'CK-2024-0004',
        commandType: '搬运',
        taskType: '出库搬运',
        agvNo: 'AGV-001',
        description: '搬运容器TP-007至出库口1',
        startLocation: '库位1-8-12-2',
        targetLocation: '出库口1',
        currentLocation: '待机区A',
        batteryLevel: 88,
        status: '待执行',
        createTime: '2024-01-20 13:30:00',
        startTime: '-',
        completeTime: '-',
        errorReason: '',
        isUrgent: true
    },
    {
        id: 9,
        taskNo: 'AGV-TASK-EMPTY-001',
        orderNo: '-',
        commandType: '搬运',
        taskType: '空载搬运',
        agvNo: 'AGV-003',
        description: 'AGV-003空载返回待机区',
        startLocation: '出库口2',
        targetLocation: '待机区A',
        currentLocation: '待机区A',
        batteryLevel: 62,
        status: '已完成',
        createTime: '2024-01-21 09:00:00',
        startTime: '2024-01-21 09:01:00',
        completeTime: '2024-01-21 09:04:00',
        errorReason: '',
        isUrgent: false
    },
    {
        id: 10,
        taskNo: 'AGV-TASK-STANDBY-001',
        orderNo: '-',
        commandType: '待机',
        taskType: '待机任务',
        agvNo: 'AGV-004',
        description: 'AGV-004待机任务',
        startLocation: '通道5',
        targetLocation: '待机区C',
        currentLocation: '待机区C',
        batteryLevel: 30,
        status: '已取消',
        createTime: '2024-01-21 10:00:00',
        startTime: '-',
        completeTime: '-',
        errorReason: '',
        isUrgent: false
    }
];

// 分页配置
let currentPage = 1;
const pageSize = 10;
let filteredData = [...agvTaskData];
let forceCompleteTaskId = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    renderTable();
    initEventListeners();
});

// 渲染表格
function renderTable() {
    const tbody = document.getElementById('agvTaskTableBody');
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = filteredData.slice(start, end);

    tbody.innerHTML = pageData.map(task => {
        const statusClass = getStatusClass(task.status);
        const commandClass = getCommandClass(task.commandType);
        const batteryClass = getBatteryClass(task.batteryLevel);
        
        // 操作按钮
        let actions = [];
        if (task.status === '待执行') {
            if (!task.isUrgent) {
                actions.push(`<button class="urgent-btn" onclick="urgentTask(${task.id})">置顶</button>`);
            }
            actions.push(`<button class="cancel-btn" onclick="cancelTask(${task.id})">取消</button>`);
        }
        if (task.status === '执行中' || task.status === '异常') {
            actions.push(`<button class="force-btn" onclick="forceComplete(${task.id})">强制完成</button>`);
        }
        
        return `
        <tr>
            <td>
                ${task.taskNo}
                ${task.isUrgent ? '<span class="urgent-flag">置顶</span>' : ''}
            </td>
            <td>${task.orderNo}</td>
            <td><span class="command-badge ${commandClass}">${task.commandType}</span></td>
            <td><span class="task-type-badge">${task.taskType}</span></td>
            <td>${task.agvNo}</td>
            <td class="task-description">${task.description}</td>
            <td>${task.startLocation}</td>
            <td>${task.targetLocation}</td>
            <td>${task.currentLocation}</td>
            <td><span class="battery-level ${batteryClass}">${task.batteryLevel}%</span></td>
            <td><span class="status-badge ${statusClass}">${task.status}</span></td>
            <td>${task.createTime}</td>
            <td>${task.startTime}</td>
            <td>${task.completeTime}</td>
            <td>${task.errorReason ? `<span class="error-reason">${task.errorReason}</span>` : '-'}</td>
            <td>
                <div class="action-btns">
                    ${actions.join('')}
                </div>
            </td>
        </tr>
    `}).join('');

    updatePagination();
}

// 获取状态样式类
function getStatusClass(status) {
    const statusMap = {
        '待执行': 'pending',
        '执行中': 'processing',
        '已完成': 'completed',
        '异常': 'error',
        '已取消': 'cancelled'
    };
    return statusMap[status] || 'pending';
}

// 获取命令类型样式类
function getCommandClass(commandType) {
    const commandMap = {
        '搬运': 'transport',
        '充电': 'charge',
        '待机': 'standby'
    };
    return commandMap[commandType] || 'transport';
}

// 获取电量样式类
function getBatteryClass(batteryLevel) {
    if (batteryLevel >= 70) return 'battery-high';
    if (batteryLevel >= 30) return 'battery-medium';
    return 'battery-low';
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
    document.getElementById('searchBtn').addEventListener('click', searchTasks);
    
    // 重置按钮
    document.getElementById('resetBtn').addEventListener('click', resetSearch);
    
    // 导出按钮
    document.getElementById('exportBtn').addEventListener('click', exportData);
    
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
    
    // 强制完成弹窗
    document.getElementById('forceClose').addEventListener('click', closeForceModal);
    document.getElementById('forceSaveBtn').addEventListener('click', saveForceComplete);
    document.getElementById('forceCancelBtn').addEventListener('click', closeForceModal);
    
    // 点击弹窗外部关闭
    document.getElementById('forceCompleteModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeForceModal();
        }
    });
}

// 查询任务
function searchTasks() {
    const taskNo = document.getElementById('searchTaskNo').value.trim().toLowerCase();
    const orderNo = document.getElementById('searchOrderNo').value.trim().toLowerCase();
    const commandType = document.getElementById('searchCommandType').value;
    const taskType = document.getElementById('searchTaskType').value;
    const agvNo = document.getElementById('searchAgvNo').value.trim().toLowerCase();
    const status = document.getElementById('searchStatus').value;
    const createStartDate = document.getElementById('searchCreateStartDate').value;
    const createEndDate = document.getElementById('searchCreateEndDate').value;
    const completeStartDate = document.getElementById('searchCompleteStartDate').value;
    const completeEndDate = document.getElementById('searchCompleteEndDate').value;
    
    filteredData = agvTaskData.filter(task => {
        const matchTaskNo = !taskNo || task.taskNo.toLowerCase().includes(taskNo);
        const matchOrderNo = !orderNo || task.orderNo.toLowerCase().includes(orderNo);
        const matchCommandType = !commandType || task.commandType === commandType;
        const matchTaskType = !taskType || task.taskType === taskType;
        const matchAgvNo = !agvNo || task.agvNo.toLowerCase().includes(agvNo);
        const matchStatus = !status || task.status === status;
        
        // 创建时间筛选
        let matchCreateDate = true;
        if (createStartDate || createEndDate) {
            const taskDate = task.createTime.split(' ')[0];
            if (createStartDate && taskDate < createStartDate) matchCreateDate = false;
            if (createEndDate && taskDate > createEndDate) matchCreateDate = false;
        }
        
        // 完成时间筛选
        let matchCompleteDate = true;
        if (completeStartDate || completeEndDate) {
            if (task.completeTime === '-') {
                matchCompleteDate = false;
            } else {
                const completeDate = task.completeTime.split(' ')[0];
                if (completeStartDate && completeDate < completeStartDate) matchCompleteDate = false;
                if (completeEndDate && completeDate > completeEndDate) matchCompleteDate = false;
            }
        }
        
        return matchTaskNo && matchOrderNo && matchCommandType && matchTaskType && 
               matchAgvNo && matchStatus && matchCreateDate && matchCompleteDate;
    });
    
    currentPage = 1;
    renderTable();
}

// 重置查询
function resetSearch() {
    document.getElementById('searchTaskNo').value = '';
    document.getElementById('searchOrderNo').value = '';
    document.getElementById('searchCommandType').value = '';
    document.getElementById('searchTaskType').value = '';
    document.getElementById('searchAgvNo').value = '';
    document.getElementById('searchStatus').value = '';
    document.getElementById('searchCreateStartDate').value = '';
    document.getElementById('searchCreateEndDate').value = '';
    document.getElementById('searchCompleteStartDate').value = '';
    document.getElementById('searchCompleteEndDate').value = '';
    
    filteredData = [...agvTaskData];
    currentPage = 1;
    renderTable();
}

// 置顶任务
function urgentTask(id) {
    const task = agvTaskData.find(t => t.id === id);
    if (!task) return;
    
    if (task.status !== '待执行') {
        alert('只有待执行状态的任务可以置顶！');
        return;
    }
    
    if (confirm(`确定要将任务"${task.taskNo}"设置为置顶吗？\n\n置顶后该任务将优先执行。`)) {
        task.isUrgent = true;
        alert('任务已设置为置顶！');
        renderTable();
    }
}

// 取消任务
function cancelTask(id) {
    const task = agvTaskData.find(t => t.id === id);
    if (!task) return;
    
    if (task.status !== '待执行') {
        alert('只有待执行状态的任务可以取消！');
        return;
    }
    
    if (confirm(`确定要取消任务"${task.taskNo}"吗？\n\n取消后该任务将不再执行。`)) {
        task.status = '已取消';
        task.isUrgent = false;
        alert('任务已取消！');
        renderTable();
    }
}

// 强制完成
function forceComplete(id) {
    const task = agvTaskData.find(t => t.id === id);
    if (!task) return;
    
    if (task.status !== '执行中' && task.status !== '异常') {
        alert('只有执行中或异常状态的任务可以强制完成！');
        return;
    }
    
    forceCompleteTaskId = id;
    document.getElementById('forceReason').value = '';
    document.getElementById('forceCompleteModal').classList.add('active');
}

// 保存强制完成
function saveForceComplete() {
    const reason = document.getElementById('forceReason').value;
    
    if (!reason) {
        alert('请选择强制完成原因！');
        return;
    }
    
    const task = agvTaskData.find(t => t.id === forceCompleteTaskId);
    if (task) {
        task.status = '已完成';
        task.completeTime = getCurrentTime();
        task.errorReason = `强制完成-${reason}`;
        
        alert(`任务已强制完成！\n\n系统将自动更新任务状态，默认该任务已按照任务内容执行。`);
        closeForceModal();
        renderTable();
    }
}

// 关闭强制完成弹窗
function closeForceModal() {
    document.getElementById('forceCompleteModal').classList.remove('active');
    forceCompleteTaskId = null;
}

// 获取当前时间
function getCurrentTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 导出数据
function exportData() {
    if (filteredData.length === 0) {
        alert('没有可导出的数据！');
        return;
    }
    
    // 构建CSV内容
    const headers = [
        '任务号', '关联单据号', '命令类型', '任务类型', 'AGV编号', '任务描述',
        '起始位置', '目标位置', '当前位置', '电量(%)', '状态', 
        '创建时间', '开始时间', '完成时间', '异常原因', '是否置顶'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    filteredData.forEach(task => {
        const row = [
            task.taskNo,
            task.orderNo,
            task.commandType,
            task.taskType,
            task.agvNo,
            task.description,
            task.startLocation,
            task.targetLocation,
            task.currentLocation,
            task.batteryLevel,
            task.status,
            task.createTime,
            task.startTime,
            task.completeTime,
            task.errorReason || '-',
            task.isUrgent ? '是' : '否'
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
    link.setAttribute('download', `AGV任务管理_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`成功导出 ${filteredData.length} 条AGV任务记录！`);
}