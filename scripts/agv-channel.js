// AGV平库通道管理脚本

class AGVChannelManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalCount = 0;
        this.totalPages = 1;
        this.searchParams = {};
        this.editingId = null;
        this.areaOptions = [];
        this.locationOptions = [];

        this.init();
        this.loadMockData();
    }

    init() {
        this.initOptions();
        this.bindEvents();
        this.loadAreaOptions();
    }

    initOptions() {
        this.areaOptions = [
            { id: 'PK001', name: 'PK001' },
            { id: 'PK002', name: 'PK002' },
            { id: 'PK003', name: 'PK003' },
            { id: 'PK004', name: 'PK004' },
            { id: 'PK005', name: 'PK005' }
        ];

        this.locationOptions = [
            { id: 'PK001-01-001', name: 'PK001-01-001', areaId: 'PK001', areaName: 'PK001', currentStatus: '有货', enableStatus: '启用' },
            { id: 'PK001-01-002', name: 'PK001-01-002', areaId: 'PK001', areaName: 'PK001', currentStatus: '空库位', enableStatus: '启用' },
            { id: 'PK001-02-001', name: 'PK001-02-001', areaId: 'PK001', areaName: 'PK001', currentStatus: '已分配', enableStatus: '启用' },
            { id: 'PK002-01-001', name: 'PK002-01-001', areaId: 'PK002', areaName: 'PK002', currentStatus: '有货', enableStatus: '启用' },
            { id: 'PK002-02-001', name: 'PK002-02-001', areaId: 'PK002', areaName: 'PK002', currentStatus: '空托', enableStatus: '启用' },
            { id: 'PK003-01-001', name: 'PK003-01-001', areaId: 'PK003', areaName: 'PK003', currentStatus: '空库位', enableStatus: '禁用' },
            { id: 'PK004-01-001', name: 'PK004-01-001', areaId: 'PK004', areaName: 'PK004', currentStatus: '有货', enableStatus: '启用' },
            { id: 'PK005-01-001', name: 'PK005-01-001', areaId: 'PK005', areaName: 'PK005', currentStatus: '空库位', enableStatus: '启用' }
        ];
    }

    bindEvents() {
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.search();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSearch();
        });

        document.getElementById('addBtn').addEventListener('click', () => {
            this.showAddModal();
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveChannel();
        });

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

        document.getElementById('channelModal').addEventListener('click', (e) => {
            if (e.target.id === 'channelModal') {
                this.hideModal();
            }
        });

        document.getElementById('searchCode').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.search();
            }
        });

        document.getElementById('searchName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.search();
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.multi-select')) {
                document.querySelectorAll('.multi-select').forEach(select => {
                    select.classList.remove('active');
                });
            }
        });
    }

    loadAreaOptions() {
        const areaFilterSelect = document.getElementById('areaFilter');
        const belongAreaSelect = document.getElementById('belongArea');

        this.areaOptions.forEach(area => {
            const filterOption = document.createElement('option');
            filterOption.value = area.id;
            filterOption.textContent = area.name;
            areaFilterSelect.appendChild(filterOption);

            const formOption = document.createElement('option');
            formOption.value = area.id;
            formOption.textContent = area.name;
            belongAreaSelect.appendChild(formOption);
        });
    }

    loadMockData() {
        this.mockData = [
            {
                id: 1,
                channelCode: 'PK001-01',
                channelName: 'AGV平库通道001',
                belongArea: 'PK001',
                belongAreaName: 'PK001',
                relatedLocations: ['PK001-01-001', 'PK001-01-002'],
                relatedLocationNames: ['PK001-01-001', 'PK001-01-002'],
                status: '启用',
                remark: '主作业通道',
                createTime: '2024-01-15 10:30:00'
            },
            {
                id: 2,
                channelCode: 'PK001-02',
                channelName: 'AGV平库通道002',
                belongArea: 'PK001',
                belongAreaName: 'PK001',
                relatedLocations: ['PK001-02-001'],
                relatedLocationNames: ['PK001-02-001'],
                status: '启用',
                remark: '入库缓冲通道',
                createTime: '2024-01-16 14:20:00'
            },
            {
                id: 3,
                channelCode: 'PK002-01',
                channelName: 'AGV平库通道003',
                belongArea: 'PK002',
                belongAreaName: 'PK002',
                relatedLocations: ['PK002-01-001'],
                relatedLocationNames: ['PK002-01-001'],
                status: '禁用',
                remark: '维护中',
                createTime: '2024-01-17 09:15:00'
            },
            {
                id: 4,
                channelCode: 'PK002-02',
                channelName: 'AGV平库通道004',
                belongArea: 'PK002',
                belongAreaName: 'PK002',
                relatedLocations: ['PK002-02-001'],
                relatedLocationNames: ['PK002-02-001'],
                status: '启用',
                remark: '出库缓存通道',
                createTime: '2024-01-18 16:45:00'
            },
            {
                id: 5,
                channelCode: 'PK003-01',
                channelName: 'AGV平库通道005',
                belongArea: 'PK003',
                belongAreaName: 'PK003',
                relatedLocations: ['PK003-01-001'],
                relatedLocationNames: ['PK003-01-001'],
                status: '启用',
                remark: '质检专用通道',
                createTime: '2024-01-19 11:30:00'
            },
            {
                id: 6,
                channelCode: 'PK004-01',
                channelName: 'AGV平库通道006',
                belongArea: 'PK004',
                belongAreaName: 'PK004',
                relatedLocations: ['PK004-01-001'],
                relatedLocationNames: ['PK004-01-001'],
                status: '启用',
                remark: '成品周转通道',
                createTime: '2024-01-20 08:45:00'
            }
        ];

        this.loadData();
    }

    search() {
        const searchCode = document.getElementById('searchCode').value.trim();
        const searchName = document.getElementById('searchName').value.trim();
        const areaFilter = document.getElementById('areaFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;

        this.searchParams = {
            searchCode,
            searchName,
            areaFilter,
            statusFilter
        };

        this.currentPage = 1;
        this.loadData();
    }

    resetSearch() {
        document.getElementById('searchCode').value = '';
        document.getElementById('searchName').value = '';
        document.getElementById('areaFilter').value = '';
        document.getElementById('statusFilter').value = '';
        this.searchParams = {};
        this.currentPage = 1;
        this.loadData();
    }

    loadData() {
        let filteredData = [...this.mockData];

        if (this.searchParams.searchCode) {
            filteredData = filteredData.filter(item =>
                item.channelCode.toLowerCase().includes(this.searchParams.searchCode.toLowerCase())
            );
        }

        if (this.searchParams.searchName) {
            filteredData = filteredData.filter(item =>
                item.channelName.toLowerCase().includes(this.searchParams.searchName.toLowerCase())
            );
        }

        if (this.searchParams.areaFilter) {
            filteredData = filteredData.filter(item =>
                item.belongArea === this.searchParams.areaFilter
            );
        }

        if (this.searchParams.statusFilter) {
            filteredData = filteredData.filter(item =>
                item.status === this.searchParams.statusFilter
            );
        }

        this.totalCount = filteredData.length;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize) || 1;

        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageData = filteredData.slice(startIndex, endIndex);

        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
            return this.loadData();
        }

        this.renderTable(pageData);
        this.updatePagination();
    }

    renderTable(data) {
        const tbody = document.getElementById('channelTableBody');
        tbody.innerHTML = '';

        if (!data.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <div class="empty-icon">🚇</div>
                            <div class="empty-text">暂无数据</div>
                            <div class="empty-desc">没有找到符合条件的AGV平库通道</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.channelCode}</td>
                <td>${item.channelName}</td>
                <td>${item.belongAreaName}</td>
                <td>
                    <span class="status-badge ${item.status === '启用' ? 'enabled' : 'disabled'}">
                        ${item.status}
                    </span>
                </td>
                <td>${item.remark || '-'}</td>
                <td>${item.createTime}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-link" onclick="agvChannelManager.editChannel(${item.id})">编辑</button>
                        <button class="action-link danger" onclick="agvChannelManager.deleteChannel(${item.id})">删除</button>
                        <button class="action-link ${item.status === '启用' ? 'warning' : 'success'}"
                            onclick="agvChannelManager.toggleStatus(${item.id})">
                            ${item.status === '启用' ? '禁用' : '启用'}
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updatePagination() {
        document.getElementById('currentPage').textContent = this.currentPage;
        document.getElementById('totalPages').textContent = this.totalPages;
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage === this.totalPages || this.totalCount === 0;
    }

    goToPage(page) {
        if (page < 1 || page > this.totalPages) {
            return;
        }
        this.currentPage = page;
        this.loadData();
    }

    showAddModal() {
        this.editingId = null;
        document.getElementById('modalTitle').textContent = '新增AGV平库通道';
        this.resetForm();
        this.showModal();
    }

    editChannel(id) {
        const item = this.mockData.find(data => data.id === id);
        if (!item) {
            return;
        }

        this.editingId = id;
        document.getElementById('modalTitle').textContent = '编辑AGV平库通道';
        document.getElementById('channelCode').value = item.channelCode;
        document.getElementById('channelCode').disabled = true;
        document.getElementById('channelName').value = item.channelName;
        document.getElementById('belongArea').value = item.belongArea;
        document.getElementById('status').value = item.status;
        document.getElementById('remark').value = item.remark || '';
        this.showModal();
    }

    deleteChannel(id) {
        const item = this.mockData.find(data => data.id === id);
        if (!item) {
            return;
        }

        if (item.relatedLocations.length > 0) {
            this.showAlertDialog(
                '删除提示',
                '请先删除关联库位'
            );
            return;
        }

        this.showConfirmDialog(
            '确认删除通道',
            `确定要删除通道"${item.channelName}"吗？\n删除后将无法恢复。`,
            () => {
                const index = this.mockData.findIndex(data => data.id === id);
                if (index > -1) {
                    this.mockData.splice(index, 1);
                    this.adjustCurrentPageAfterMutation();
                    this.loadData();
                    this.showMessage('删除成功', 'success');
                }
            }
        );
    }

    toggleStatus(id) {
        const item = this.mockData.find(data => data.id === id);
        if (!item) {
            return;
        }

        if (item.status === '启用') {
            this.showConfirmDialog(
                '确认禁用通道',
                '禁用后AGV将不再执行该通道的出入库任务，是否确认？',
                () => {
                    item.status = '禁用';
                    this.loadData();
                    this.showMessage('禁用成功', 'success');
                }
            );
            return;
        }

        const confirmed = confirm(`确定要启用通道"${item.channelName}"吗？启用后将恢复正常任务分配。`);
        if (!confirmed) {
            return;
        }

        item.status = '启用';
        this.loadData();
        this.showMessage('启用成功', 'success');
    }

    showModal() {
        const modal = document.getElementById('channelModal');
        modal.style.display = 'flex';
        modal.classList.add('active');
    }

    hideModal() {
        const modal = document.getElementById('channelModal');
        modal.style.display = 'none';
        modal.classList.remove('active');
        this.resetForm();
    }

    resetForm() {
        document.getElementById('channelForm').reset();
        document.getElementById('channelCode').disabled = false;
    }

    saveChannel() {
        const channelCode = document.getElementById('channelCode').value.trim();
        const channelName = document.getElementById('channelName').value.trim();
        const belongArea = document.getElementById('belongArea').value;
        const status = document.getElementById('status').value;
        const remark = document.getElementById('remark').value.trim();

        if (!channelCode) {
            this.showMessage('请输入通道编码', 'error');
            return;
        }

        if (!channelName) {
            this.showMessage('请输入通道名称', 'error');
            return;
        }

        if (!belongArea) {
            this.showMessage('请选择所属库区', 'error');
            return;
        }

        const existingItem = this.mockData.find(item =>
            item.channelCode === channelCode && item.id !== this.editingId
        );

        if (existingItem) {
            this.showMessage('通道编码已存在', 'error');
            return;
        }

        const belongAreaName = document.querySelector(`#belongArea option[value="${belongArea}"]`).textContent;
        const channelData = {
            channelCode,
            channelName,
            belongArea,
            belongAreaName,
            status,
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
            const index = this.mockData.findIndex(item => item.id === this.editingId);
            if (index > -1) {
                channelData.createTime = this.mockData[index].createTime;
                channelData.relatedLocations = [...this.mockData[index].relatedLocations];
                channelData.relatedLocationNames = [...this.mockData[index].relatedLocationNames];
                this.mockData[index] = { ...this.mockData[index], ...channelData };
                this.showMessage('修改成功', 'success');
            }
        } else {
            const newId = this.mockData.length
                ? Math.max(...this.mockData.map(item => item.id)) + 1
                : 1;
            channelData.relatedLocations = [];
            channelData.relatedLocationNames = [];
            this.mockData.push({ id: newId, ...channelData });
            this.showMessage('新增成功', 'success');
        }

        this.hideModal();
        this.loadData();
    }

    showConfirmDialog(title, message, onConfirm) {
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog active';
        dialog.innerHTML = `
            <div class="confirm-content">
                <div class="confirm-title">${title}</div>
                <div class="confirm-message">${message.replace(/\n/g, '<br>')}</div>
                <div class="confirm-actions">
                    <button class="confirm-btn secondary" id="confirmCancel">取消</button>
                    <button class="confirm-btn primary" id="confirmOk">确认</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        dialog.querySelector('#confirmCancel').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        dialog.querySelector('#confirmOk').addEventListener('click', () => {
            document.body.removeChild(dialog);
            onConfirm();
        });

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                document.body.removeChild(dialog);
            }
        });
    }

    showAlertDialog(title, message) {
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog active';
        dialog.innerHTML = `
            <div class="confirm-content">
                <div class="confirm-title">${title}</div>
                <div class="confirm-message">${message.replace(/\n/g, '<br>')}</div>
                <div class="confirm-actions">
                    <button class="confirm-btn info" id="alertOk">确定</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        dialog.querySelector('#alertOk').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                document.body.removeChild(dialog);
            }
        });
    }

    adjustCurrentPageAfterMutation() {
        const remainingPages = Math.ceil((this.totalCount - 1) / this.pageSize) || 1;
        if (this.currentPage > remainingPages) {
            this.currentPage = remainingPages;
        }
    }

    showMessage(message, type = 'info') {
        const existingMessage = document.querySelector('.toast-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageEl = document.createElement('div');
        messageEl.className = `toast-message toast-${type}`;
        messageEl.textContent = message;
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

let agvChannelManager;
document.addEventListener('DOMContentLoaded', () => {
    agvChannelManager = new AGVChannelManager();
});
