// AGV平库库区管理脚本

class AGVFlatAreaManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalCount = 0;
        this.totalPages = 1;
        this.searchParams = {};
        this.editingId = null;
        this.channelOptions = [];
        this.locationOptions = [];

        this.init();
        this.loadMockData();
    }

    init() {
        this.initOptions();
        this.bindEvents();
    }

    initOptions() {
        this.channelOptions = [
            { id: 'PK001-01', name: 'PK001-01' },
            { id: 'PK001-02', name: 'PK001-02' },
            { id: 'PK002-01', name: 'PK002-01' },
            { id: 'PK002-02', name: 'PK002-02' },
            { id: 'PK003-01', name: 'PK003-01' },
            { id: 'PK004-01', name: 'PK004-01' },
            { id: 'PK005-01', name: 'PK005-01' },
            { id: 'PK005-02', name: 'PK005-02' }
        ];

        this.locationOptions = [
            { id: 1, areaCode: 'PK001', locationCode: 'PK001-01-001', channelId: 'PK001-01', channelName: 'PK001-01', currentStatus: '有货', enableStatus: '启用', remark: '主入库位' },
            { id: 2, areaCode: 'PK001', locationCode: 'PK001-02-001', channelId: 'PK001-02', channelName: 'PK001-02', currentStatus: '空库位', enableStatus: '启用', remark: '待分配' },
            { id: 3, areaCode: 'PK001', locationCode: 'PK001-02-002', channelId: 'PK001-02', channelName: 'PK001-02', currentStatus: '已分配', enableStatus: '启用', remark: '待上架' },
            { id: 4, areaCode: 'PK002', locationCode: 'PK002-01-001', channelId: 'PK002-01', channelName: 'PK002-01', currentStatus: '有货', enableStatus: '启用', remark: '高频出库位' },
            { id: 5, areaCode: 'PK002', locationCode: 'PK002-02-001', channelId: 'PK002-02', channelName: 'PK002-02', currentStatus: '空托', enableStatus: '启用', remark: '空托缓存' },
            { id: 6, areaCode: 'PK003', locationCode: 'PK003-01-001', channelId: 'PK003-01', channelName: 'PK003-01', currentStatus: '空库位', enableStatus: '禁用', remark: '维护中' },
            { id: 7, areaCode: 'PK004', locationCode: 'PK004-01-001', channelId: 'PK004-01', channelName: 'PK004-01', currentStatus: '有货', enableStatus: '启用', remark: '成品暂存' }
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
            this.saveAgvArea();
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

        document.getElementById('agvAreaModal').addEventListener('click', (e) => {
            if (e.target.id === 'agvAreaModal') {
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

    loadMockData() {
        this.mockData = [
            {
                id: 1,
                areaCode: 'PK001',
                areaName: 'AGV平库库区001',
                relatedChannels: ['PK001-01', 'PK001-02'],
                relatedChannelNames: ['PK001-01', 'PK001-02'],
                status: '启用',
                remark: '主作业库区',
                createTime: '2024-01-15 10:30:00'
            },
            {
                id: 2,
                areaCode: 'PK002',
                areaName: 'AGV平库库区002',
                relatedChannels: ['PK002-01', 'PK002-02'],
                relatedChannelNames: ['PK002-01', 'PK002-02'],
                status: '启用',
                remark: '成品出库缓冲区',
                createTime: '2024-01-16 14:20:00'
            },
            {
                id: 3,
                areaCode: 'PK003',
                areaName: 'AGV平库库区003',
                relatedChannels: ['PK003-01'],
                relatedChannelNames: ['PK003-01'],
                status: '禁用',
                remark: '维护停用库区',
                createTime: '2024-01-17 09:15:00'
            },
            {
                id: 4,
                areaCode: 'PK004',
                areaName: 'AGV平库库区004',
                relatedChannels: ['PK004-01'],
                relatedChannelNames: ['PK004-01'],
                status: '启用',
                remark: '高频周转库区',
                createTime: '2024-01-18 16:45:00'
            },
            {
                id: 5,
                areaCode: 'PK005',
                areaName: 'AGV平库库区005',
                relatedChannels: [],
                relatedChannelNames: [],
                status: '启用',
                remark: '预留扩展库区',
                createTime: '2024-01-19 11:30:00'
            }
        ];

        this.loadData();
    }

    search() {
        const searchCode = document.getElementById('searchCode').value.trim();
        const searchName = document.getElementById('searchName').value.trim();
        const statusFilter = document.getElementById('statusFilter').value;

        this.searchParams = {
            searchCode,
            searchName,
            statusFilter
        };

        this.currentPage = 1;
        this.loadData();
    }

    resetSearch() {
        document.getElementById('searchCode').value = '';
        document.getElementById('searchName').value = '';
        document.getElementById('statusFilter').value = '';
        this.searchParams = {};
        this.currentPage = 1;
        this.loadData();
    }

    loadData() {
        let filteredData = [...this.mockData];

        if (this.searchParams.searchCode) {
            filteredData = filteredData.filter(item =>
                item.areaCode.toLowerCase().includes(this.searchParams.searchCode.toLowerCase())
            );
        }

        if (this.searchParams.searchName) {
            filteredData = filteredData.filter(item =>
                item.areaName.toLowerCase().includes(this.searchParams.searchName.toLowerCase())
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
        const tbody = document.getElementById('agvAreaTableBody');
        tbody.innerHTML = '';

        if (!data.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <div class="empty-icon">📦</div>
                            <div class="empty-text">暂无数据</div>
                            <div class="empty-desc">没有找到符合条件的AGV平库库区</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.areaCode}</td>
                <td>${item.areaName}</td>
                <td>
                    <span class="status-badge ${item.status === '启用' ? 'enabled' : 'disabled'}">
                        ${item.status}
                    </span>
                </td>
                <td>${item.remark || '-'}</td>
                <td>${item.createTime}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-link" onclick="agvFlatAreaManager.editAgvArea(${item.id})">编辑</button>
                        <button class="action-link danger" onclick="agvFlatAreaManager.deleteAgvArea(${item.id})">删除</button>
                        <button class="action-link ${item.status === '启用' ? 'warning' : 'success'}"
                            onclick="agvFlatAreaManager.toggleStatus(${item.id})">
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
        document.getElementById('modalTitle').textContent = '新增AGV平库库区';
        this.resetForm();
        this.showModal();
    }

    editAgvArea(id) {
        const item = this.mockData.find(data => data.id === id);
        if (!item) {
            return;
        }

        this.editingId = id;
        document.getElementById('modalTitle').textContent = '编辑AGV平库库区';
        document.getElementById('areaCode').value = item.areaCode;
        document.getElementById('areaCode').disabled = true;
        document.getElementById('areaName').value = item.areaName;
        document.getElementById('status').value = item.status;
        document.getElementById('remark').value = item.remark || '';
        this.showModal();
    }

    deleteAgvArea(id) {
        const item = this.mockData.find(data => data.id === id);
        if (!item) {
            return;
        }

        const hasRelatedChannels = item.relatedChannels.length > 0;
        const hasRelatedLocations = this.locationOptions.some(location => location.areaCode === item.areaCode);

        if (hasRelatedChannels || hasRelatedLocations) {
            this.showAlertDialog(
                '删除提示',
                '请先删除关联通道/库位'
            );
            return;
        }

        this.showConfirmDialog(
            '确认删除库区',
            `确定要删除库区"${item.areaName}"吗？\n删除后将无法恢复。`,
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
            const confirmed = confirm('禁用后AGV将不再执行该库区的出入库任务，是否确认？');
            if (!confirmed) {
                return;
            }
            item.status = '禁用';
            this.loadData();
            this.showMessage('禁用成功', 'success');
            return;
        }

        const confirmed = confirm(`确定要启用库区"${item.areaName}"吗？启用后将恢复正常任务分配。`);
        if (!confirmed) {
            return;
        }

        item.status = '启用';
        this.loadData();
        this.showMessage('启用成功', 'success');
    }

    showModal() {
        const modal = document.getElementById('agvAreaModal');
        modal.style.display = 'flex';
        modal.classList.add('active');
    }

    hideModal() {
        const modal = document.getElementById('agvAreaModal');
        modal.style.display = 'none';
        modal.classList.remove('active');
        this.resetForm();
    }

    resetForm() {
        document.getElementById('agvAreaForm').reset();
        document.getElementById('areaCode').disabled = false;
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

    saveAgvArea() {
        const areaCode = document.getElementById('areaCode').value.trim();
        const areaName = document.getElementById('areaName').value.trim();
        const status = document.getElementById('status').value;
        const remark = document.getElementById('remark').value.trim();

        if (!areaCode) {
            this.showMessage('请输入库区编码', 'error');
            return;
        }

        if (!areaName) {
            this.showMessage('请输入库区名称', 'error');
            return;
        }

        const existingItem = this.mockData.find(item =>
            item.areaCode === areaCode && item.id !== this.editingId
        );

        if (existingItem) {
            this.showMessage('库区编码已存在', 'error');
            return;
        }

        const areaData = {
            areaCode,
            areaName,
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
                areaData.createTime = this.mockData[index].createTime;
                areaData.relatedChannels = [...this.mockData[index].relatedChannels];
                areaData.relatedChannelNames = [...this.mockData[index].relatedChannelNames];
                this.mockData[index] = { ...this.mockData[index], ...areaData };
                this.showMessage('修改成功', 'success');
            }
        } else {
            const newId = this.mockData.length
                ? Math.max(...this.mockData.map(item => item.id)) + 1
                : 1;
            areaData.relatedChannels = [];
            areaData.relatedChannelNames = [];
            this.mockData.push({ id: newId, ...areaData });
            this.showMessage('新增成功', 'success');
        }

        this.hideModal();
        this.loadData();
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

let agvFlatAreaManager;
document.addEventListener('DOMContentLoaded', () => {
    agvFlatAreaManager = new AGVFlatAreaManager();
});
