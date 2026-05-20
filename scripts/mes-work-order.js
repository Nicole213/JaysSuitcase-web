// MES生产工单页面脚本

class MESWorkOrderPage {
    static SN_PREFIX = 'SN';

    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.currentDetailId = null;
        this.selectedIds = new Set();
        this.sortDraftIds = [];
        this.workOrderData = this.buildMockData();
        this.filteredData = [];

        this.init();
    }

    init() {
        this.bindEvents();
        this.applyFilters({ resetPage: true });
    }

    buildMockData() {
        return [
            this.createWorkOrder({
                id: 1,
                workOrderNo: 'MES-WO-20260520-001',
                status: '待执行',
                productInfos: [
                    { materialCode: 'CP-2026-001', materialName: '20寸拉杆箱' },
                    { materialCode: 'CP-2026-002', materialName: '商务双肩包' }
                ],
                planQty: 48,
                packedQty: 0,
                syncTime: '2026-05-20 08:10:00',
                executor: '张三',
                pendingOutboundStatus: '未出库',
                inboundStatus: '未入库',
                materialPrepStatus: '未备料',
                remark: 'MES同步后待加入执行排序，当前不可开始工单。'
            }),
            this.createWorkOrder({
                id: 2,
                workOrderNo: 'MES-WO-20260520-002',
                status: '待执行',
                productInfos: [
                    { materialCode: 'CP-2026-003', materialName: '登机箱' }
                ],
                planQty: 36,
                packedQty: 0,
                syncTime: '2026-05-20 08:26:00',
                executor: '李四',
                pendingOutboundStatus: '未出库',
                inboundStatus: '未入库',
                sortConfirmedAt: '2026-05-20 08:45:00',
                sortSequence: 1,
                materialPrepStatus: '备料完成',
                prepStartTime: '2026-05-20 08:58:00',
                prepCompleteTime: '2026-05-20 09:06:00',
                remark: '待执行且已备料，可直接开始工单。'
            }),
            this.createWorkOrder({
                id: 3,
                workOrderNo: 'MES-WO-20260520-003',
                status: '待执行',
                productInfos: [
                    { materialCode: 'CP-2026-004', materialName: '铝框箱' }
                ],
                planQty: 60,
                packedQty: 0,
                syncTime: '2026-05-20 08:32:00',
                executor: '王五',
                pendingOutboundStatus: '未出库',
                inboundStatus: '未入库',
                sortConfirmedAt: '2026-05-20 08:45:00',
                sortSequence: 3,
                materialPrepStatus: '未备料',
                remark: '待执行、已排序、未备料，等待前序工单备料完成。'
            }),
            this.createWorkOrder({
                id: 4,
                workOrderNo: 'MES-WO-20260520-004',
                status: '执行中',
                productInfos: [
                    { materialCode: 'CP-2026-005', materialName: '旅行收纳包' },
                    { materialCode: 'CP-2026-006', materialName: '硬壳化妆箱' }
                ],
                planQty: 72,
                packedQty: 30,
                syncTime: '2026-05-20 08:40:00',
                executor: '赵六',
                startTime: '2026-05-20 09:30:00',
                pendingOutboundStatus: '部分出库',
                inboundStatus: '部分入库',
                sortConfirmedAt: '2026-05-20 08:45:00',
                sortSequence: 2,
                materialPrepStatus: '备料完成',
                prepStartTime: '2026-05-20 09:20:00',
                prepCompleteTime: '2026-05-20 09:28:00',
                remark: '执行中且已备料，当前处于工单执行阶段。'
            }),
            this.createWorkOrder({
                id: 5,
                workOrderNo: 'MES-WO-20260520-005',
                status: '待执行',
                productInfos: [
                    { materialCode: 'CP-2026-007', materialName: '儿童拉杆箱' }
                ],
                planQty: 30,
                packedQty: 0,
                syncTime: '2026-05-20 09:05:00',
                executor: '钱七',
                pendingOutboundStatus: '未出库',
                inboundStatus: '未入库',
                sortConfirmedAt: '2026-05-20 10:10:00',
                sortSequence: 1,
                materialPrepStatus: '未备料',
                remark: '待执行、已排序、未备料，已进入后续排序批次。'
            }),
            this.createWorkOrder({
                id: 6,
                workOrderNo: 'MES-WO-20260519-006',
                status: '已完成',
                productInfos: [
                    { materialCode: 'CP-2026-008', materialName: '旅行袋' }
                ],
                planQty: 24,
                packedQty: 24,
                syncTime: '2026-05-19 16:50:00',
                executor: '孙八',
                startTime: '2026-05-19 17:30:00',
                completeTime: '2026-05-19 19:10:00',
                pendingOutboundStatus: '全部出库',
                inboundStatus: '全部入库',
                sortConfirmedAt: '2026-05-19 17:20:00',
                sortSequence: 1,
                materialPrepStatus: '备料完成',
                prepStartTime: '2026-05-19 17:22:00',
                prepCompleteTime: '2026-05-19 17:35:00',
                remark: '历史完成工单，用于展示已走完的排序批次。'
            }),
            this.createWorkOrder({
                id: 7,
                workOrderNo: 'MES-WO-20260520-007',
                status: '已取消',
                productInfos: [
                    { materialCode: 'CP-2026-009', materialName: '电脑包' }
                ],
                planQty: 18,
                packedQty: 0,
                syncTime: '2026-05-20 09:18:00',
                executor: '周九',
                pendingOutboundStatus: '未出库',
                inboundStatus: '未入库',
                materialPrepStatus: '未备料',
                remark: '未开始备料前取消。'
            }),
            this.createWorkOrder({
                id: 8,
                workOrderNo: 'MES-WO-20260519-008',
                status: '待执行',
                productInfos: [
                    { materialCode: 'CP-2026-010', materialName: '公文箱' }
                ],
                planQty: 42,
                packedQty: 0,
                syncTime: '2026-05-19 17:08:00',
                executor: '吴十',
                pendingOutboundStatus: '未出库',
                inboundStatus: '未入库',
                materialPrepStatus: '未备料',
                remark: '待执行、未排序、未备料，等待人工加入排序。'
            })
        ];
    }

    createWorkOrder(config) {
        const item = {
            id: config.id,
            workOrderNo: config.workOrderNo,
            status: config.status,
            productInfos: config.productInfos || [],
            planQty: config.planQty || 0,
            packedQty: config.packedQty || 0,
            syncTime: config.syncTime || '',
            executor: config.executor || '-',
            startTime: config.startTime || '',
            completeTime: config.completeTime || '',
            pendingOutboundStatus: config.pendingOutboundStatus || '未出库',
            inboundStatus: config.inboundStatus || '未入库',
            isPaused: Boolean(config.isPaused),
            sortConfirmedAt: config.sortConfirmedAt || '',
            sortSequence: Number.isInteger(config.sortSequence) ? config.sortSequence : null,
            materialPrepStatus: config.materialPrepStatus || '未备料',
            prepStartTime: config.prepStartTime || '',
            prepCompleteTime: config.prepCompleteTime || '',
            remark: config.remark || ''
        };

        return this.syncDerivedFields(item);
    }

    syncDerivedFields(item) {
        const hasQueueOrder = Boolean(item.sortConfirmedAt) && Number.isInteger(item.sortSequence);

        if (!hasQueueOrder) {
            item.sortConfirmedAt = '';
            item.sortSequence = null;
            item.materialPrepStatus = '未备料';
            item.prepStartTime = '';
            item.prepCompleteTime = '';
        } else if (item.materialPrepStatus === '未备料') {
            item.prepStartTime = '';
            item.prepCompleteTime = '';
        } else if (item.materialPrepStatus === '备料中') {
            item.prepStartTime = item.prepStartTime || item.sortConfirmedAt;
            item.prepCompleteTime = '';
        } else if (item.materialPrepStatus === '备料完成') {
            item.prepStartTime = item.prepStartTime || item.prepCompleteTime || item.sortConfirmedAt;
            item.prepCompleteTime = item.prepCompleteTime || item.prepStartTime;
        }

        item.sortStatus = item.materialPrepStatus === '未备料'
            ? (hasQueueOrder ? '已排序' : '未排序')
            : '已锁定';

        item.pendingOutboundDetails = this.buildPendingOutboundDetails(item);
        item.materialOutboundDetails = this.buildMaterialOutboundDetails(item);
        item.inboundDetails = this.buildInboundDetails(item);

        return item;
    }

    buildPendingOutboundDetails(item) {
        const quantities = this.distributeQty(item.planQty, item.productInfos.length);
        const rows = item.productInfos.map((product, index) => {
            const isDone = item.pendingOutboundStatus === '全部出库' ||
                (item.pendingOutboundStatus === '部分出库' && index === 0);

            return {
                containerCode: `TP-${String(item.id).padStart(3, '0')}-${String(index + 1).padStart(2, '0')}`,
                materialCode: product.materialCode,
                materialName: product.materialName,
                quantity: quantities[index],
                areaCode: this.buildAreaCode('A', item.id + index),
                locationCode: this.buildLocationCode('A', item.id + index),
                status: isDone ? '已出库' : '待出库',
                time: isDone ? (item.startTime || item.completeTime || item.syncTime) : '',
                targetLocation: `包装工位${String((item.id % 6) + 1).padStart(2, '0')}`
            };
        });

        return this.createDetailRows(rows, '待包装成品出库明细', 'outbound');
    }

    buildMaterialOutboundDetails(item) {
        const materials = [
            { materialCode: 'FC-2026-001', materialName: '包装纸箱' },
            { materialCode: 'FC-2026-002', materialName: '缓冲袋' }
        ];

        const rows = materials.map((material, index) => {
            const isDone = item.materialPrepStatus === '备料完成' ||
                (item.materialPrepStatus === '备料中' && index === 0);

            const time = item.materialPrepStatus === '备料完成'
                ? (item.prepCompleteTime || item.prepStartTime || item.sortConfirmedAt)
                : (isDone ? (item.prepStartTime || item.sortConfirmedAt) : '');

            return {
                containerCode: `FC-${String(item.id).padStart(3, '0')}-${String(index + 1).padStart(2, '0')}`,
                materialCode: material.materialCode,
                materialName: material.materialName,
                quantity: item.planQty,
                areaCode: this.buildAreaCode('B', item.id + index),
                locationCode: this.buildLocationCode('B', item.id + index),
                status: isDone ? '已出库' : '待出库',
                time,
                targetLocation: `辅材工位${String((item.id % 5) + 1).padStart(2, '0')}`
            };
        });

        return this.createDetailRows(rows, '包装辅材出库明细', 'material');
    }

    buildInboundDetails(item) {
        const quantities = this.distributeQty(item.planQty, item.productInfos.length);
        const partialPacked = item.packedQty > 0 ? this.distributeQty(item.packedQty, item.productInfos.length) : [];
        const rows = [];

        item.productInfos.forEach((product, index) => {
            const doneQty = item.inboundStatus === '全部入库'
                ? quantities[index]
                : (item.inboundStatus === '部分入库' ? Math.min(partialPacked[index] || 0, quantities[index]) : 0);
            const pendingQty = quantities[index] - doneQty;

            if (doneQty > 0) {
                rows.push({
                    containerCode: `IN-${String(item.id).padStart(3, '0')}-${String(index + 1).padStart(2, '0')}-A`,
                    materialCode: product.materialCode,
                    materialName: product.materialName,
                    quantity: doneQty,
                    areaCode: this.buildAreaCode('C', item.id + index),
                    locationCode: this.buildLocationCode('C', item.id + index),
                    status: '已入库',
                    time: item.completeTime || item.startTime || item.syncTime,
                    targetLocation: `成品缓存区${String((item.id % 4) + 1).padStart(2, '0')}`
                });
            }

            if (pendingQty > 0) {
                rows.push({
                    containerCode: `IN-${String(item.id).padStart(3, '0')}-${String(index + 1).padStart(2, '0')}-B`,
                    materialCode: product.materialCode,
                    materialName: product.materialName,
                    quantity: pendingQty,
                    areaCode: this.buildAreaCode('C', item.id + index + 6),
                    locationCode: this.buildLocationCode('C', item.id + index + 6),
                    status: '待入库',
                    time: '',
                    targetLocation: `立库暂存位${String((item.id % 4) + 1).padStart(2, '0')}`
                });
            }
        });

        return this.createDetailRows(rows, '成品入库明细', 'inbound');
    }

    createDetailRows(rows, type, category) {
        return rows.map((row, index) => ({
            ...row,
            seq: index + 1,
            type,
            itemDetails: this.buildItemDetails(row, category, index)
        }));
    }

    buildItemDetails(detail, category, detailIndex) {
        return Array.from({ length: detail.quantity }, (_, itemIndex) => ({
            seq: itemIndex + 1,
            snCode: this.buildSnCode(detail, category, detailIndex, itemIndex),
            materialCode: detail.materialCode,
            materialName: detail.materialName,
            containerCode: detail.containerCode,
            status: detail.status
        }));
    }

    buildSnCode(detail, category, detailIndex, itemIndex) {
        const categoryCodeMap = {
            outbound: 'CK',
            inbound: 'RK',
            material: 'FC'
        };
        const normalizedMaterialCode = detail.materialCode.replace(/[^A-Za-z0-9]/g, '');
        const categoryCode = categoryCodeMap[category] || 'WL';
        const detailSegment = String(detailIndex + 1).padStart(3, '0');
        const itemSegment = String(itemIndex + 1).padStart(3, '0');

        return `${MESWorkOrderPage.SN_PREFIX}-${normalizedMaterialCode}-${categoryCode}-${detailSegment}${itemSegment}`;
    }

    distributeQty(totalQty, parts) {
        if (!parts || parts <= 0) {
            return [];
        }

        const base = Math.floor(totalQty / parts);
        const remainder = totalQty % parts;

        return Array.from({ length: parts }, (_, index) => base + (index < remainder ? 1 : 0));
    }

    buildAreaCode(prefix, index) {
        const baseMap = {
            A: 101,
            B: 201,
            C: 301
        };
        const baseValue = baseMap[prefix] || 101;
        return `PK${String(baseValue + index).padStart(3, '0')}`;
    }

    buildLocationCode(prefix, index) {
        const areaCode = this.buildAreaCode(prefix, index);
        const lane = String((index % 8) + 1).padStart(2, '0');
        const slot = String((index % 24) + 1).padStart(3, '0');
        return `${areaCode}-${lane}-${slot}`;
    }

    bindEvents() {
        document.getElementById('searchBtn').addEventListener('click', () => this.applyFilters({ resetPage: true }));
        document.getElementById('resetBtn').addEventListener('click', () => this.resetSearch());
        document.getElementById('prevPage').addEventListener('click', () => this.goToPage(this.currentPage - 1));
        document.getElementById('nextPage').addEventListener('click', () => this.goToPage(this.currentPage + 1));
        document.getElementById('sortOrdersBtn').addEventListener('click', () => this.openSortModal());
        document.getElementById('selectPageEligible').addEventListener('change', (event) => this.toggleSelectAllCurrentPage(event.target.checked));

        document.getElementById('closeSortModal').addEventListener('click', () => this.hideSortModal());
        document.getElementById('cancelSortBtn').addEventListener('click', () => this.hideSortModal());
        document.getElementById('confirmSortBtn').addEventListener('click', () => this.confirmSort());

        document.getElementById('detailModal').addEventListener('click', (event) => {
            if (event.target.id === 'detailModal') {
                this.hideDetailModal();
            }
        });
        document.getElementById('itemDetailModal').addEventListener('click', (event) => {
            if (event.target.id === 'itemDetailModal') {
                this.hideItemDetailModal();
            }
        });
        document.getElementById('sortModal').addEventListener('click', (event) => {
            if (event.target.id === 'sortModal') {
                this.hideSortModal();
            }
        });

        document.getElementById('closeDetailModal').addEventListener('click', () => this.hideDetailModal());
        document.getElementById('closeDetailBtn').addEventListener('click', () => this.hideDetailModal());
        document.getElementById('closeItemDetailModal').addEventListener('click', () => this.hideItemDetailModal());
        document.getElementById('closeItemDetailBtn').addEventListener('click', () => this.hideItemDetailModal());

        [
            'searchWorkOrderNo',
            'searchProductInfo',
        ].forEach((id) => {
            document.getElementById(id).addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    this.applyFilters({ resetPage: true });
                }
            });
        });
    }

    resetSearch() {
        [
            'searchWorkOrderNo',
            'searchStatus',
            'searchPrepStatus',
            'searchProductInfo',
            'searchInboundCompleted'
        ].forEach((id) => {
            document.getElementById(id).value = '';
        });

        this.applyFilters({ resetPage: true });
    }

    applyFilters({ resetPage = false } = {}) {
        const workOrderNo = document.getElementById('searchWorkOrderNo').value.trim().toLowerCase();
        const status = document.getElementById('searchStatus').value;
        const prepStatus = document.getElementById('searchPrepStatus').value;
        const productInfo = document.getElementById('searchProductInfo').value.trim().toLowerCase();
        const inboundCompleted = document.getElementById('searchInboundCompleted').value;

        this.filteredData = this.sortWorkOrders(this.workOrderData.filter((item) => {
            const matchWorkOrderNo = !workOrderNo || item.workOrderNo.toLowerCase().includes(workOrderNo);
            const matchStatus = !status || item.status === status;
            const matchPrepStatus = !prepStatus || this.getPrepStatusText(item.materialPrepStatus) === prepStatus;
            const matchProductInfo = !productInfo || item.productInfos.some((product) =>
                product.materialCode.toLowerCase().includes(productInfo) ||
                product.materialName.toLowerCase().includes(productInfo)
            );
            const inboundCompletedValue = item.inboundStatus === '全部入库' ? '是' : '否';
            const matchInboundCompleted = !inboundCompleted || inboundCompletedValue === inboundCompleted;

            return matchWorkOrderNo &&
                matchStatus &&
                matchPrepStatus &&
                matchProductInfo &&
                matchInboundCompleted;
        }));

        this.sanitizeSelection();

        if (resetPage) {
            this.currentPage = 1;
        }

        const totalPages = Math.ceil(this.filteredData.length / this.pageSize) || 1;
        if (this.currentPage > totalPages) {
            this.currentPage = totalPages;
        }

        this.renderTable();
    }

    matchesDateRange(value, start, end) {
        if (!start && !end) {
            return true;
        }

        const datePart = value ? value.slice(0, 10) : '';
        if (!datePart) {
            return false;
        }

        return (!start || datePart >= start) && (!end || datePart <= end);
    }

    sanitizeSelection() {
        [...this.selectedIds].forEach((id) => {
            const item = this.workOrderData.find((record) => record.id === id);
            if (!item || !this.canSelectForSorting(item)) {
                this.selectedIds.delete(id);
            }
        });
    }

    isActiveQueueItem(item) {
        return this.hasQueueOrder(item) && !['已完成', '已取消'].includes(item.status);
    }

    getQueuedItems() {
        return [...this.workOrderData]
            .filter((item) => this.hasQueueOrder(item) && item.status !== '已取消')
            .sort((a, b) => this.compareQueueOrder(a, b));
    }

    compareQueueOrder(a, b) {
        if (a.sortConfirmedAt !== b.sortConfirmedAt) {
            return a.sortConfirmedAt.localeCompare(b.sortConfirmedAt);
        }

        if (a.sortSequence !== b.sortSequence) {
            return a.sortSequence - b.sortSequence;
        }

        if (a.syncTime !== b.syncTime) {
            return a.syncTime.localeCompare(b.syncTime);
        }

        return a.id - b.id;
    }

    getActiveQueueItems() {
        return this.getQueuedItems().filter((item) => this.isActiveQueueItem(item));
    }

    getDisplaySortOrderMap() {
        const orderMap = new Map();
        this.getActiveQueueItems().forEach((item, index) => {
            orderMap.set(item.id, index + 1);
        });
        return orderMap;
    }

    getCurrentPrepItem() {
        const activeQueueItems = this.getActiveQueueItems();
        const preparingItem = activeQueueItems.find((item) => item.materialPrepStatus === '备料中');
        if (preparingItem) {
            return preparingItem;
        }

        return activeQueueItems.find((item) => item.materialPrepStatus === '未备料') || null;
    }

    sortWorkOrders(records) {
        return [...records].sort((a, b) => {
            const aOpen = !['已完成', '已取消'].includes(a.status);
            const bOpen = !['已完成', '已取消'].includes(b.status);

            if (aOpen !== bOpen) {
                return aOpen ? -1 : 1;
            }

            const aHasQueue = this.hasQueueOrder(a);
            const bHasQueue = this.hasQueueOrder(b);

            if (aHasQueue && bHasQueue) {
                return this.compareQueueOrder(a, b);
            }

            if (aHasQueue !== bHasQueue) {
                return aHasQueue ? -1 : 1;
            }

            if (a.syncTime !== b.syncTime) {
                return b.syncTime.localeCompare(a.syncTime);
            }

            return b.id - a.id;
        });
    }

    hasQueueOrder(item) {
        return Boolean(item.sortConfirmedAt) && Number.isInteger(item.sortSequence);
    }

    renderTable() {
        const tbody = document.getElementById('workOrderTableBody');
        const pageData = this.getCurrentPageData();
        const displayOrderMap = this.getDisplaySortOrderMap();

        if (!pageData.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="11">
                        <div class="empty-state">
                            <div class="empty-icon">🧾</div>
                            <div class="empty-text">暂无工单数据</div>
                            <div class="empty-desc">没有找到符合条件的MES生产工单</div>
                        </div>
                    </td>
                </tr>
            `;
            this.updatePagination();
            this.updateSelectionSummary();
            return;
        }

        tbody.innerHTML = pageData.map((item) => {
            const disabled = !this.canSelectForSorting(item);
            const checked = this.selectedIds.has(item.id);

            return `
                <tr>
                    <td class="selection-cell">
                        <input
                            type="checkbox"
                            class="selection-checkbox row-select"
                            data-id="${item.id}"
                            ${checked ? 'checked' : ''}
                            ${disabled ? 'disabled' : ''}
                        >
                    </td>
                    <td><button class="workorder-link" data-action="view" data-id="${item.id}">${item.workOrderNo}</button></td>
                    <td><span class="status-badge ${this.getWorkOrderStatusClass(item.status)}">${this.getWorkOrderStatusText(item)}</span></td>
                    <td>${this.renderSortSequence(displayOrderMap.get(item.id))}</td>
                    <td><span class="prep-badge ${this.getPrepStatusClass(item.materialPrepStatus)}">${this.getPrepStatusText(item.materialPrepStatus)}</span></td>
                    <td class="product-summary">${this.renderProductSummary(item.productInfos)}</td>
                    <td>${item.planQty}</td>
                    <td>${item.packedQty}</td>
                    <td>${this.formatDisplayTime(item.startTime)}</td>
                    <td>${this.formatDisplayTime(item.completeTime)}</td>
                    <td>
                        <div class="action-btns">
                            ${this.renderActionButtons(item)}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.querySelectorAll('.row-select').forEach((checkbox) => {
            checkbox.addEventListener('change', () => {
                this.toggleRowSelection(Number(checkbox.dataset.id), checkbox.checked);
            });
        });

        tbody.querySelectorAll('[data-action]').forEach((button) => {
            const id = Number(button.dataset.id);
            const action = button.dataset.action;

            button.addEventListener('click', () => {
                if (action === 'start') {
                    this.startWorkOrder(id);
                } else if (action === 'toggle-pause') {
                    this.togglePauseWorkOrder(id);
                } else if (action === 'complete') {
                    this.completeWorkOrder(id);
                } else if (action === 'cancel') {
                    this.cancelWorkOrder(id);
                } else if (action === 'view') {
                    this.showDetail(id);
                }
            });
        });

        this.updatePagination();
        this.updateSelectionSummary();
    }

    getCurrentPageData() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.filteredData.slice(start, end);
    }

    renderSortSequence(sequence) {
        if (!Number.isInteger(sequence)) {
            return '<span class="sort-order-empty">-</span>';
        }
        return `<span class="sort-order-value">${sequence}</span>`;
    }

    renderProductSummary(productInfos) {
        return productInfos.map((product) => `
            <div class="product-summary-item">${product.materialCode} / ${product.materialName}</div>
        `).join('');
    }

    renderActionButtons(item) {
        const actions = [];

        if (this.canStartWorkOrder(item)) {
            actions.push(`<button class="action-link primary" data-action="start" data-id="${item.id}">开始工单</button>`);
        }

        if (this.canTogglePause(item)) {
            actions.push(`<button class="action-link warning" data-action="toggle-pause" data-id="${item.id}">${item.isPaused ? '继续工单' : '暂停工单'}</button>`);
        }

        if (this.canCompleteWorkOrder(item)) {
            actions.push(`<button class="action-link success" data-action="complete" data-id="${item.id}">完成工单</button>`);
        }

        if (this.canCancelWorkOrder(item)) {
            actions.push(`<button class="action-link danger" data-action="cancel" data-id="${item.id}">取消工单</button>`);
        }

        if (!actions.length && item.status === '待执行' && item.sortStatus === '未排序') {
            actions.push('<span class="action-tip">请先排序</span>');
        } else if (!actions.length && item.status !== '已取消' && item.materialPrepStatus === '未备料' && item.sortStatus === '已排序') {
            actions.push('<span class="action-tip">等待前序工单备料完成</span>');
        }

        return actions.join('');
    }

    canSelectForSorting(item) {
        return !['已取消', '已完成'].includes(item.status) && item.materialPrepStatus === '未备料';
    }

    canStartWorkOrder(item) {
        return item.status === '待执行' &&
            item.sortStatus !== '未排序' &&
            item.materialPrepStatus !== '未备料';
    }

    canTogglePause(item) {
        return ['执行中', '已暂停'].includes(item.status);
    }

    canCompleteWorkOrder(item) {
        return ['执行中', '已暂停'].includes(item.status);
    }

    canStartMaterialPrep(item) {
        const currentPrepItem = this.getCurrentPrepItem();
        return !['已取消', '已完成'].includes(item.status) &&
            item.sortStatus !== '未排序' &&
            item.materialPrepStatus === '未备料' &&
            currentPrepItem &&
            currentPrepItem.id === item.id;
    }

    canCompleteMaterialPrep(item) {
        const currentPrepItem = this.getCurrentPrepItem();
        return !['已取消', '已完成'].includes(item.status) &&
            item.materialPrepStatus === '备料中' &&
            currentPrepItem &&
            currentPrepItem.id === item.id;
    }

    canCancelWorkOrder(item) {
        return item.status === '待执行' && item.materialPrepStatus === '未备料';
    }

    getWorkOrderStatusText(item) {
        return item.status;
    }

    getWorkOrderStatusClass(status) {
        const statusMap = {
            '待执行': 'pending',
            '执行中': 'processing',
            '已暂停': 'paused',
            '已完成': 'completed',
            '已取消': 'cancelled'
        };
        return statusMap[status] || 'pending';
    }

    getSortStatusClass(status) {
        const statusMap = {
            '未排序': 'unsorted',
            '已排序': 'sorted',
            '已锁定': 'locked'
        };
        return statusMap[status] || 'unsorted';
    }

    getPrepStatusClass(status) {
        return status === '未备料' ? 'none' : 'done';
    }

    getPrepStatusText(status) {
        return status === '未备料' ? '未备料' : '已备料';
    }

    getFlowStatusClass(status) {
        const statusMap = {
            '未出库': 'none',
            '部分出库': 'partial',
            '全部出库': 'full',
            '未入库': 'none',
            '部分入库': 'partial',
            '全部入库': 'full'
        };
        return statusMap[status] || 'none';
    }

    toggleRowSelection(id, checked) {
        if (checked) {
            this.selectedIds.add(id);
        } else {
            this.selectedIds.delete(id);
        }
        this.updateSelectionSummary();
    }

    toggleSelectAllCurrentPage(checked) {
        this.getCurrentPageData()
            .filter((item) => this.canSelectForSorting(item))
            .forEach((item) => {
                if (checked) {
                    this.selectedIds.add(item.id);
                } else {
                    this.selectedIds.delete(item.id);
                }
            });

        this.renderTable();
    }

    updateSelectionSummary() {
        const headerCheckbox = document.getElementById('selectPageEligible');
        const sortButton = document.getElementById('sortOrdersBtn');
        const eligibleRows = this.getCurrentPageData().filter((item) => this.canSelectForSorting(item));
        const selectedOnPage = eligibleRows.filter((item) => this.selectedIds.has(item.id));

        sortButton.disabled = this.selectedIds.size === 0;

        headerCheckbox.disabled = eligibleRows.length === 0;
        headerCheckbox.checked = eligibleRows.length > 0 && selectedOnPage.length === eligibleRows.length;
        headerCheckbox.indeterminate = selectedOnPage.length > 0 && selectedOnPage.length < eligibleRows.length;
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

    openSortModal() {
        this.sanitizeSelection();
        if (!this.selectedIds.size) {
            this.showAlertDialog('工单排序提示', '请先勾选“未排序”或“已排序未备料”的工单。');
            return;
        }

        const selectedItems = this.sortWorkOrders(
            this.workOrderData.filter((item) => this.selectedIds.has(item.id) && this.canSelectForSorting(item))
        );

        if (!selectedItems.length) {
            this.showAlertDialog('工单排序提示', '当前勾选工单中没有可排序的数据，请重新选择。');
            return;
        }

        this.sortDraftIds = selectedItems.map((item) => item.id);
        this.renderSortDraft();

        const modal = document.getElementById('sortModal');
        modal.style.display = 'flex';
        modal.classList.add('active');
    }

    renderCurrentQueueList() {
        const container = document.getElementById('currentQueueList');
        const queueData = this.getActiveQueueItems();
        const displayOrderMap = this.getDisplaySortOrderMap();

        if (!queueData.length) {
            container.innerHTML = '<div class="queue-empty">当前没有已进入备料队列的工单</div>';
            return;
        }

        container.innerHTML = queueData.map((item, index) => `
            <div class="queue-item">
                <div class="queue-index">${displayOrderMap.get(item.id) || index + 1}</div>
                <div class="queue-content">
                    <div class="queue-title">
                        <strong>${item.workOrderNo}</strong>
                        <span class="prep-badge ${this.getPrepStatusClass(item.materialPrepStatus)}">${this.getPrepStatusText(item.materialPrepStatus)}</span>
                        ${this.sortDraftIds.includes(item.id) ? '<span class="queue-flag">本次已勾选</span>' : ''}
                    </div>
                    <div class="queue-meta">
                        <span class="queue-chip">排序序号：${displayOrderMap.get(item.id) ?? '-'}</span>
                        <span class="queue-chip">工单状态：${this.getWorkOrderStatusText(item)}</span>
                    </div>
                    <div class="queue-products">${item.productInfos.map((product) => `${product.materialCode} / ${product.materialName}`).join('；')}</div>
                </div>
            </div>
        `).join('');
    }

    renderSortDraft() {
        const container = document.getElementById('sortSelectedList');
        const displayOrderMap = this.getDisplaySortOrderMap();
        const draftItems = this.sortDraftIds
            .map((id) => this.workOrderData.find((item) => item.id === id))
            .filter(Boolean);

        if (!draftItems.length) {
            container.innerHTML = '<div class="queue-empty">暂无可排序工单</div>';
            return;
        }

        container.innerHTML = draftItems.map((item, index) => `
            <div class="draft-item">
                <div class="draft-index">${index + 1}</div>
                <div class="draft-content">
                    <div class="draft-title">
                        <strong>${item.workOrderNo}</strong>
                        <span class="prep-badge ${this.getPrepStatusClass(item.materialPrepStatus)}">${this.getPrepStatusText(item.materialPrepStatus)}</span>
                    </div>
                    <div class="draft-meta">
                        <span class="draft-chip">当前排序序号：${displayOrderMap.get(item.id) ?? '-'}</span>
                        <span class="draft-chip">工单状态：${this.getWorkOrderStatusText(item)}</span>
                    </div>
                    <div class="draft-products">${item.productInfos.map((product) => `${product.materialCode} / ${product.materialName}`).join('；')}</div>
                </div>
                <div class="draft-actions">
                    <button class="draft-action-btn" data-draft-action="up" data-index="${index}" ${index === 0 ? 'disabled' : ''}>上移</button>
                    <button class="draft-action-btn" data-draft-action="down" data-index="${index}" ${index === draftItems.length - 1 ? 'disabled' : ''}>下移</button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('[data-draft-action]').forEach((button) => {
            button.addEventListener('click', () => {
                this.moveSortDraft(Number(button.dataset.index), button.dataset.draftAction);
            });
        });
    }

    moveSortDraft(index, direction) {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= this.sortDraftIds.length) {
            return;
        }

        const draft = [...this.sortDraftIds];
        [draft[index], draft[targetIndex]] = [draft[targetIndex], draft[index]];
        this.sortDraftIds = draft;
        this.renderSortDraft();
    }

    confirmSort() {
        const sortableItems = this.sortDraftIds
            .map((id) => this.workOrderData.find((item) => item.id === id))
            .filter((item) => item && this.canSelectForSorting(item));

        if (!sortableItems.length) {
            this.showAlertDialog('工单排序提示', '当前没有可确认排序的工单，请重新勾选。');
            return;
        }

        const confirmTime = this.getCurrentTime();
        sortableItems.forEach((item, index) => {
            item.sortConfirmedAt = confirmTime;
            item.sortSequence = index + 1;
            this.syncDerivedFields(item);
        });

        this.selectedIds.clear();
        this.hideSortModal();
        this.applyFilters();
        this.showMessage(`已完成 ${sortableItems.length} 张工单排序，页面排序序号已按当前队列重算为唯一顺位`, 'success');
    }

    hideSortModal() {
        const modal = document.getElementById('sortModal');
        modal.style.display = 'none';
        modal.classList.remove('active');
        this.sortDraftIds = [];
    }

    startWorkOrder(id) {
        const item = this.workOrderData.find((record) => record.id === id);
        if (!item || item.status !== '待执行') {
            return;
        }

        if (item.sortStatus === '未排序') {
            this.showAlertDialog('开始工单提示', `工单“${item.workOrderNo}”尚未排序，需先加入执行排序后才能开始工单。`);
            return;
        }

        if (item.materialPrepStatus === '未备料') {
            this.showAlertDialog('开始工单提示', `工单“${item.workOrderNo}”当前为未备料状态，完成备料后才能开始工单。`);
            return;
        }

        const runningOrder = this.workOrderData.find((record) => record.status === '执行中' && record.id !== id);
        if (runningOrder) {
            this.showAlertDialog('开始工单提示', `当前已有执行中的工单“${runningOrder.workOrderNo}”，同一时间仅允许一个工单执行。`);
            return;
        }

        this.showConfirmDialog(
            '确认开始工单',
            `确定开始工单“${item.workOrderNo}”吗？当前工单已排序且已备料，可开始执行。`,
            () => {
                item.status = '执行中';
                item.startTime = this.getCurrentTime();
                item.isPaused = false;
                this.syncDerivedFields(item);
                this.applyFilters();
                this.showMessage('工单已开始执行', 'success');
            }
        );
    }

    togglePauseWorkOrder(id) {
        const item = this.workOrderData.find((record) => record.id === id);
        if (!item || !['执行中', '已暂停'].includes(item.status)) {
            return;
        }

        const isPaused = item.status === '已暂停';
        const actionText = isPaused ? '继续' : '暂停';

        if (isPaused) {
            const runningOrder = this.workOrderData.find((record) => record.status === '执行中' && record.id !== id);
            if (runningOrder) {
                this.showAlertDialog('继续工单提示', `当前已有执行中的工单“${runningOrder.workOrderNo}”，请先完成或暂停该工单后再继续。`);
                return;
            }
        }

        this.showConfirmDialog(`确认${actionText}工单`, `确定要${actionText}工单“${item.workOrderNo}”吗？`, () => {
            item.status = isPaused ? '执行中' : '已暂停';
            item.isPaused = !isPaused;
            this.applyFilters();
            this.showMessage(`工单已${actionText}`, 'success');
        });
    }

    completeWorkOrder(id) {
        const item = this.workOrderData.find((record) => record.id === id);
        if (!item || !['执行中', '已暂停'].includes(item.status)) {
            return;
        }

        this.showConfirmDialog('确认完成工单', `确定完成工单“${item.workOrderNo}”吗？`, () => {
            const completeTime = this.getCurrentTime();
            item.status = '已完成';
            item.isPaused = false;
            item.packedQty = item.planQty;
            item.completeTime = completeTime;
            item.pendingOutboundStatus = '全部出库';
            item.inboundStatus = '全部入库';

            if (item.materialPrepStatus === '未备料') {
                item.materialPrepStatus = '备料完成';
                item.prepStartTime = item.prepStartTime || completeTime;
                item.prepCompleteTime = completeTime;
            } else if (item.materialPrepStatus === '备料中') {
                item.materialPrepStatus = '备料完成';
                item.prepCompleteTime = completeTime;
            }

            this.syncDerivedFields(item);
            this.applyFilters();
            this.showMessage('工单已完成', 'success');
        });
    }

    cancelWorkOrder(id) {
        const item = this.workOrderData.find((record) => record.id === id);
        if (!item || item.status !== '待执行') {
            return;
        }

        if (item.materialPrepStatus !== '未备料') {
            this.showAlertDialog('取消工单提示', `工单“${item.workOrderNo}”已开始备料或备料完成，不可取消。`);
            return;
        }

        this.showConfirmDialog('确认取消工单', `确定取消工单“${item.workOrderNo}”吗？取消后状态将变为已取消。`, () => {
            item.status = '已取消';
            item.sortConfirmedAt = '';
            item.sortSequence = null;
            item.prepStartTime = '';
            item.prepCompleteTime = '';
            this.syncDerivedFields(item);
            this.selectedIds.delete(item.id);
            this.applyFilters();
            this.showMessage('工单已取消', 'success');
        });
    }

    startMaterialPrep(id) {
        const item = this.workOrderData.find((record) => record.id === id);
        if (!item) {
            return;
        }

        if (!this.canStartMaterialPrep(item)) {
            this.showAlertDialog('开始备料提示', `工单“${item.workOrderNo}”未到备料顺位，需按排序顺序先完成前序工单备料。`);
            return;
        }

        this.showConfirmDialog('确认开始备料', `确定开始工单“${item.workOrderNo}”的包装纸箱备料吗？开始后排序将锁定。`, () => {
            item.materialPrepStatus = '备料中';
            item.prepStartTime = this.getCurrentTime();
            this.syncDerivedFields(item);
            this.selectedIds.delete(item.id);
            this.applyFilters();
            this.showMessage('备料已开始，工单排序已锁定', 'success');
        });
    }

    completeMaterialPrep(id) {
        const item = this.workOrderData.find((record) => record.id === id);
        if (!item) {
            return;
        }

        if (!this.canCompleteMaterialPrep(item)) {
            this.showAlertDialog('完成备料提示', `工单“${item.workOrderNo}”不是当前备料中的工单，不能直接完成备料。`);
            return;
        }

        this.showConfirmDialog('确认完成备料', `确定完成工单“${item.workOrderNo}”的包装纸箱备料吗？`, () => {
            item.materialPrepStatus = '备料完成';
            item.prepCompleteTime = this.getCurrentTime();
            this.syncDerivedFields(item);
            this.applyFilters();
            this.showMessage('备料已完成', 'success');
        });
    }

    showDetail(id) {
        const item = this.workOrderData.find((record) => record.id === id);
        if (!item) {
            return;
        }

        this.currentDetailId = id;
        const displayOrderMap = this.getDisplaySortOrderMap();
        document.getElementById('detailSummary').innerHTML = `
            <div class="detail-basic-item">
                <span class="detail-basic-label">工单编号：</span>
                <span class="detail-basic-value">${item.workOrderNo}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">工单状态：</span>
                <span class="detail-basic-value"><span class="basic-status-badge ${this.getWorkOrderStatusClass(item.status)}">${this.getWorkOrderStatusText(item)}</span></span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">排序序号：</span>
                <span class="detail-basic-value">${displayOrderMap.get(item.id) ?? '-'}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">备料状态：</span>
                <span class="detail-basic-value"><span class="basic-status-badge prep-${this.getPrepStatusClass(item.materialPrepStatus)}">${this.getPrepStatusText(item.materialPrepStatus)}</span></span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">备料开始时间：</span>
                <span class="detail-basic-value">${this.formatDisplayTime(item.prepStartTime)}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">备料完成时间：</span>
                <span class="detail-basic-value">${this.formatDisplayTime(item.prepCompleteTime)}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">待包装成品信息：</span>
                <span class="detail-basic-value">${item.productInfos.map((product) => `${product.materialCode}/${product.materialName}`).join('；')}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">计划包装数量：</span>
                <span class="detail-basic-value">${item.planQty}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">已包装数量：</span>
                <span class="detail-basic-value">${item.packedQty}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">执行开始时间：</span>
                <span class="detail-basic-value">${this.formatDisplayTime(item.startTime)}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">执行完成时间：</span>
                <span class="detail-basic-value">${this.formatDisplayTime(item.completeTime)}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">备注：</span>
                <span class="detail-basic-value">${item.remark || '-'}</span>
            </div>
        `;

        const pendingOutboundDetails = item.status === '已取消' ? [] : item.pendingOutboundDetails;
        const materialOutboundDetails = item.status === '已取消' ? [] : item.materialOutboundDetails;
        const inboundDetails = ['待执行', '已取消'].includes(item.status) && item.packedQty === 0 ? [] : item.inboundDetails;

        this.renderDetailRows('pendingOutboundTableBody', pendingOutboundDetails, 'outbound');
        this.renderDetailRows('materialOutboundTableBody', materialOutboundDetails, 'material');
        this.renderDetailRows('inboundTableBody', inboundDetails, 'inbound');

        const modal = document.getElementById('detailModal');
        modal.style.display = 'flex';
        modal.classList.add('active');
    }

    renderDetailRows(targetId, rows, category) {
        const tbody = document.getElementById(targetId);
        if (!rows.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="detail-empty">暂无明细数据</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = rows.map((row, index) => `
            <tr>
                <td>${row.seq || index + 1}</td>
                <td>${row.containerCode}</td>
                <td>${row.materialCode}</td>
                <td>${row.materialName}</td>
                <td>${row.quantity}</td>
                <td>${row.areaCode}</td>
                <td>${row.locationCode}</td>
                <td>${this.formatDisplayTime(row.time)}</td>
                <td><span class="detail-status-badge ${row.status.includes('已') ? 'done' : 'pending'}">${row.status}</span></td>
                <td><button class="inline-link" data-category="${category}" data-seq="${row.seq}">查看</button></td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.inline-link').forEach((button) => {
            button.addEventListener('click', () => {
                this.showItemDetail(this.currentDetailId, button.dataset.category, Number(button.dataset.seq));
            });
        });
    }

    showItemDetail(workOrderId, category, seq) {
        const item = this.workOrderData.find((record) => record.id === workOrderId);
        if (!item) {
            return;
        }

        const categoryMap = {
            outbound: item.pendingOutboundDetails,
            material: item.materialOutboundDetails,
            inbound: item.inboundDetails
        };
        const detail = (categoryMap[category] || []).find((record) => record.seq === seq);
        if (!detail) {
            return;
        }

        const quantityLabel = category === 'inbound' ? '入库数量' : '出库数量';
        const timeLabel = category === 'inbound' ? '入库时间' : '出库时间';
        const itemDetailContent = document.getElementById('itemDetailContent');

        document.getElementById('itemDetailTitle').textContent = `${detail.type} - 明细信息`;
        itemDetailContent.innerHTML = `
            <div class="item-detail-section">
                <div class="pallet-basic-section">
                    <div class="pallet-basic-title">基本信息</div>
                    <div class="pallet-basic-list">
                        <div class="pallet-basic-item">
                            <span class="pallet-basic-label">容器编码：</span>
                            <span class="pallet-basic-value">${detail.containerCode}</span>
                        </div>
                        <div class="pallet-basic-item">
                            <span class="pallet-basic-label">物料编码：</span>
                            <span class="pallet-basic-value">${detail.materialCode}</span>
                        </div>
                        <div class="pallet-basic-item">
                            <span class="pallet-basic-label">物料名称：</span>
                            <span class="pallet-basic-value">${detail.materialName}</span>
                        </div>
                        <div class="pallet-basic-item">
                            <span class="pallet-basic-label">${quantityLabel}：</span>
                            <span class="pallet-basic-value">${detail.quantity}</span>
                        </div>
                        <div class="pallet-basic-item">
                            <span class="pallet-basic-label">库区编码：</span>
                            <span class="pallet-basic-value">${detail.areaCode}</span>
                        </div>
                        <div class="pallet-basic-item">
                            <span class="pallet-basic-label">库位编码：</span>
                            <span class="pallet-basic-value">${detail.locationCode}</span>
                        </div>
                        <div class="pallet-basic-item">
                            <span class="pallet-basic-label">状态：</span>
                            <span class="pallet-basic-value">${detail.status}</span>
                        </div>
                        <div class="pallet-basic-item">
                            <span class="pallet-basic-label">${timeLabel}：</span>
                            <span class="pallet-basic-value">${this.formatDisplayTime(detail.time)}</span>
                        </div>
                        <div class="pallet-basic-item">
                            <span class="pallet-basic-label">目标位置：</span>
                            <span class="pallet-basic-value">${detail.targetLocation}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="item-detail-section">
                <h4 class="item-detail-section-title">容器内物料明细</h4>
                <div class="item-detail-table-wrap">
                    <table class="item-detail-table">
                        <thead>
                            <tr>
                                <th width="80">序号</th>
                                <th width="240">SN码</th>
                                <th width="160">物料编码</th>
                                <th width="180">物料名称</th>
                                <th width="100">状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${detail.itemDetails.map((detailItem) => `
                                <tr>
                                    <td>${detailItem.seq}</td>
                                    <td>${detailItem.snCode}</td>
                                    <td>${detailItem.materialCode}</td>
                                    <td>${detailItem.materialName}</td>
                                    <td>${detailItem.status}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const modal = document.getElementById('itemDetailModal');
        modal.style.display = 'flex';
        modal.classList.add('active');
    }

    hideDetailModal() {
        const modal = document.getElementById('detailModal');
        modal.style.display = 'none';
        modal.classList.remove('active');
    }

    hideItemDetailModal() {
        const modal = document.getElementById('itemDetailModal');
        modal.style.display = 'none';
        modal.classList.remove('active');
    }

    showConfirmDialog(title, message, onConfirm) {
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog active';
        dialog.innerHTML = `
            <div class="confirm-content">
                <div class="confirm-title">${title}</div>
                <div class="confirm-message">${message}</div>
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

        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) {
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
                <div class="confirm-message">${message}</div>
                <div class="confirm-actions">
                    <button class="confirm-btn info" id="alertOk">确定</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        dialog.querySelector('#alertOk').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) {
                document.body.removeChild(dialog);
            }
        });
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
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
            animation: slideInRight 0.3s ease;
        `;

        if (type === 'success') {
            messageEl.style.backgroundColor = '#16a34a';
        } else if (type === 'error') {
            messageEl.style.backgroundColor = '#dc2626';
        } else {
            messageEl.style.backgroundColor = '#2563eb';
        }

        document.body.appendChild(messageEl);

        setTimeout(() => {
            messageEl.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 2800);
    }

    formatDisplayTime(value) {
        return value || '-';
    }

    getCurrentTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
}

const mesWorkOrderToastStyle = document.createElement('style');
mesWorkOrderToastStyle.textContent = `
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
document.head.appendChild(mesWorkOrderToastStyle);

let mesWorkOrderPage;
document.addEventListener('DOMContentLoaded', () => {
    mesWorkOrderPage = new MESWorkOrderPage();
});
