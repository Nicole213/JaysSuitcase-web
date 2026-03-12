// AGV平库通道管理脚本

class AGVChannelManager {
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
            this.saveChannel();
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
        document.getElementById('channelModal').addEventListener('click', (e) => {
            if (e.target.id === 'channelModal') {
                this.hideModal();
            }
        });

        // 回车搜索
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

    // 加载模拟数据
    loadMockData() {
        this.mockData = [
            {
                id: 1,
                channelCode: 'CH001',
                channelName: 'AGV平库通道001',
                belongArea: 'AREA001',
                belongAreaName: 'AGV平库库区001',
                locationStructure: '单深',
                status: '启用',
                remark: '主要通道，高频使用',
                createTime: '2024-01-15 10:30:00'
            },
            {
                id: 2,
                channelCode: 'CH002',
                channelName: 'AGV平库通道002',
                belongArea: 'AREA001',
                belongAreaName: 'AGV平库库区001',
                locationStructure: '双深',
                status: '启用',
                remark: '双深位存储通道',
                createTime: '2024-01-16 14:20:00'
            },
            {
                id: 3,
                channelCode: 'CH003',
                channelName: 'AGV平库通道003',
                belongArea: 'AREA002',
                belongAreaName: 'AGV平库库区002',
                locationStructure: '单深',
                status: '禁用',
                remark: '维护中，暂停使用',
                createTime: '2024-01-17 09:15:00'
            },
            {
                id: 4,
                channelCode: 'CH004',
                channelName: 'AGV平库通道004',
                belongArea: 'AREA002',
                belongAreaName: 'AGV平库库区002',
                locationStructure: '双深',
                status: '启用',
                remark: '备用通道',
                createTime: '2024-01-18 16:45:00'
            },
            {
                id: 5,
                channelCode: 'CH005',
                channelName: 'AGV平库通道005',
                belongArea: 'AREA003',
                belongAreaName: 'AGV平库库区003',
                locationStructure: '单深',
                status: '启用',
                remark: '新建通道',
                createTime: '2024-01-19 11:30:00'
            },
            {
                id: 6,
                channelCode: 'CH006',
                channelName: 'AGV平库通道006',
                belongArea: 'AREA003',
                belongAreaName: 'AGV平库库区003',
                locationStructure: '双深',
                status: '启用',
                remark: '扩展通道',
                createTime: '2024-01-20 08:45:00'
            }
        ];

        this.loadData();
    }

    // 搜索
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

    // 重置搜索
    resetSearch() {
        document.getElementById('searchCode').value = '';
        document.getElementById('searchName').value = '';
        document.getElementById('areaFilter').value = '';
        document.getElementById('statusFilter').value = '';
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
        const tbody = document.getElementById('channelTableBody');
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8">
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
                <td>${item.locationStructure}</td>
                <td>
                    <span class="status-badge ${item.status === '启用' ? 'enabled' : 'disabled'}">
                        ${item.status}
                    </span>
                </td>
                <td>${item.remark || '-'}</td>
                <td>${item.createTime}</td>
                <td>
                    <div class="action-btns">
                        <button class="edit-btn" onclick="agvChannelManager.editChannel(${item.id})">
                            编辑
                        </button>
                        <button class="delete-btn" onclick="agvChannelManager.deleteChannel(${item.id})">
                            删除
                        </button>
                        <button class="${item.status === '启用' ? 'disable-btn' : 'enable-btn'}" 
                                onclick="agvChannelManager.toggleStatus(${item.id})">
                            ${item.status === '启用' ? '禁用' : '启用'}
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
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
        document.getElementById('modalTitle').textContent = '新增AGV平库通道';
        document.getElementById('channelCode').disabled = false;
        this.resetForm();
        this.showModal();
    }

    // 编辑通道
    editChannel(id) {
        const item = this.mockData.find(d => d.id === id);
        if (!item) return;

        this.editingId = id;
        document.getElementById('modalTitle').textContent = '编辑AGV平库通道';
        document.getElementById('channelCode').disabled = true; // 编辑时通道编码不可修改
        
        // 填充表单
        document.getElementById('channelCode').value = item.channelCode;
        document.getElementById('channelName').value = item.channelName;
        document.getElementById('belongArea').value = item.belongArea;
        document.getElementById('locationStructure').value = item.locationStructure;
        document.getElementById('status').value = item.status;
        document.getElementById('remark').value = item.remark || '';

        this.showModal();
    }

    // 删除通道
    deleteChannel(id) {
        const item = this.mockData.find(d => d.id === id);
        if (!item) return;

        if (confirm(`确定要删除通道"${item.channelName}"吗？\n删除后将无法恢复。`)) {
            const index = this.mockData.findIndex(d => d.id === id);
            if (index > -1) {
                this.mockData.splice(index, 1);
                this.loadData();
                this.showMessage('删除成功', 'success');
            }
        }
    }

    // 切换状态
    toggleStatus(id) {
        const item = this.mockData.find(d => d.id === id);
        if (!item) return;

        const newStatus = item.status === '启用' ? '禁用' : '启用';
        
        if (newStatus === '禁用') {
            // 禁用时显示特殊提示
            this.showConfirmDialog(
                '确认禁用通道',
                `禁用后堆垛机将不再执行该巷道的出入库任务，是否确认？\n\n通道：${item.channelName}`,
                () => {
                    item.status = newStatus;
                    this.loadData();
                    this.showMessage('禁用成功', 'success');
                }
            );
        } else {
            // 启用时的普通确认
            if (confirm(`确定要启用通道"${item.channelName}"吗？\n启用后将恢复正常任务分配。`)) {
                item.status = newStatus;
                this.loadData();
                this.showMessage('启用成功', 'success');
            }
        }
    }

    // 显示确认对话框
    showConfirmDialog(title, message, onConfirm) {
        // 创建确认对话框
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

        // 绑定事件
        dialog.querySelector('#confirmCancel').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        dialog.querySelector('#confirmOk').addEventListener('click', () => {
            document.body.removeChild(dialog);
            onConfirm();
        });

        // 点击外部关闭
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                document.body.removeChild(dialog);
            }
        });
    }

    // 显示弹窗
    showModal() {
        const modal = document.getElementById('channelModal');
        modal.style.display = 'flex';
        modal.classList.add('active');
    }

    // 隐藏弹窗
    hideModal() {
        const modal = document.getElementById('channelModal');
        modal.style.display = 'none';
        modal.classList.remove('active');
        this.resetForm();
    }

    // 重置表单
    resetForm() {
        document.getElementById('channelForm').reset();
        document.getElementById('channelCode').disabled = false;
    }

    // 保存通道
    saveChannel() {
        // 获取表单数据
        const channelCode = document.getElementById('channelCode').value.trim();
        const channelName = document.getElementById('channelName').value.trim();
        const belongArea = document.getElementById('belongArea').value;
        const locationStructure = document.getElementById('locationStructure').value;
        const status = document.getElementById('status').value;
        const remark = document.getElementById('remark').value.trim();

        // 验证必填字段
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

        if (!locationStructure) {
            this.showMessage('请选择库位结构', 'error');
            return;
        }

        // 检查通道编码是否重复
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
            locationStructure,
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
            // 编辑
            const index = this.mockData.findIndex(d => d.id === this.editingId);
            if (index > -1) {
                this.mockData[index] = { ...this.mockData[index], ...channelData };
                this.showMessage('修改成功', 'success');
            }
        } else {
            // 新增
            const newId = Math.max(...this.mockData.map(d => d.id)) + 1;
            this.mockData.push({ id: newId, ...channelData });
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
let agvChannelManager;
document.addEventListener('DOMContentLoaded', () => {
    agvChannelManager = new AGVChannelManager();
});