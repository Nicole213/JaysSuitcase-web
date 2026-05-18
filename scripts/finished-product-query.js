// 成品信息查询页面脚本

class FinishedProductQueryPage {
    static STATUS_MAP = {
        '待包装待入库': '待包装组盘',
        '待包装已入平库': '待包装入平库',
        '待包装已出平库': '待包装出平库',
        '已包装待检': '已包装出平库待检',
        '检验中': '检验中',
        '已检待入库': '已检待入库',
        '已检入平库': '已检入平库',
        '已入立库': '已入立库',
        '已发货': '发货出库',
        '待包装组盘': '待包装组盘',
        '待包装入平库': '待包装入平库',
        '待包装出平库': '待包装出平库',
        '已包装组盘': '已包装组盘',
        '已包装入平库': '已包装入平库',
        '已包装出平库待检': '已包装出平库待检',
        '发货出库': '发货出库'
    };

    static NODE_MAP = {
        '待包装组盘': '组盘完成',
        '待包装入平库': '入平库',
        '待包装出平库': '出平库',
        '已包装组盘': '包装组盘',
        '已包装入平库': '入平库',
        '已包装出平库待检': '出平库待检',
        '检验中': '抽检',
        '已检待入库': '抽检完成',
        '已检入平库': '入平库',
        '已入立库': '入立库',
        '发货出库': '发货'
    };

    static FLOW_SEQUENCE = [
        '待包装组盘',
        '待包装入平库',
        '待包装出平库',
        '已包装组盘',
        '已包装入平库',
        '已包装出平库待检',
        '检验中',
        '已检待入库',
        '已检入平库',
        '已入立库',
        '发货出库'
    ];

    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.filteredData = [];
        this.productInfoData = this.buildMockData();

        this.init();
    }

    init() {
        this.filteredData = [...this.productInfoData];
        this.bindEvents();
        this.renderTable();
    }

    buildMockData() {
        const rawData = [
            {
                id: 1,
                snCode: 'SN-FG-20240501-001',
                materialCode: 'CP-2024-001',
                materialName: '20寸拉杆箱',
                containerCode: 'TP-1001',
                containerType: '塑料托盘',
                locationCode: '',
                area: '',
                palletTime: '2024-05-01 08:10:00',
                inboundTime: '',
                outboundTime: '',
                status: '待包装组盘',
                lastUpdateTime: '2024-05-01 08:30:00',
                flatLocationCode: '1-1-1-1',
                warehouseLocationCode: '立库A-01-01',
                shippingLocationCode: '发货月台01'
            },
            {
                id: 2,
                snCode: 'SN-FG-20240501-002',
                materialCode: 'CP-2024-002',
                materialName: '商务双肩包',
                containerCode: 'TP-1002',
                containerType: '周转箱',
                locationCode: '1-1-2-1',
                area: '库区A',
                palletTime: '2024-05-01 09:00:00',
                inboundTime: '2024-05-01 09:25:00',
                outboundTime: '',
                status: '待包装入平库',
                lastUpdateTime: '2024-05-01 09:40:00',
                flatLocationCode: '1-1-2-1',
                warehouseLocationCode: '立库A-01-02',
                shippingLocationCode: '发货月台01'
            },
            {
                id: 3,
                snCode: 'SN-FG-20240501-003',
                materialCode: 'CP-2024-003',
                materialName: '登机箱',
                containerCode: 'TP-1003',
                containerType: '塑料托盘',
                locationCode: '1-2-3-1',
                area: '库区A',
                palletTime: '2024-05-01 10:00:00',
                inboundTime: '2024-05-01 10:15:00',
                outboundTime: '2024-05-01 13:20:00',
                status: '待包装出平库',
                lastUpdateTime: '2024-05-01 13:30:00',
                flatLocationCode: '1-2-3-1',
                warehouseLocationCode: '立库A-01-03',
                shippingLocationCode: '发货月台01'
            },
            {
                id: 4,
                snCode: 'SN-FG-20240502-001',
                materialCode: 'CP-2024-004',
                materialName: '旅行收纳包',
                containerCode: 'TP-1004',
                containerType: '周转箱',
                locationCode: '',
                area: '',
                palletTime: '2024-05-02 08:40:00',
                inboundTime: '',
                outboundTime: '',
                status: '已包装组盘',
                lastUpdateTime: '2024-05-02 11:15:00',
                flatLocationCode: '1-3-1-1',
                warehouseLocationCode: '立库A-02-01',
                shippingLocationCode: '发货月台02'
            },
            {
                id: 5,
                snCode: 'SN-FG-20240502-002',
                materialCode: 'CP-2024-005',
                materialName: '铝框箱',
                containerCode: 'TP-1005',
                containerType: '金属框',
                locationCode: '2-1-1-1',
                area: '库区B',
                palletTime: '2024-05-02 09:20:00',
                inboundTime: '2024-05-02 13:10:00',
                outboundTime: '',
                status: '已包装入平库',
                lastUpdateTime: '2024-05-02 14:20:00',
                flatLocationCode: '2-1-1-1',
                warehouseLocationCode: '立库B-01-01',
                shippingLocationCode: '发货月台02'
            },
            {
                id: 6,
                snCode: 'SN-FG-20240502-003',
                materialCode: 'CP-2024-006',
                materialName: '儿童拉杆箱',
                containerCode: 'TP-1006',
                containerType: '塑料托盘',
                locationCode: '',
                area: '',
                palletTime: '2024-05-02 10:10:00',
                inboundTime: '',
                outboundTime: '2024-05-02 16:00:00',
                status: '已包装出平库待检',
                lastUpdateTime: '2024-05-02 16:10:00',
                flatLocationCode: '2-1-2-1',
                warehouseLocationCode: '立库B-01-02',
                shippingLocationCode: '发货月台02'
            },
            {
                id: 7,
                snCode: 'SN-FG-20240503-001',
                materialCode: 'CP-2024-007',
                materialName: '硬壳化妆箱',
                containerCode: 'TP-1007',
                containerType: '塑料托盘',
                locationCode: '',
                area: '',
                palletTime: '2024-05-03 08:50:00',
                inboundTime: '',
                outboundTime: '',
                status: '检验中',
                lastUpdateTime: '2024-05-03 10:15:00',
                flatLocationCode: '2-1-4-1',
                warehouseLocationCode: '立库B-02-01',
                shippingLocationCode: '发货月台03'
            },
            {
                id: 8,
                snCode: 'SN-FG-20240503-002',
                materialCode: 'CP-2024-008',
                materialName: '商务公文箱',
                containerCode: 'TP-1008',
                containerType: '金属框',
                locationCode: '',
                area: '',
                palletTime: '2024-05-03 09:30:00',
                inboundTime: '',
                outboundTime: '2024-05-03 12:00:00',
                status: '已检待入库',
                lastUpdateTime: '2024-05-03 12:25:00',
                flatLocationCode: '2-3-5-1',
                warehouseLocationCode: '立库A-02-01',
                shippingLocationCode: '发货月台03'
            },
            {
                id: 9,
                snCode: 'SN-FG-20240504-001',
                materialCode: 'CP-2024-009',
                materialName: '折叠旅行袋',
                containerCode: 'TP-1009',
                containerType: '周转箱',
                locationCode: '3-2-2-1',
                area: '库区C',
                palletTime: '2024-05-04 08:20:00',
                inboundTime: '2024-05-04 09:10:00',
                outboundTime: '',
                status: '已检入平库',
                lastUpdateTime: '2024-05-04 12:30:00',
                flatLocationCode: '3-2-2-1',
                warehouseLocationCode: '立库B-01-03',
                shippingLocationCode: '发货月台01'
            },
            {
                id: 10,
                snCode: 'SN-FG-20240504-002',
                materialCode: 'CP-2024-010',
                materialName: '防刮行李箱',
                containerCode: 'TP-1010',
                containerType: '塑料托盘',
                locationCode: '立库A-02-02',
                area: '库区C',
                palletTime: '2024-05-04 11:00:00',
                inboundTime: '2024-05-04 11:50:00',
                outboundTime: '',
                status: '已入立库',
                lastUpdateTime: '2024-05-04 13:20:00',
                flatLocationCode: '3-4-3-2',
                warehouseLocationCode: '立库A-02-02',
                shippingLocationCode: '发货月台02'
            },
            {
                id: 11,
                snCode: 'SN-FG-20240505-001',
                materialCode: 'CP-2024-011',
                materialName: '轻便旅行箱',
                containerCode: 'TP-1011',
                containerType: '塑料托盘',
                locationCode: '发货月台01',
                area: '库区C',
                palletTime: '2024-05-05 08:10:00',
                inboundTime: '2024-05-05 09:00:00',
                outboundTime: '2024-05-05 16:20:00',
                status: '发货出库',
                lastUpdateTime: '2024-05-05 16:20:00',
                flatLocationCode: '3-1-1-1',
                warehouseLocationCode: '立库C-01-01',
                shippingLocationCode: '发货月台01'
            }
        ];

        return rawData.map((item) => this.normalizeProductRecord(item));
    }

    normalizeProductRecord(item) {
        const normalizedStatus = this.normalizeStatus(item.status);

        return {
            ...item,
            status: normalizedStatus,
            history: this.buildSequentialHistory({ ...item, status: normalizedStatus })
        };
    }

    normalizeStatus(status) {
        return FinishedProductQueryPage.STATUS_MAP[status] || status;
    }

    normalizeNode(status, fallbackNode = '-') {
        return FinishedProductQueryPage.NODE_MAP[status] || fallbackNode || '-';
    }

    buildSequentialHistory(item) {
        const currentIndex = FinishedProductQueryPage.FLOW_SEQUENCE.indexOf(item.status);
        if (currentIndex === -1) {
            return [];
        }

        const statuses = FinishedProductQueryPage.FLOW_SEQUENCE.slice(0, currentIndex + 1);
        const historyTimes = this.buildHistoryTimes(item, statuses.length);

        return statuses.map((status, index) => ({
            time: historyTimes[index],
            updateTime: historyTimes[index],
            status,
            node: this.normalizeNode(status),
            containerCode: item.containerCode,
            area: this.getHistoryArea(item, status),
            locationCode: this.getHistoryLocation(item, status),
            remark: this.getHistoryRemark(status)
        }));
    }

    buildHistoryTimes(item, count) {
        const startValue = item.palletTime || item.lastUpdateTime;
        const endValue = item.lastUpdateTime || startValue;
        const startTime = this.parseDateTime(startValue);
        const endTime = this.parseDateTime(endValue);

        if (!startTime || !endTime) {
            return Array.from({ length: count }, () => startValue || '-');
        }

        if (count === 1) {
            return [this.formatDateTime(endTime)];
        }

        const totalDuration = Math.max(endTime.getTime() - startTime.getTime(), (count - 1) * 20 * 60 * 1000);
        const step = totalDuration / (count - 1);

        return Array.from({ length: count }, (_, index) => {
            if (index === count - 1) {
                return this.formatDateTime(endTime);
            }

            return this.formatDateTime(new Date(startTime.getTime() + step * index));
        });
    }

    parseDateTime(value) {
        if (!value) {
            return null;
        }

        const parsed = new Date(value.replace(/-/g, '/'));
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    formatDateTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    getHistoryLocation(item, status) {
        if (['待包装入平库', '待包装出平库', '已包装入平库', '已检入平库'].includes(status)) {
            return item.flatLocationCode || item.locationCode || '-';
        }

        if (status === '已入立库') {
            return item.warehouseLocationCode || item.locationCode || '-';
        }

        if (status === '发货出库') {
            return item.shippingLocationCode || item.locationCode || '-';
        }

        return '-';
    }

    getHistoryArea(item, status) {
        if (['待包装入平库', '待包装出平库', '已包装入平库', '已检入平库', '已入立库', '发货出库'].includes(status)) {
            return item.area || '-';
        }

        return '-';
    }

    getHistoryRemark(status) {
        const remarkMap = {
            '待包装组盘': '待包装物料完成组盘',
            '待包装入平库': '待包装物料执行入平库',
            '待包装出平库': '待包装物料执行出平库',
            '已包装组盘': '包装完成后重新组盘',
            '已包装入平库': '已包装物料执行入平库',
            '已包装出平库待检': '已包装物料出平库待检',
            '检验中': '物料进入抽检流程',
            '已检待入库': '抽检完成等待入库',
            '已检入平库': '已检物料执行入平库',
            '已入立库': '物料转运进入立库',
            '发货出库': '物料完成发货出库'
        };

        return remarkMap[status] || '-';
    }

    bindEvents() {
        document.getElementById('searchBtn').addEventListener('click', () => this.search());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetSearch());
        document.getElementById('prevPage').addEventListener('click', () => this.goToPage(this.currentPage - 1));
        document.getElementById('nextPage').addEventListener('click', () => this.goToPage(this.currentPage + 1));

        document.getElementById('historyModal').addEventListener('click', (event) => {
            if (event.target.id === 'historyModal') {
                this.hideHistoryModal();
            }
        });

        document.getElementById('closeHistoryModal').addEventListener('click', () => this.hideHistoryModal());
        document.getElementById('closeHistoryBtn').addEventListener('click', () => this.hideHistoryModal());

        [
            'searchSnCode',
            'searchMaterial',
            'searchContainer',
            'searchRow',
            'searchCol',
            'searchLevel',
            'searchDepth'
        ].forEach((id) => {
            document.getElementById(id).addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    this.search();
                }
            });
        });
    }

    search() {
        const snCode = document.getElementById('searchSnCode').value.trim().toLowerCase();
        const material = document.getElementById('searchMaterial').value.trim().toLowerCase();
        const container = document.getElementById('searchContainer').value.trim().toLowerCase();
        const area = document.getElementById('searchArea').value;
        const row = document.getElementById('searchRow').value.trim();
        const col = document.getElementById('searchCol').value.trim();
        const level = document.getElementById('searchLevel').value.trim();
        const depth = document.getElementById('searchDepth').value.trim();
        const status = document.getElementById('searchStatus').value;
        const palletStart = document.getElementById('searchPalletStart').value;
        const palletEnd = document.getElementById('searchPalletEnd').value;
        const inboundStart = document.getElementById('searchInboundStart').value;
        const inboundEnd = document.getElementById('searchInboundEnd').value;
        const outboundStart = document.getElementById('searchOutboundStart').value;
        const outboundEnd = document.getElementById('searchOutboundEnd').value;
        const lastUpdateStart = document.getElementById('searchLastUpdateStart').value;
        const lastUpdateEnd = document.getElementById('searchLastUpdateEnd').value;

        this.filteredData = this.productInfoData.filter((item) => {
            const matchSnCode = !snCode || item.snCode.toLowerCase().includes(snCode);
            const matchMaterial = !material ||
                item.materialCode.toLowerCase().includes(material) ||
                item.materialName.toLowerCase().includes(material);
            const matchContainer = !container || item.containerCode.toLowerCase().includes(container);
            const matchArea = !area || item.area === area;
            const matchStatus = !status || item.status === status;
            const locationParts = item.locationCode ? item.locationCode.split('-') : [];
            const matchRow = !row || locationParts[0] === row;
            const matchCol = !col || locationParts[1] === col;
            const matchLevel = !level || locationParts[2] === level;
            const matchDepth = !depth || locationParts[3] === depth;
            const matchPallet = this.matchesDateRange(item.palletTime, palletStart, palletEnd);
            const matchInbound = this.matchesDateRange(item.inboundTime, inboundStart, inboundEnd);
            const matchOutbound = this.matchesDateRange(item.outboundTime, outboundStart, outboundEnd);
            const matchLastUpdate = this.matchesDateRange(item.lastUpdateTime, lastUpdateStart, lastUpdateEnd);

            return matchSnCode &&
                matchMaterial &&
                matchContainer &&
                matchArea &&
                matchStatus &&
                matchRow &&
                matchCol &&
                matchLevel &&
                matchDepth &&
                matchPallet &&
                matchInbound &&
                matchOutbound &&
                matchLastUpdate;
        });

        this.currentPage = 1;
        this.renderTable();
    }

    matchesDateRange(value, start, end) {
        if (!start && !end) {
            return true;
        }

        const datePart = this.getDatePart(value);
        if (!datePart) {
            return false;
        }

        return (!start || datePart >= start) && (!end || datePart <= end);
    }

    getDatePart(value) {
        return value ? value.slice(0, 10) : '';
    }

    resetSearch() {
        [
            'searchSnCode',
            'searchMaterial',
            'searchContainer',
            'searchArea',
            'searchRow',
            'searchCol',
            'searchLevel',
            'searchDepth',
            'searchStatus',
            'searchPalletStart',
            'searchPalletEnd',
            'searchInboundStart',
            'searchInboundEnd',
            'searchOutboundStart',
            'searchOutboundEnd',
            'searchLastUpdateStart',
            'searchLastUpdateEnd'
        ].forEach((id) => {
            document.getElementById(id).value = '';
        });

        this.filteredData = [...this.productInfoData];
        this.currentPage = 1;
        this.renderTable();
    }

    renderTable() {
        const tbody = document.getElementById('productTableBody');
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageData = this.filteredData.slice(start, end);

        if (!pageData.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="13">
                        <div class="empty-state">
                            <div class="empty-icon">📦</div>
                            <div class="empty-text">暂无数据</div>
                            <div class="empty-desc">没有找到符合条件的成品SN信息</div>
                        </div>
                    </td>
                </tr>
            `;
            this.updatePagination();
            return;
        }

        tbody.innerHTML = pageData.map((item) => `
            <tr>
                <td>${item.snCode}</td>
                <td>${item.materialCode}</td>
                <td>${item.materialName}</td>
                <td>${item.containerCode}</td>
                <td>${item.containerType}</td>
                <td>${item.locationCode || '-'}</td>
                <td>${item.area || '-'}</td>
                <td>${item.palletTime || '-'}</td>
                <td>${item.inboundTime || '-'}</td>
                <td>${item.outboundTime || '-'}</td>
                <td><span class="status-badge ${this.getStatusClass(item.status)}">${item.status}</span></td>
                <td>${item.lastUpdateTime}</td>
                <td><button class="action-link" data-id="${item.id}">查看</button></td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.action-link').forEach((button) => {
            button.addEventListener('click', () => this.showHistory(Number(button.dataset.id)));
        });

        this.updatePagination();
    }

    getStatusClass(status) {
        const statusMap = {
            '待包装组盘': 'status-pending',
            '待包装入平库': 'status-flat',
            '待包装出平库': 'status-outbound',
            '已包装组盘': 'status-packaged',
            '已包装入平库': 'status-flat',
            '已包装出平库待检': 'status-inspect',
            '检验中': 'status-inspecting',
            '已检待入库': 'status-ready',
            '已检入平库': 'status-flat',
            '已入立库': 'status-warehouse',
            '发货出库': 'status-shipped'
        };

        return statusMap[status] || 'status-pending';
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize) || 1;
        document.getElementById('currentPage').textContent = this.currentPage;
        document.getElementById('totalPages').textContent = totalPages;
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage >= totalPages || this.filteredData.length === 0;
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize) || 1;
        if (page < 1 || page > totalPages) {
            return;
        }

        this.currentPage = page;
        this.renderTable();
    }

    showHistory(id) {
        const item = this.productInfoData.find((record) => record.id === id);
        if (!item) {
            return;
        }

        document.getElementById('historySummary').innerHTML = `
            <div class="detail-item">
                <span class="detail-label">SN码：</span>
                <span class="detail-value">${item.snCode}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">物料编码：</span>
                <span class="detail-value">${item.materialCode}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">物料名称：</span>
                <span class="detail-value">${item.materialName}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">当前容器：</span>
                <span class="detail-value">${item.containerCode}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">库区：</span>
                <span class="detail-value">${item.area || '-'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">库位编码：</span>
                <span class="detail-value">${item.locationCode || '-'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">最后更新时间：</span>
                <span class="detail-value">${item.lastUpdateTime}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">当前状态：</span>
                <span class="history-status-badge status-badge ${this.getStatusClass(item.status)}">${item.status}</span>
            </div>
        `;

        document.getElementById('historyTableBody').innerHTML = item.history.map((record) => `
            <tr>
                <td>${record.status}</td>
                <td>${record.node}</td>
                <td>${record.containerCode || '-'}</td>
                <td>${record.area || '-'}</td>
                <td>${record.locationCode || '-'}</td>
                <td>${record.updateTime || record.time || '-'}</td>
            </tr>
        `).join('');

        const modal = document.getElementById('historyModal');
        modal.style.display = 'flex';
        modal.classList.add('active');
    }

    hideHistoryModal() {
        const modal = document.getElementById('historyModal');
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

let finishedProductQueryPage;
document.addEventListener('DOMContentLoaded', () => {
    finishedProductQueryPage = new FinishedProductQueryPage();
});
