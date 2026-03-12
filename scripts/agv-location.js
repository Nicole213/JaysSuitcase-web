// AGV平库库位管理脚本

class AGVLocationManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalCount = 0;
        this.totalPages = 1;
        this.searchParams = {};
        this.editingId = null;
        
        this.init();
        this.loadMockData();
    }

    init() {
        this.bindEvents();
        this.loadAreaOptions();
        this.loadChannelOptions();
    }

    bindEvents() {
        // 查询按钮
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.search();
        });

        // 重置按钮
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSearch();
        });

        // 新增按钮
        document.getElementById('addBtn').addEventListener('click', () => {
            this.showAddModal();
        });

        // 弹窗关闭
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideModal();
        });

        // 保存按钮
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveLocation();
        });

        // 分页按钮
        document.getElementById('prevPage').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.goToPage(this.currentPage - 1);
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.goToPage(this.currentPage + 1);
            }
        });

        // 点击弹窗外部关闭
        document.getElementById('locationModal').addEventListener('click', (e) => {
            if (e.target.id === 'locationModal') {
                this.hideModal();
            }
        });

        // 回车搜索
        document.getElementById('searchCode').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.search();
            }
        });

        // 是否AGV站点变化时控制站点类型
        document.getElementById('isAgvSite').addEventListener('change', (e) => {
            const siteTypeSelect = document.getElementById('siteType');
            if (e.target.value === '是') {
                siteTypeSelect.disabled = false;
            } else {
                siteTypeSelect.disabled = true;
                siteTypeSelect.value = '';
            }
        });
    }

    // 加载库区选项
    loadAreaOptions() {
        const areaFilterSelect = document.getElementById('areaFilter');
        const belongAreaSelect = document.getElementById('belongArea');
        
        const mockAreas = [
            { id: 'AREA001', name: 'AGV平库库区001' },
            { id: 'AREA002', name: 'AGV平库库区002' },
            { id: 'AREA003', name: 'AGV平库库区003' },
            { id: 'AREA004', name: 'AGV平库库区004' },
            { id: 'AREA005', name: 'AGV平库库区005' }
        ];

        mockAreas.forEach(area => {
            // 筛选下拉框
            const filterOption = document.createElement('option');
            filterOption.value = area.id;
            filterOption.textContent = area.name;
            areaFilterSelect.appendChild(filterOption);

            // 表单下拉框
            const formOption = document.createElement('option');
            formOption.value = area.id;
            formOption.textContent = area.name;
            belongAreaSelect.appendChild(formOption);
        });
    }

    // 加载通道选项
    loadChannelOptions() {
        const channelFilterSelect = document.getElementById('channelFilter');
        const channelSelect = document.getElementById('channel');
        
        const mockChannels = [
            { id: 'CH001', name: 'AGV平库通道001' },
            { id: 'CH002', name: 'AGV平库通道002' },
            { id: 'CH003', name: 'AGV平库通道003' },
            { id: 'CH004', name: 'AGV平库通道004' },
            { id: 'CH005', name: 'AGV平库通道005' },
            { id: 'CH006', name: 'AGV平库通道006' }
        ];

        mockChannels.forEach(channel => {
            // 筛选下拉框
            const filterOption = document.createElement('option');
            filterOption.value = channel.id;
            filterOption.textContent = channel.name;
            channelFilterSelect.appendChild(filterOption);

            // 表单下拉框
            const formOption = document.createElement('option');
            formOption.value = channel.id;
            formOption.textContent = channel.name;
            channelSelect.appendChild(formOption);
        });
    }

    // 加载模拟数据
    loadMockData() {
        this.mockData = [
            {
                id: 1,
                locationCode: 'LOC001-01-01',
                belongArea: 'AREA001',
                belongAreaName: 'AGV平库库区001',
                channel: 'CH001',
                channelName: 'AGV平库通道001',
                currentStatus: '有货',
                lockStatus: '正常',
                enableStatus: '启用',
                containerNo: 'CNT2024001',
                isAgvSite: '是',
                siteType: '入库站点',
                remark: '主要入库库位',
                createTime: '2024-01-15 10:30:00'
            },
            {
                id: 2,
                locationCode: 'LOC001-01-02',
                belongArea: 'AREA001',
                belongAreaName: 'AGV平库库区001',
                channel: 'CH001',
                channelName: 'AGV平库通道001',
                currentStatus: '空库位',
                lockStatus: '正常',
                enableStatus: '启用',
                containerNo: '',
                isAgvSite: '否',
                siteType: '',
                remark: '',
                createTime: '2024-01-15 10:31:00'
            },
            {
                id: 3,
                locationCode: 'LOC001-02-01',
                belongArea: 'AREA001',
                belongAreaName: 'AGV平库库区001',
                channel: 'CH002',
                channelName: 'AGV平库通道002',
                currentStatus: '已分配',
                lockStatus: '锁定',
                enableStatus: '启用',
                containerNo: '',
                isAgvSite: '是',
                siteType: '出库站点',
                remark: '预分配库位',
                createTime: '2024-01-16 14:20:00'
            },
            {
                id: 4,
                locationCode: 'LOC002-01-01',
                belongArea: 'AREA002',
                belongAreaName: 'AGV平库库区002',
                channel: 'CH003',
                channelName: 'AGV平库通道003',
                currentStatus: '空托',
                lockStatus: '正常',
                enableStatus: '禁用',
                containerNo: 'CNT2024002',
                isAgvSite: '是',
                siteType: '缓存站点',
                remark: '维护中',
                createTime: '2024-01-17 09:15:00'
            },
            {
                id: 5,
                locationCode: 'LOC002-01-02',
                belongArea: 'AREA002',
                belongAreaName: 'AGV平库库区002',
                channel: 'CH003',
                channelName: 'AGV平库通道003',
                currentStatus: '有货',
                lockStatus: '正常',
                enableStatus: '启用',
                containerNo: 'CNT2024003',
                isAgvSite: '否',
                siteType: '',
                remark: '常规存储库位',
                createTime: '2024-01-18 16:45:00'
            },
            {
                id: 6,
                locationCode: 'LOC003-01-01',
                belongArea: 'AREA003',
                belongAreaName: 'AGV平库库区003',
                channel: 'CH005',
                channelName: 'AGV平库通道005',
                currentStatus: '空库位',
                lockStatus: '正常',
                enableStatus: '启用',
                containerNo: '',
                isAgvSite: '是',
                siteType: '检测站点',
                remark: '质检专用库位',
                createTime: '2024-01-19 11:30:00'
            },
            {
                id: 7,
                locationCode: 'LOC003-02-01',
                belongArea: 'AREA003',
                belongAreaName: 'AGV平库库区003',
                channel: 'CH006',
                channelName: 'AGV平库通道006',
                currentStatus: '有货',
                lockStatus: '锁定',
                enableStatus: '启用',
                containerNo: 'CNT2024004',
                isAgvSite: '否',
                siteType: '',
                remark: '临时锁定',
                createTime: '2024-01-20 08:45:00'
            },
            {
                id: 8,
                locationCode: 'LOC001-01-03',
                belongArea: 'AREA001',
                belongAreaName: 'AGV平库库区001',
                channel: 'CH001',
                channelName: 'AGV平库通道001',
                currentStatus: '空托',
                lockStatus: '正常',
                enableStatus: '启用',
                containerNo: 'CNT2024005',
                isAgvSite: '是',
                siteType: '入库站点',
                remark: '空托待用',
                createTime: '2024-01-21 15:20:00'
            }
        ];

        this.loadData();
    }
    // 搜索
    search() {
        const searchCode = document.getElementById('searchCode').value.trim();
        const areaFilter = document.getElementById('areaFilter').value;
        const channelFilter = document.getElementById('channelFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const lockFilter = document.getElementById('lockFilter').value;

        this.searchParams = {
            searchCode,
            areaFilter,
            channelFilter,
            statusFilter,
            lockFilter
        };

        this.currentPage = 1;
        this.loadData();
    }

    // 重置搜索
    resetSearch() {
        document.getElementById('searchCode').value = '';
        document.getElementById('areaFilter').value = '';
        document.getElementById('channelFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('lockFilter').value = '';
        this.searchParams = {};
        this.currentPage = 1;
        this.loadData();
    }

    // 加载数据
    loadData() {
        let filteredData = [...this.mockData];

        // 应用搜索条件
        if (this.searchParams.searchCode) {
            filteredData = filteredData.filter(item => 
                item.locationCode.toLowerCase().includes(this.searchParams.searchCode.toLowerCase())
            );
        }

        if (this.searchParams.areaFilter) {
            filteredData = filteredData.filter(item => 
                item.belongArea === this.searchParams.areaFilter
            );
        }

        if (this.searchParams.channelFilter) {
            filteredData = filteredData.filter(item => 
                item.channel === this.searchParams.channelFilter
            );
        }

        if (this.searchParams.statusFilter) {
            filteredData = filteredData.filter(item => 
                item.currentStatus === this.searchParams.statusFilter
            );
        }

        if (this.searchParams.lockFilter) {
            filteredData = filteredData.filter(item => 
                item.lockStatus === this.searchParams.lockFilter
            );
        }

        // 计算分页
        this.totalCount = filteredData.length;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageData = filteredData.slice(startIndex, endIndex);

        this.renderTable(pageData);
        this.updatePagination();
    }

    // 渲染表格
    renderTable(data) {
        const tbody = document.getElementById('locationTableBody');
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10">
                        <div class="empty-state">
                            <div class="empty-icon">📦</div>
                            <div class="empty-text">暂无数据</div>
                            <div class="empty-desc">没有找到符合条件的AGV平库库位</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.locationCode}</td>
                <td>${item.belongAreaName}</td>
                <td>${item.channelName}</td>
                <td>
                    <span class="status-badge ${this.getStatusClass(item.currentStatus)}">
                        ${item.currentStatus}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${item.lockStatus === '锁定' ? 'lock-locked' : 'lock-normal'}">
                        ${item.lockStatus}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${item.enableStatus === '启用' ? 'enable-enabled' : 'enable-disabled'}">
                        ${item.enableStatus}
                    </span>
                </td>
                <td>${item.containerNo || '-'}</td>
                <td>
                    <span class="status-badge ${item.isAgvSite === '是' ? 'agv-site-yes' : 'agv-site-no'}">
                        ${item.isAgvSite}
                    </span>
                </td>
                <td>
                    ${item.siteType ? `<span class="site-type-badge ${this.getSiteTypeClass(item.siteType)}">${item.siteType}</span>` : '-'}
                </td>
                <td>
                    <div class="action-btns">
                        <button class="edit-btn" onclick="agvLocationManager.editLocation(${item.id})">
                            编辑
                        </button>
                        <button class="delete-btn" onclick="agvLocationManager.deleteLocation(${item.id})">
                            删除
                        </button>
                        <button class="${item.enableStatus === '启用' ? 'disable-btn' : 'enable-btn'}" 
                                onclick="agvLocationManager.toggleEnable(${item.id})">
                            ${item.enableStatus === '启用' ? '禁用' : '启用'}
                        </button>
                        <button class="${item.lockStatus === '锁定' ? 'unlock-btn' : 'lock-btn'}" 
                                onclick="agvLocationManager.toggleLock(${item.id})">
                            ${item.lockStatus === '锁定' ? '解锁' : '锁定'}
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // 获取状态样式类
    getStatusClass(status) {
        const statusMap = {
            '空库位': 'status-empty',
            '有货': 'status-occupied',
            '已分配': 'status-allocated',
            '空托': 'status-empty-tray'
        };
        return statusMap[status] || 'status-empty';
    }

    // 获取站点类型样式类
    getSiteTypeClass(siteType) {
        const typeMap = {
            '入库站点': 'site-inbound',
            '出库站点': 'site-outbound',
            '缓存站点': 'site-buffer',
            '检测站点': 'site-check'
        };
        return typeMap[siteType] || '';
    }

    // 更新分页信息
    updatePagination() {
        document.getElementById('currentPage').textContent = this.currentPage;
        document.getElementById('totalPages').textContent = this.totalPages;

        // 更新分页按钮状态
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage === this.totalPages || this.totalPages === 0;
    }

    // 跳转页面
    goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.loadData();
    }

    // 显示新增弹窗
    showAddModal() {
        this.editingId = null;
        document.getElementById('modalTitle').textContent = '新增AGV平库库位';
        document.getElementById('locationCode').disabled = false;
        this.resetForm();
        this.showModal();
    }

    // 编辑库位
    editLocation(id) {
        const item = this.mockData.find(d => d.id === id);
        if (!item) return;

        this.editingId = id;
        document.getElementById('modalTitle').textContent = '编辑AGV平库库位';
        document.getElementById('locationCode').disabled = false; // 根据需求，这里可以设为true禁用编辑
        
        // 填充表单
        document.getElementById('locationCode').value = item.locationCode;
        document.getElementById('belongArea').value = item.belongArea;
        document.getElementById('channel').value = item.channel;
        document.getElementById('currentStatus').value = item.currentStatus;
        document.getElementById('containerNo').value = item.containerNo || '';
        document.getElementById('isAgvSite').value = item.isAgvSite;
        document.getElementById('siteType').value = item.siteType || '';
        document.getElementById('enableStatus').value = item.enableStatus;
        document.getElementById('remark').value = item.remark || '';

        // 控制站点类型字段
        const siteTypeSelect = document.getElementById('siteType');
        if (item.isAgvSite === '是') {
            siteTypeSelect.disabled = false;
        } else {
            siteTypeSelect.disabled = true;
        }

        this.showModal();
    }

    // 删除库位
    deleteLocation(id) {
        const item = this.mockData.find(d => d.id === id);
        if (!item) return;

        if (confirm(`确定要删除库位"${item.locationCode}"吗？\n删除后将无法恢复。`)) {
            const index = this.mockData.findIndex(d => d.id === id);
            if (index > -1) {
                this.mockData.splice(index, 1);
                this.loadData();
                this.showMessage('删除成功', 'success');
            }
        }
    }

    // 切换启用状态
    toggleEnable(id) {
        const item = this.mockData.find(d => d.id === id);
        if (!item) return;

        const newStatus = item.enableStatus === '启用' ? '禁用' : '启用';
        const action = newStatus === '启用' ? '启用' : '禁用';

        if (confirm(`确定要${action}库位"${item.locationCode}"吗？`)) {
            item.enableStatus = newStatus;
            this.loadData();
            this.showMessage(`${action}成功`, 'success');
        }
    }

    // 切换锁定状态
    toggleLock(id) {
        const item = this.mockData.find(d => d.id === id);
        if (!item) return;

        const newStatus = item.lockStatus === '锁定' ? '正常' : '锁定';
        const action = newStatus === '锁定' ? '锁定' : '解锁';

        if (confirm(`确定要${action}库位"${item.locationCode}"吗？`)) {
            item.lockStatus = newStatus;
            this.loadData();
            this.showMessage(`${action}成功`, 'success');
        }
    }

    // 显示弹窗
    showModal() {
        const modal = document.getElementById('locationModal');
        modal.style.display = 'flex';
        modal.classList.add('active');
    }

    // 隐藏弹窗
    hideModal() {
        const modal = document.getElementById('locationModal');
        modal.style.display = 'none';
        modal.classList.remove('active');
        this.resetForm();
    }

    // 重置表单
    resetForm() {
        document.getElementById('locationForm').reset();
        document.getElementById('locationCode').disabled = false;
        document.getElementById('siteType').disabled = true;
        document.getElementById('currentStatus').value = '空库位';
        document.getElementById('enableStatus').value = '启用';
        document.getElementById('isAgvSite').value = '否';
    }

    // 保存库位
    saveLocation() {
        // 获取表单数据
        const locationCode = document.getElementById('locationCode').value.trim();
        const belongArea = document.getElementById('belongArea').value;
        const channel = document.getElementById('channel').value;
        const currentStatus = document.getElementById('currentStatus').value;
        const containerNo = document.getElementById('containerNo').value.trim();
        const isAgvSite = document.getElementById('isAgvSite').value;
        const siteType = document.getElementById('siteType').value;
        const enableStatus = document.getElementById('enableStatus').value;
        const remark = document.getElementById('remark').value.trim();

        // 验证必填字段
        if (!locationCode) {
            this.showMessage('请输入库位编码', 'error');
            return;
        }

        if (!belongArea) {
            this.showMessage('请选择所属库区', 'error');
            return;
        }

        if (!channel) {
            this.showMessage('请选择通道', 'error');
            return;
        }

        // 检查库位编码是否重复
        const existingItem = this.mockData.find(item => 
            item.locationCode === locationCode && item.id !== this.editingId
        );

        if (existingItem) {
            this.showMessage('库位编码已存在', 'error');
            return;
        }

        // 验证有货状态必须有容器号
        if (currentStatus === '有货' && !containerNo) {
            this.showMessage('有货状态必须填写容器号', 'error');
            return;
        }

        // 验证AGV站点必须选择站点类型
        if (isAgvSite === '是' && !siteType) {
            this.showMessage('AGV站点必须选择站点类型', 'error');
            return;
        }

        const belongAreaName = document.querySelector(`#belongArea option[value="${belongArea}"]`).textContent;
        const channelName = document.querySelector(`#channel option[value="${channel}"]`).textContent;

        const locationData = {
            locationCode,
            belongArea,
            belongAreaName,
            channel,
            channelName,
            currentStatus,
            lockStatus: '正常', // 新建库位默认正常状态
            enableStatus,
            containerNo: containerNo || null,
            isAgvSite,
            siteType: siteType || null,
            remark: remark || null,
            createTime: new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }).replace(/\//g, '-')
        };

        if (this.editingId) {
            // 编辑
            const index = this.mockData.findIndex(d => d.id === this.editingId);
            if (index > -1) {
                this.mockData[index] = { ...this.mockData[index], ...locationData };
                this.showMessage('修改成功', 'success');
            }
        } else {
            // 新增
            const newId = Math.max(...this.mockData.map(d => d.id)) + 1;
            this.mockData.push({ id: newId, ...locationData });
            this.showMessage('新增成功', 'success');
        }

        this.hideModal();
        this.loadData();
    }

    // 显示消息
    showMessage(message, type = 'info') {
        // 移除已存在的消息
        const existingMessage = document.querySelector('.toast-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `toast-message toast-${type}`;
        messageEl.textContent = message;
        
        // 设置样式
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease;
        `;

        // 设置背景色
        switch (type) {
            case 'success':
                messageEl.style.backgroundColor = '#52c41a';
                break;
            case 'error':
                messageEl.style.backgroundColor = '#ff4d4f';
                break;
            case 'warning':
                messageEl.style.backgroundColor = '#faad14';
                messageEl.style.color = '#000';
                break;
            default:
                messageEl.style.backgroundColor = '#1890ff';
        }

        document.body.appendChild(messageEl);

        // 3秒后自动移除
        setTimeout(() => {
            messageEl.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 初始化管理器
let agvLocationManager;
document.addEventListener('DOMContentLoaded', () => {
    agvLocationManager = new AGVLocationManager();
});