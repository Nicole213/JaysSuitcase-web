// AGV平库库区管理脚本

class AGVFlatAreaManager {
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
        this.loadStationOptions();
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
            this.saveAgvArea();
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
        document.getElementById('agvAreaModal').addEventListener('click', (e) => {
            if (e.target.id === 'agvAreaModal') {
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

    // 加载库台选项
    loadStationOptions() {
        const stationSelect = document.getElementById('boundStation');
        const mockStations = [
            { id: 'ST001', name: '库台001' },
            { id: 'ST002', name: '库台002' },
            { id: 'ST003', name: '库台003' },
            { id: 'ST004', name: '库台004' },
            { id: 'ST005', name: '库台005' }
        ];

        mockStations.forEach(station => {
            const option = document.createElement('option');
            option.value = station.id;
            option.textContent = station.name;
            stationSelect.appendChild(option);
        });
    }

    // 加载模拟数据
    loadMockData() {
        this.mockData = [
            {
                id: 1,
                aisleCode: 'AGV001',
                aisleName: 'AGV平库巷道001',
                locationStructure: '单深',
                boundStation: 'ST001',
                boundStationName: '库台001',
                boundRow: 'R001',
                status: '启用',
                remark: 'AGV平库主要巷道',
                createTime: '2024-01-15 10:30:00'
            },
            {
                id: 2,
                aisleCode: 'AGV002',
                aisleName: 'AGV平库巷道002',
                locationStructure: '双深',
                boundStation: 'ST002',
                boundStationName: '库台002',
                boundRow: 'R002',
                status: '启用',
                remark: '双深位存储巷道',
                createTime: '2024-01-16 14:20:00'
            },
            {
                id: 3,
                aisleCode: 'AGV003',
                aisleName: 'AGV平库巷道003',
                locationStructure: '单深',
                boundStation: 'ST003',
                boundStationName: '库台003',
                boundRow: 'R003',
                status: '禁用',
                remark: '维护中',
                createTime: '2024-01-17 09:15:00'
            },
            {
                id: 4,
                aisleCode: 'AGV004',
                aisleName: 'AGV平库巷道004',
                locationStructure: '双深',
                boundStation: 'ST004',
                boundStationName: '库台004',
                boundRow: 'R004',
                status: '启用',
                remark: '高频使用巷道',
                createTime: '2024-01-18 16:45:00'
            },
            {
                id: 5,
                aisleCode: 'AGV005',
                aisleName: 'AGV平库巷道005',
                locationStructure: '单深',
                boundStation: 'ST005',
                boundStationName: '库台005',
                boundRow: 'R005',
                status: '启用',
                remark: '备用巷道',
                createTime: '2024-01-19 11:30:00'
            }
        ];

        this.loadData();
    }

    // 搜索
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

    // 重置搜索
    resetSearch() {
        document.getElementById('searchCode').value = '';
        document.getElementById('searchName').value = '';
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
                item.aisleCode.toLowerCase().includes(this.searchParams.searchCode.toLowerCase())
            );
        }

        if (this.searchParams.searchName) {
            filteredData = filteredData.filter(item => 
                item.aisleName.toLowerCase().includes(this.searchParams.searchName.toLowerCase())
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
        const tbody = document.getElementById('agvAreaTableBody');
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9">
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
                <td>${item.aisleCode}</td>
                <td>${item.aisleName}</td>
                <td>${item.locationStructure}</td>
                <td>${item.boundStationName || '-'}</td>
                <td>${item.boundRow || '-'}</td>
                <td>
                    <span class="status-badge ${item.status === '启用' ? 'enabled' : 'disabled'}">
                        ${item.status}
                    </span>
                </td>
                <td>${item.remark || '-'}</td>
                <td>${item.createTime}</td>
                <td>
                    <div class="action-btns">
                        <button class="edit-btn" onclick="agvFlatAreaManager.editAgvArea(${item.id})">
                            编辑
                        </button>
                        <button class="delete-btn" onclick="agvFlatAreaManager.deleteAgvArea(${item.id})">
                            删除
                        </button>
                        <button class="${item.status === '启用' ? 'disable-btn' : 'enable-btn'}" 
                                onclick="agvFlatAreaManager.toggleStatus(${item.id})">
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
        document.getElementById('modalTitle').textContent = '新增AGV平库库区';
        this.resetForm();
        this.showModal();
    }

    // 编辑AGV平库库区
    editAgvArea(id) {
        const item = this.mockData.find(d => d.id === id);
        if (!item) return;

        this.editingId = id;
        document.getElementById('modalTitle').textContent = '编辑AGV平库库区';
        
        // 填充表单
        document.getElementById('aisleCode').value = item.aisleCode;
        document.getElementById('aisleName').value = item.aisleName;
        document.getElementById('locationStructure').value = item.locationStructure;
        document.getElementById('boundStation').value = item.boundStation || '';
        document.getElementById('boundRow').value = item.boundRow || '';
        document.getElementById('status').value = item.status;
        document.getElementById('remark').value = item.remark || '';

        this.showModal();
    }

    // 删除AGV平库库区
    deleteAgvArea(id) {
        const item = this.mockData.find(d => d.id === id);
        if (!item) return;

        if (confirm(`确定要删除AGV平库库区"${item.aisleName}"吗？`)) {
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
        const action = newStatus === '启用' ? '启用' : '禁用';

        if (confirm(`确定要${action}AGV平库库区"${item.aisleName}"吗？`)) {
            item.status = newStatus;
            this.loadData();
            this.showMessage(`${action}成功`, 'success');
        }
    }

    // 显示弹窗
    showModal() {
        const modal = document.getElementById('agvAreaModal');
        modal.style.display = 'flex';
        modal.classList.add('active');
    }

    // 隐藏弹窗
    hideModal() {
        const modal = document.getElementById('agvAreaModal');
        modal.style.display = 'none';
        modal.classList.remove('active');
        this.resetForm();
    }

    // 重置表单
    resetForm() {
        document.getElementById('agvAreaForm').reset();
    }

    // 保存AGV平库库区
    saveAgvArea() {
        // 获取表单数据
        const aisleCode = document.getElementById('aisleCode').value.trim();
        const aisleName = document.getElementById('aisleName').value.trim();
        const locationStructure = document.getElementById('locationStructure').value;
        const boundStation = document.getElementById('boundStation').value;
        const boundRow = document.getElementById('boundRow').value.trim();
        const status = document.getElementById('status').value;
        const remark = document.getElementById('remark').value.trim();

        // 验证必填字段
        if (!aisleCode) {
            this.showMessage('请输入巷道编码', 'error');
            return;
        }

        if (!aisleName) {
            this.showMessage('请输入巷道名称', 'error');
            return;
        }

        if (!locationStructure) {
            this.showMessage('请选择库位结构', 'error');
            return;
        }

        // 检查巷道编码是否重复
        const existingItem = this.mockData.find(item => 
            item.aisleCode === aisleCode && item.id !== this.editingId
        );

        if (existingItem) {
            this.showMessage('巷道编码已存在', 'error');
            return;
        }

        const boundStationName = boundStation ? 
            document.querySelector(`#boundStation option[value="${boundStation}"]`).textContent : '';

        const agvAreaData = {
            aisleCode,
            aisleName,
            locationStructure,
            boundStation: boundStation || null,
            boundStationName,
            boundRow: boundRow || null,
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
                this.mockData[index] = { ...this.mockData[index], ...agvAreaData };
                this.showMessage('修改成功', 'success');
            }
        } else {
            // 新增
            const newId = Math.max(...this.mockData.map(d => d.id)) + 1;
            this.mockData.push({ id: newId, ...agvAreaData });
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
let agvFlatAreaManager;
document.addEventListener('DOMContentLoaded', () => {
    agvFlatAreaManager = new AGVFlatAreaManager();
});