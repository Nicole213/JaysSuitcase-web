// AGV平库库位管理脚本

class AGVLocationManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalCount = 0;
        this.totalPages = 1;
        this.searchParams = {};
        this.editingId = null;
        this.areaOptions = [];
        this.channelOptions = [];
        this.palletDetails = {};

        this.init();
        this.loadMockData();
    }

    init() {
        this.initOptions();
        this.bindEvents();
        this.loadAreaOptions();
        this.loadChannelOptions();
    }

    initOptions() {
        this.areaOptions = [
            { id: 'AREA001', name: 'AGV平库库区001' },
            { id: 'AREA002', name: 'AGV平库库区002' },
            { id: 'AREA003', name: 'AGV平库库区003' },
            { id: 'AREA004', name: 'AGV平库库区004' },
            { id: 'AREA005', name: 'AGV平库库区005' }
        ];

        this.channelOptions = [
            { id: 'CH001', name: 'AGV平库通道001', areaId: 'AREA001' },
            { id: 'CH002', name: 'AGV平库通道002', areaId: 'AREA001' },
            { id: 'CH003', name: 'AGV平库通道003', areaId: 'AREA002' },
            { id: 'CH004', name: 'AGV平库通道004', areaId: 'AREA002' },
            { id: 'CH005', name: 'AGV平库通道005', areaId: 'AREA003' },
            { id: 'CH006', name: 'AGV平库通道006', areaId: 'AREA004' },
            { id: 'CH007', name: 'AGV平库通道007', areaId: 'AREA005' }
        ];

        this.palletDetails = {
            'LOC001-01-01': [
                { palletNo: 'PAL2024001', containerNo: 'CNT2024001', materialCode: 'MAT001', materialName: '黑色拉杆箱', qty: 24 }
            ],
            'LOC002-01-02': [
                { palletNo: 'PAL2024002', containerNo: 'CNT2024003', materialCode: 'MAT008', materialName: '商务双肩包', qty: 12 }
            ],
            'LOC003-02-01': [
                { palletNo: 'PAL2024003', containerNo: 'CNT2024004', materialCode: 'MAT013', materialName: '旅行收纳箱', qty: 18 }
            ],
            'LOC001-01-03': [
                { palletNo: 'PAL2024004', containerNo: 'CNT2024005', materialCode: 'MAT021', materialName: '空托盘', qty: 1 }
            ]
        };
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
            this.saveLocation();
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

        document.getElementById('locationModal').addEventListener('click', (e) => {
            if (e.target.id === 'locationModal') {
                this.hideModal();
            }
        });

        document.getElementById('detailModal').addEventListener('click', (e) => {
            if (e.target.id === 'detailModal') {
                this.hideDetailModal();
            }
        });

        document.getElementById('closeDetailModal').addEventListener('click', () => {
            this.hideDetailModal();
        });

        document.getElementById('closeDetailBtn').addEventListener('click', () => {
            this.hideDetailModal();
        });

        document.getElementById('searchCode').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.search();
            }
        });

        document.getElementById('isAgvSite').addEventListener('change', (e) => {
            const siteTypeSelect = document.getElementById('siteType');
            if (e.target.value === '是') {
                siteTypeSelect.disabled = false;
            } else {
                siteTypeSelect.disabled = true;
                siteTypeSelect.value = '';
            }
        });

        document.getElementById('belongArea').addEventListener('change', () => {
            this.filterChannelOptions(document.getElementById('belongArea').value);
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

    loadChannelOptions() {
        const channelFilterSelect = document.getElementById('channelFilter');
        const channelSelect = document.getElementById('channel');

        this.channelOptions.forEach(channel => {
            const filterOption = document.createElement('option');
            filterOption.value = channel.id;
            filterOption.textContent = channel.name;
            channelFilterSelect.appendChild(filterOption);
        });

        channelSelect.innerHTML = '<option value="">请选择</option>';
        this.channelOptions.forEach(channel => {
            const formOption = document.createElement('option');
            formOption.value = channel.id;
            formOption.textContent = channel.name;
            channelSelect.appendChild(formOption);
        });
    }

    filterChannelOptions(areaId) {
        const channelSelect = document.getElementById('channel');
        const currentValue = channelSelect.value;
        channelSelect.innerHTML = '<option value="">请选择</option>';

        this.channelOptions
            .filter(channel => !areaId || channel.areaId === areaId)
            .forEach(channel => {
                const option = document.createElement('option');
                option.value = channel.id;
                option.textContent = channel.name;
                channelSelect.appendChild(option);
            });

        const stillExists = Array.from(channelSelect.options).some(option => option.value === currentValue);
        channelSelect.value = stillExists ? currentValue : '';
    }

    loadMockData() {
        this.mockData = [
            {
                id: 1,
                locationCode: 'LOC001-01-01',
                locationName: 'AGV入库位01',
                belongArea: 'AREA001',
                belongAreaName: 'AGV平库库区001',
                channel: 'CH001',
                channelName: 'AGV平库通道001',
                currentStatus: '有货',
                lockStatus: '正常',
                enableStatus: '启用',
                containerNo: 'CNT2024001',
                isAgvSite: '是',
                siteType: '托盘交接站点',
                remark: '主要入库库位',
                createTime: '2024-01-15 10:30:00',
                hasBusinessData: true
            },
            {
                id: 2,
                locationCode: 'LOC001-01-02',
                locationName: 'AGV缓存位02',
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
                createTime: '2024-01-15 10:31:00',
                hasBusinessData: false
            },
            {
                id: 3,
                locationCode: 'LOC001-02-01',
                locationName: 'AGV出库位01',
                belongArea: 'AREA001',
                belongAreaName: 'AGV平库库区001',
                channel: 'CH002',
                channelName: 'AGV平库通道002',
                currentStatus: '已分配',
                lockStatus: '锁定',
                enableStatus: '启用',
                containerNo: '',
                isAgvSite: '是',
                siteType: 'AGV停靠站点',
                remark: '预分配库位',
                createTime: '2024-01-16 14:20:00',
                hasBusinessData: true
            },
            {
                id: 4,
                locationCode: 'LOC002-01-01',
                locationName: 'AGV空托位01',
                belongArea: 'AREA002',
                belongAreaName: 'AGV平库库区002',
                channel: 'CH003',
                channelName: 'AGV平库通道003',
                currentStatus: '空托',
                lockStatus: '正常',
                enableStatus: '禁用',
                containerNo: 'CNT2024002',
                isAgvSite: '是',
                siteType: '托盘交接站点',
                remark: '维护中',
                createTime: '2024-01-17 09:15:00',
                hasBusinessData: true
            },
            {
                id: 5,
                locationCode: 'LOC002-01-02',
                locationName: '常规存储位02',
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
                createTime: '2024-01-18 16:45:00',
                hasBusinessData: true
            },
            {
                id: 6,
                locationCode: 'LOC003-01-01',
                locationName: '质检库位01',
                belongArea: 'AREA003',
                belongAreaName: 'AGV平库库区003',
                channel: 'CH005',
                channelName: 'AGV平库通道005',
                currentStatus: '空库位',
                lockStatus: '正常',
                enableStatus: '启用',
                containerNo: '',
                isAgvSite: '是',
                siteType: '充电补给站点',
                remark: '质检专用库位',
                createTime: '2024-01-19 11:30:00',
                hasBusinessData: false
            },
            {
                id: 7,
                locationCode: 'LOC003-02-01',
                locationName: '周转库位01',
                belongArea: 'AREA003',
                belongAreaName: 'AGV平库库区003',
                channel: 'CH005',
                channelName: 'AGV平库通道005',
                currentStatus: '有货',
                lockStatus: '锁定',
                enableStatus: '启用',
                containerNo: 'CNT2024004',
                isAgvSite: '否',
                siteType: '',
                remark: '临时锁定',
                createTime: '2024-01-20 08:45:00',
                hasBusinessData: true
            },
            {
                id: 8,
                locationCode: 'LOC001-01-03',
                locationName: '空托缓存位03',
                belongArea: 'AREA001',
                belongAreaName: 'AGV平库库区001',
                channel: 'CH001',
                channelName: 'AGV平库通道001',
                currentStatus: '空托',
                lockStatus: '正常',
                enableStatus: '启用',
                containerNo: 'CNT2024005',
                isAgvSite: '是',
                siteType: '托盘交接站点',
                remark: '空托待用',
                createTime: '2024-01-21 15:20:00',
                hasBusinessData: true
            }
        ];

        this.loadData();
    }

    search() {
        const searchCode = document.getElementById('searchCode').value.trim();
        const areaFilter = document.getElementById('areaFilter').value;
        const channelFilter = document.getElementById('channelFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const lockFilter = document.getElementById('lockFilter').value;
        const enableFilter = document.getElementById('enableFilter').value;
        const agvSiteFilter = document.getElementById('agvSiteFilter').value;
        const siteTypeFilter = document.getElementById('siteTypeFilter').value;

        this.searchParams = {
            searchCode,
            areaFilter,
            channelFilter,
            statusFilter,
            lockFilter,
            enableFilter,
            agvSiteFilter,
            siteTypeFilter
        };

        this.currentPage = 1;
        this.loadData();
    }

    resetSearch() {
        document.getElementById('searchCode').value = '';
        document.getElementById('areaFilter').value = '';
        document.getElementById('channelFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('lockFilter').value = '';
        document.getElementById('enableFilter').value = '';
        document.getElementById('agvSiteFilter').value = '';
        document.getElementById('siteTypeFilter').value = '';
        this.searchParams = {};
        this.currentPage = 1;
        this.loadData();
    }

    loadData() {
        let filteredData = [...this.mockData];

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

        if (this.searchParams.enableFilter) {
            filteredData = filteredData.filter(item =>
                item.enableStatus === this.searchParams.enableFilter
            );
        }

        if (this.searchParams.agvSiteFilter) {
            filteredData = filteredData.filter(item =>
                item.isAgvSite === this.searchParams.agvSiteFilter
            );
        }

        if (this.searchParams.siteTypeFilter) {
            filteredData = filteredData.filter(item =>
                item.siteType === this.searchParams.siteTypeFilter
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
        const tbody = document.getElementById('locationTableBody');
        tbody.innerHTML = '';

        if (!data.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="11">
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
                <td>${item.locationName}</td>
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
                        <button class="action-link" onclick="agvLocationManager.showDetail(${item.id})">查看</button>
                        <button class="action-link" onclick="agvLocationManager.editLocation(${item.id})">编辑</button>
                        <button class="action-link danger" onclick="agvLocationManager.deleteLocation(${item.id})">删除</button>
                        <button class="action-link ${item.enableStatus === '启用' ? 'warning' : 'success'}"
                            onclick="agvLocationManager.toggleEnable(${item.id})">
                            ${item.enableStatus === '启用' ? '禁用' : '启用'}
                        </button>
                        <button class="action-link ${item.lockStatus === '锁定' ? 'success' : 'warning'}"
                            onclick="agvLocationManager.toggleLock(${item.id})">
                            ${item.lockStatus === '锁定' ? '解锁' : '锁定'}
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    getStatusClass(status) {
        const statusMap = {
            '空库位': 'status-empty',
            '有货': 'status-occupied',
            '已分配': 'status-allocated',
            '空托': 'status-empty-tray'
        };
        return statusMap[status] || 'status-empty';
    }

    getSiteTypeClass(siteType) {
        const typeMap = {
            '托盘交接站点': 'site-transfer',
            'AGV停靠站点': 'site-parking',
            '充电补给站点': 'site-charge'
        };
        return typeMap[siteType] || '';
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
        document.getElementById('modalTitle').textContent = '新增AGV平库库位';
        this.resetForm();
        this.showModal();
    }

    editLocation(id) {
        const item = this.mockData.find(data => data.id === id);
        if (!item) {
            return;
        }

        this.editingId = id;
        document.getElementById('modalTitle').textContent = '编辑AGV平库库位';
        document.getElementById('locationCode').value = item.locationCode;
        document.getElementById('locationName').value = item.locationName;
        document.getElementById('belongArea').value = item.belongArea;
        this.filterChannelOptions(item.belongArea);
        document.getElementById('channel').value = item.channel;
        document.getElementById('currentStatus').value = item.currentStatus;
        document.getElementById('containerNo').value = item.containerNo || '';
        document.getElementById('lockStatus').value = item.lockStatus;
        document.getElementById('isAgvSite').value = item.isAgvSite;
        document.getElementById('siteType').value = item.siteType || '';
        document.getElementById('enableStatus').value = item.enableStatus;
        document.getElementById('remark').value = item.remark || '';

        const siteTypeSelect = document.getElementById('siteType');
        if (item.isAgvSite === '是') {
            siteTypeSelect.disabled = false;
        } else {
            siteTypeSelect.disabled = true;
        }

        this.showModal();
    }

    deleteLocation(id) {
        const item = this.mockData.find(data => data.id === id);
        if (!item) {
            return;
        }

        const canDelete = item.currentStatus === '空库位' || !item.hasBusinessData;
        if (!canDelete) {
            this.showAlertDialog(
                '删除提示',
                '仅空闲库位可删除或该库位已关联业务数据，不可删除'
            );
            return;
        }

        this.showConfirmDialog(
            '确认删除库位',
            `确定要删除库位"${item.locationCode}"吗？\n删除后将无法恢复。`,
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

    toggleEnable(id) {
        const item = this.mockData.find(data => data.id === id);
        if (!item) {
            return;
        }

        if (item.enableStatus === '启用') {
            this.showConfirmDialog(
                '确认禁用库位',
                '禁用后AGV将不再执行该库位的出入库任务，同时会影响该库位内侧库位的出入库任务，是否确认？',
                () => {
                    item.enableStatus = '禁用';
                    this.loadData();
                    this.showMessage('禁用成功', 'success');
                }
            );
            return;
        }

        const confirmed = confirm(`确定要启用库位"${item.locationCode}"吗？启用后将恢复正常任务分配。`);
        if (!confirmed) {
            return;
        }

        item.enableStatus = '启用';
        this.loadData();
        this.showMessage('启用成功', 'success');
    }

    toggleLock(id) {
        const item = this.mockData.find(data => data.id === id);
        if (!item) {
            return;
        }

        const newStatus = item.lockStatus === '锁定' ? '正常' : '锁定';
        const action = newStatus === '锁定' ? '锁定' : '解锁';

        const confirmed = confirm(`确定要${action}库位"${item.locationCode}"吗？`);
        if (!confirmed) {
            return;
        }

        item.lockStatus = newStatus;
        this.loadData();
        this.showMessage(`${action}成功`, 'success');
    }

    showDetail(id) {
        const item = this.mockData.find(data => data.id === id);
        if (!item) {
            return;
        }

        const detailSummary = document.getElementById('detailSummary');
        detailSummary.innerHTML = `
            <div class="detail-item">
                <span class="detail-label">库位编码</span>
                <span class="detail-value">${item.locationCode}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">库位名称</span>
                <span class="detail-value">${item.locationName}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">所属库区</span>
                <span class="detail-value">${item.belongAreaName}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">所属通道</span>
                <span class="detail-value">${item.channelName}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">当前状态</span>
                <span class="detail-value">${item.currentStatus}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">当前容器编号</span>
                <span class="detail-value">${item.containerNo || '-'}</span>
            </div>
        `;

        const detailPallets = document.getElementById('detailPallets');
        const pallets = this.palletDetails[item.locationCode] || [];

        if (!pallets.length) {
            detailPallets.innerHTML = `
                <tr>
                    <td colspan="5" class="detail-empty">暂无托盘详情</td>
                </tr>
            `;
        } else {
            detailPallets.innerHTML = pallets.map(pallet => `
                <tr>
                    <td>${pallet.palletNo}</td>
                    <td>${pallet.containerNo}</td>
                    <td>${pallet.materialCode}</td>
                    <td>${pallet.materialName}</td>
                    <td>${pallet.qty}</td>
                </tr>
            `).join('');
        }

        this.showDetailModal();
    }

    showModal() {
        const modal = document.getElementById('locationModal');
        modal.style.display = 'flex';
        modal.classList.add('active');
    }

    hideModal() {
        const modal = document.getElementById('locationModal');
        modal.style.display = 'none';
        modal.classList.remove('active');
        this.resetForm();
    }

    showDetailModal() {
        const modal = document.getElementById('detailModal');
        modal.style.display = 'flex';
        modal.classList.add('active');
    }

    hideDetailModal() {
        const modal = document.getElementById('detailModal');
        modal.style.display = 'none';
        modal.classList.remove('active');
    }

    resetForm() {
        document.getElementById('locationForm').reset();
        document.getElementById('siteType').disabled = true;
        document.getElementById('currentStatus').value = '空库位';
        document.getElementById('lockStatus').value = '正常';
        document.getElementById('enableStatus').value = '启用';
        document.getElementById('isAgvSite').value = '否';
        this.filterChannelOptions('');
    }

    saveLocation() {
        const locationCode = document.getElementById('locationCode').value.trim();
        const locationName = document.getElementById('locationName').value.trim();
        const belongArea = document.getElementById('belongArea').value;
        const channel = document.getElementById('channel').value;
        const currentStatus = document.getElementById('currentStatus').value;
        const containerNo = document.getElementById('containerNo').value.trim();
        const lockStatus = document.getElementById('lockStatus').value;
        const isAgvSite = document.getElementById('isAgvSite').value;
        const siteType = document.getElementById('siteType').value;
        const enableStatus = document.getElementById('enableStatus').value;
        const remark = document.getElementById('remark').value.trim();

        if (!locationCode) {
            this.showMessage('请输入库位编码', 'error');
            return;
        }

        if (!locationName) {
            this.showMessage('请输入库位名称', 'error');
            return;
        }

        if (!belongArea) {
            this.showMessage('请选择所属库区', 'error');
            return;
        }

        if (!channel) {
            this.showMessage('请选择所属通道', 'error');
            return;
        }

        const existingItem = this.mockData.find(item =>
            item.locationCode === locationCode && item.id !== this.editingId
        );

        if (existingItem) {
            this.showMessage('库位编码已存在', 'error');
            return;
        }

        if (currentStatus === '有货' && !containerNo) {
            this.showMessage('有货状态必须填写当前容器编号', 'error');
            return;
        }

        if (isAgvSite === '是' && !siteType) {
            this.showMessage('AGV站点必须选择站点类型', 'error');
            return;
        }

        const belongAreaName = document.querySelector(`#belongArea option[value="${belongArea}"]`).textContent;
        const channelName = document.querySelector(`#channel option[value="${channel}"]`).textContent;

        const locationData = {
            locationCode,
            locationName,
            belongArea,
            belongAreaName,
            channel,
            channelName,
            currentStatus,
            lockStatus,
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
            const index = this.mockData.findIndex(item => item.id === this.editingId);
            if (index > -1) {
                locationData.createTime = this.mockData[index].createTime;
                locationData.hasBusinessData = this.mockData[index].hasBusinessData;
                this.mockData[index] = { ...this.mockData[index], ...locationData };
                this.showMessage('修改成功', 'success');
            }
        } else {
            const newId = this.mockData.length
                ? Math.max(...this.mockData.map(item => item.id)) + 1
                : 1;
            locationData.hasBusinessData = currentStatus !== '空库位';
            this.mockData.push({ id: newId, ...locationData });
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

let agvLocationManager;
document.addEventListener('DOMContentLoaded', () => {
    agvLocationManager = new AGVLocationManager();
});
