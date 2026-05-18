// MES生产工单页面脚本

class MESWorkOrderPage {
    static PALLET_CAPACITY = 20;
    static MAX_PENDING_OUTBOUND_TASKS = 2;
    static SN_PREFIX = 'SN';

    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.workOrderData = this.buildMockData();
        this.filteredData = [...this.workOrderData];
        this.currentDetailId = null;

        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTable();
    }

    buildMockData() {
        const rawData = [
            {
                id: 1,
                workOrderNo: 'MES-WO-20240501-001',
                status: '待执行',
                productInfos: [
                    { materialCode: 'CP-2024-001', materialName: '20寸拉杆箱' },
                    { materialCode: 'CP-2024-002', materialName: '商务双肩包' }
                ],
                planQty: 320,
                packedQty: 0,
                syncTime: '2024-05-01 08:10:00',
                executor: '张三',
                startTime: '-',
                completeTime: '-',
                pendingOutboundStatus: '未出库',
                inboundStatus: '未入库',
                isPaused: false,
                remark: '早班首批生产工单',
                pendingOutboundDetails: [
                    { seq: 1, containerCode: 'TP-2001', materialCode: 'CP-2024-001', materialName: '20寸拉杆箱', quantity: 180, areaCode: 'A01', locationCode: '1-1-1-1', status: '待出库', time: '-', targetLocation: '包装工位01', type: '待包装成品出库明细' },
                    { seq: 2, containerCode: 'TP-2002', materialCode: 'CP-2024-002', materialName: '商务双肩包', quantity: 140, areaCode: 'A01', locationCode: '1-1-2-1', status: '待出库', time: '-', targetLocation: '包装工位02', type: '待包装成品出库明细' }
                ],
                materialOutboundDetails: [
                    { seq: 1, containerCode: 'FC-1001', materialCode: 'FC-2024-001', materialName: '包装纸箱', quantity: 320, areaCode: 'B02', locationCode: '2-1-1-1', status: '待出库', time: '-', targetLocation: '辅材工位01', type: '包装辅材出库明细' },
                    { seq: 2, containerCode: 'FC-1002', materialCode: 'FC-2024-002', materialName: '缓冲气泡袋', quantity: 320, areaCode: 'B02', locationCode: '2-1-2-1', status: '待出库', time: '-', targetLocation: '辅材工位01', type: '包装辅材出库明细' }
                ],
                inboundDetails: [
                    { seq: 1, containerCode: 'IN-3001', materialCode: 'CP-2024-001', materialName: '20寸拉杆箱', quantity: 180, areaCode: 'C01', locationCode: '3-1-1-1', status: '待入库', time: '-', targetLocation: '成品缓存区01', type: '成品入库明细' },
                    { seq: 2, containerCode: 'IN-3002', materialCode: 'CP-2024-002', materialName: '商务双肩包', quantity: 140, areaCode: 'C01', locationCode: '3-1-2-1', status: '待入库', time: '-', targetLocation: '成品缓存区02', type: '成品入库明细' }
                ]
            },
            {
                id: 2,
                workOrderNo: 'MES-WO-20240501-002',
                status: '执行中',
                productInfos: [
                    { materialCode: 'CP-2024-003', materialName: '登机箱' }
                ],
                planQty: 320,
                packedQty: 100,
                syncTime: '2024-05-01 09:30:00',
                executor: '李四',
                startTime: '2024-05-01 10:00:00',
                completeTime: '-',
                pendingOutboundStatus: '部分出库',
                inboundStatus: '部分入库',
                isPaused: false,
                remark: '已包装100个，其中80个已入库、20个待入库；待包装成品出库任务最多预生成2条待出库记录',
                detailScenario: [
                    {
                        materialCode: 'CP-2024-003',
                        materialName: '登机箱',
                        planQty: 320,
                        outboundDoneQty: 100,
                        packedQty: 100,
                        inboundDoneQty: 80,
                        outboundContainerCode: 'TP-2011',
                        outboundAreaCode: 'A02',
                        outboundLocationCode: '1-2-1-1',
                        outboundTargetLocation: '包装工位03',
                        outboundDoneTime: '2024-05-01 10:12:00',
                        inboundContainerCode: 'IN-3011',
                        inboundAreaCode: 'C02',
                        inboundLocationCode: '3-2-1-1',
                        inboundTargetLocation: '立库暂存位01',
                        inboundDoneTime: '2024-05-01 13:20:00'
                    }
                ],
                materialOutboundDetails: [
                    { seq: 1, containerCode: 'FC-1011', materialCode: 'FC-2024-003', materialName: '保护套', quantity: 320, areaCode: 'B01', locationCode: '2-2-1-1', status: '已出库', time: '2024-05-01 10:08:00', targetLocation: '辅材工位02', type: '包装辅材出库明细' },
                    { seq: 2, containerCode: 'FC-1012', materialCode: 'FC-2024-004', materialName: '吊牌', quantity: 320, areaCode: 'B01', locationCode: '2-2-2-1', status: '待出库', time: '-', targetLocation: '辅材工位02', type: '包装辅材出库明细' }
                ]
            },
            {
                id: 3,
                workOrderNo: 'MES-WO-20240501-003',
                status: '已完成',
                productInfos: [
                    { materialCode: 'CP-2024-004', materialName: '旅行收纳包' }
                ],
                planQty: 180,
                packedQty: 180,
                syncTime: '2024-05-01 11:00:00',
                executor: '王五',
                startTime: '2024-05-01 11:15:00',
                completeTime: '2024-05-01 15:40:00',
                pendingOutboundStatus: '全部出库',
                inboundStatus: '全部入库',
                isPaused: false,
                remark: '当日已完成工单',
                pendingOutboundDetails: [
                    { seq: 1, containerCode: 'TP-2021', materialCode: 'CP-2024-004', materialName: '旅行收纳包', quantity: 180, areaCode: 'A03', locationCode: '1-3-1-1', status: '已出库', time: '2024-05-01 11:20:00', targetLocation: '包装工位04', type: '待包装成品出库明细' }
                ],
                materialOutboundDetails: [
                    { seq: 1, containerCode: 'FC-1021', materialCode: 'FC-2024-005', materialName: '彩盒', quantity: 180, areaCode: 'B03', locationCode: '2-3-1-1', status: '已出库', time: '2024-05-01 11:18:00', targetLocation: '辅材工位03', type: '包装辅材出库明细' }
                ],
                inboundDetails: [
                    { seq: 1, containerCode: 'IN-3021', materialCode: 'CP-2024-004', materialName: '旅行收纳包', quantity: 180, areaCode: 'C03', locationCode: '3-3-1-1', status: '已入库', time: '2024-05-01 15:15:00', targetLocation: '立库A-01-01', type: '成品入库明细' }
                ]
            },
            {
                id: 4,
                workOrderNo: 'MES-WO-20240501-004',
                status: '已取消',
                productInfos: [
                    { materialCode: 'CP-2024-005', materialName: '铝框箱' }
                ],
                planQty: 90,
                packedQty: 0,
                syncTime: '2024-05-01 14:10:00',
                executor: '赵六',
                startTime: '-',
                completeTime: '-',
                pendingOutboundStatus: '未出库',
                inboundStatus: '未入库',
                isPaused: false,
                remark: 'MES撤销下发',
                pendingOutboundDetails: [
                    { seq: 1, containerCode: 'TP-2031', materialCode: 'CP-2024-005', materialName: '铝框箱', quantity: 90, areaCode: 'A04', locationCode: '1-4-1-1', status: '待出库', time: '-', targetLocation: '包装工位05', type: '待包装成品出库明细' }
                ],
                materialOutboundDetails: [
                    { seq: 1, containerCode: 'FC-1031', materialCode: 'FC-2024-006', materialName: '拉链袋', quantity: 90, areaCode: 'B04', locationCode: '2-4-1-1', status: '待出库', time: '-', targetLocation: '辅材工位04', type: '包装辅材出库明细' }
                ],
                inboundDetails: [
                    { seq: 1, containerCode: 'IN-3031', materialCode: 'CP-2024-005', materialName: '铝框箱', quantity: 90, areaCode: 'C04', locationCode: '3-4-1-1', status: '待入库', time: '-', targetLocation: '立库B-01-01', type: '成品入库明细' }
                ]
            },
            {
                id: 5,
                workOrderNo: 'MES-WO-20240502-001',
                status: '待执行',
                productInfos: [
                    { materialCode: 'CP-2024-006', materialName: '儿童拉杆箱' },
                    { materialCode: 'CP-2024-007', materialName: '硬壳化妆箱' }
                ],
                planQty: 240,
                packedQty: 0,
                syncTime: '2024-05-02 08:00:00',
                executor: '张三',
                startTime: '-',
                completeTime: '-',
                pendingOutboundStatus: '未出库',
                inboundStatus: '未入库',
                isPaused: false,
                remark: '跨物料组合工单',
                pendingOutboundDetails: [
                    { seq: 1, containerCode: 'TP-2041', materialCode: 'CP-2024-006', materialName: '儿童拉杆箱', quantity: 120, areaCode: 'A01', locationCode: '1-1-3-1', status: '待出库', time: '-', targetLocation: '包装工位06', type: '待包装成品出库明细' },
                    { seq: 2, containerCode: 'TP-2042', materialCode: 'CP-2024-007', materialName: '硬壳化妆箱', quantity: 120, areaCode: 'A01', locationCode: '1-1-4-1', status: '待出库', time: '-', targetLocation: '包装工位06', type: '待包装成品出库明细' }
                ],
                materialOutboundDetails: [
                    { seq: 1, containerCode: 'FC-1041', materialCode: 'FC-2024-007', materialName: '珍珠棉', quantity: 240, areaCode: 'B02', locationCode: '2-1-3-1', status: '待出库', time: '-', targetLocation: '辅材工位05', type: '包装辅材出库明细' }
                ],
                inboundDetails: [
                    { seq: 1, containerCode: 'IN-3041', materialCode: 'CP-2024-006', materialName: '儿童拉杆箱', quantity: 120, areaCode: 'C01', locationCode: '3-1-3-1', status: '待入库', time: '-', targetLocation: '成品缓存区03', type: '成品入库明细' },
                    { seq: 2, containerCode: 'IN-3042', materialCode: 'CP-2024-007', materialName: '硬壳化妆箱', quantity: 120, areaCode: 'C01', locationCode: '3-1-4-1', status: '待入库', time: '-', targetLocation: '成品缓存区04', type: '成品入库明细' }
                ]
            }
        ].map((item) => this.normalizeStorageCodes(item));

        return rawData.map((item) => this.normalizeWorkOrderDetails(item));
    }

    normalizeStorageCodes(item) {
        const normalizeDetails = (details = []) => details.map((detail) => {
            const originalAreaCode = detail.areaCode;

            return {
                ...detail,
                areaCode: this.formatAreaCode(originalAreaCode),
                locationCode: this.formatLocationCode(originalAreaCode, detail.locationCode)
            };
        });

        const normalizeScenario = (scenario) => ({
            ...scenario,
            outboundAreaCode: this.formatAreaCode(scenario.outboundAreaCode),
            outboundLocationCode: this.formatLocationCode(scenario.outboundAreaCode, scenario.outboundLocationCode),
            inboundAreaCode: this.formatAreaCode(scenario.inboundAreaCode),
            inboundLocationCode: this.formatLocationCode(scenario.inboundAreaCode, scenario.inboundLocationCode)
        });

        return {
            ...item,
            pendingOutboundDetails: normalizeDetails(item.pendingOutboundDetails),
            materialOutboundDetails: normalizeDetails(item.materialOutboundDetails),
            inboundDetails: normalizeDetails(item.inboundDetails),
            detailScenario: item.detailScenario ? item.detailScenario.map((scenario) => normalizeScenario(scenario)) : item.detailScenario
        };
    }

    normalizeWorkOrderDetails(item) {
        const detailData = item.detailScenario
            ? this.buildScenarioDetails(item.detailScenario)
            : {
                pendingOutboundDetails: this.expandDetailsToPallets(item.pendingOutboundDetails),
                inboundDetails: this.expandDetailsToPallets(item.inboundDetails)
            };

        return {
            ...item,
            ...detailData,
            pendingOutboundDetails: this.enrichDetailItems(this.limitPendingOutboundTasks(detailData.pendingOutboundDetails), 'outbound'),
            materialOutboundDetails: this.enrichDetailItems(item.materialOutboundDetails, 'material'),
            inboundDetails: this.enrichDetailItems(detailData.inboundDetails, 'inbound')
        };
    }

    buildScenarioDetails(scenarios) {
        return {
            pendingOutboundDetails: this.buildScenarioRows(scenarios, 'outbound'),
            inboundDetails: this.buildScenarioRows(scenarios, 'inbound')
        };
    }

    buildScenarioRows(scenarios, category) {
        let seq = 1;

        return scenarios.flatMap((scenario) => {
            const rows = category === 'outbound'
                ? this.splitFlowRows({
                    totalQty: scenario.planQty,
                    doneQty: scenario.outboundDoneQty,
                    containerCode: scenario.outboundContainerCode,
                    materialCode: scenario.materialCode,
                    materialName: scenario.materialName,
                    areaCode: scenario.outboundAreaCode,
                    locationCode: scenario.outboundLocationCode,
                    doneTime: scenario.outboundDoneTime,
                    pendingTime: '-',
                    targetLocation: scenario.outboundTargetLocation,
                    doneStatus: '已出库',
                    pendingStatus: '待出库',
                    type: '待包装成品出库明细'
                })
                : this.splitFlowRows({
                    totalQty: scenario.packedQty,
                    doneQty: scenario.inboundDoneQty,
                    containerCode: scenario.inboundContainerCode,
                    materialCode: scenario.materialCode,
                    materialName: scenario.materialName,
                    areaCode: scenario.inboundAreaCode,
                    locationCode: scenario.inboundLocationCode,
                    doneTime: scenario.inboundDoneTime,
                    pendingTime: '-',
                    targetLocation: scenario.inboundTargetLocation,
                    doneStatus: '已入库',
                    pendingStatus: '待入库',
                    type: '成品入库明细'
                });

            return rows.map((row) => ({
                ...row,
                seq: seq++
            }));
        });
    }

    splitFlowRows(config) {
        if (!config.totalQty) {
            return [];
        }

        let remainingTotal = config.totalQty;
        let remainingDone = config.doneQty;
        let index = 0;
        const rows = [];

        while (remainingTotal > 0) {
            const rowQty = Math.min(MESWorkOrderPage.PALLET_CAPACITY, remainingTotal);
            const isDone = remainingDone >= rowQty;

            rows.push({
                containerCode: this.buildContainerCode(config.containerCode, index),
                materialCode: config.materialCode,
                materialName: config.materialName,
                quantity: rowQty,
                areaCode: config.areaCode,
                locationCode: this.buildLocationCode(config.locationCode, index),
                status: isDone ? config.doneStatus : config.pendingStatus,
                time: isDone ? config.doneTime : config.pendingTime,
                targetLocation: config.targetLocation,
                type: config.type
            });

            remainingTotal -= rowQty;
            remainingDone = Math.max(0, remainingDone - rowQty);
            index += 1;
        }

        return rows;
    }

    expandDetailsToPallets(details) {
        let seq = 1;

        return details.flatMap((detail) => {
            const palletCount = Math.ceil(detail.quantity / MESWorkOrderPage.PALLET_CAPACITY);

            return Array.from({ length: palletCount }, (_, index) => {
                const remainingQty = detail.quantity - index * MESWorkOrderPage.PALLET_CAPACITY;

                return {
                    ...detail,
                    seq: seq++,
                    containerCode: this.buildContainerCode(detail.containerCode, index),
                    locationCode: this.buildLocationCode(detail.locationCode, index),
                    quantity: Math.min(MESWorkOrderPage.PALLET_CAPACITY, remainingQty)
                };
            });
        });
    }

    limitPendingOutboundTasks(details) {
        let pendingCount = 0;

        return details.filter((detail) => {
            if (detail.status !== '待出库') {
                return true;
            }

            if (pendingCount >= MESWorkOrderPage.MAX_PENDING_OUTBOUND_TASKS) {
                return false;
            }

            pendingCount += 1;
            return true;
        });
    }

    enrichDetailItems(details, category) {
        return details.map((detail, index) => ({
            ...detail,
            itemDetails: this.buildItemDetails(detail, category, index)
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

    formatAreaCode(areaCode) {
        const matchedPkArea = String(areaCode).match(/^PK(\d{3})$/);
        if (matchedPkArea) {
            return `PK${matchedPkArea[1]}`;
        }

        const matchedLegacyArea = String(areaCode).match(/^([A-Z])(\d{2})$/);
        if (matchedLegacyArea) {
            const prefix = matchedLegacyArea[1];
            const value = Number(matchedLegacyArea[2]);
            const prefixOffsetMap = {
                A: 0,
                B: 4,
                C: 8
            };
            const offset = prefixOffsetMap[prefix] ?? 0;

            return `PK${String(offset + value).padStart(3, '0')}`;
        }

        return `PK${String(areaCode).replace(/\D/g, '').padStart(3, '0').slice(-3) || '001'}`;
    }

    formatLocationCode(areaCode, locationCode) {
        const formattedAreaCode = this.formatAreaCode(areaCode);
        const matchedPkLocation = String(locationCode).match(/^PK\d{3}-(\d{2})-(\d{3})$/);
        if (matchedPkLocation) {
            return `${formattedAreaCode}-${matchedPkLocation[1]}-${matchedPkLocation[2]}`;
        }

        const segments = String(locationCode).split('-').map((segment) => Number(segment));
        if (segments.length >= 4 && segments.every((segment) => !Number.isNaN(segment))) {
            const lane = String(segments[1]).padStart(2, '0');
            const slot = String((segments[2] - 1) * 10 + segments[3]).padStart(3, '0');

            return `${formattedAreaCode}-${lane}-${slot}`;
        }

        return `${formattedAreaCode}-01-001`;
    }

    buildContainerCode(containerCode, index) {
        return `${containerCode}-${String(index + 1).padStart(2, '0')}`;
    }

    buildLocationCode(locationCode, index) {
        const matchedPkLocation = String(locationCode).match(/^(PK\d{3})-(\d{2})-(\d{3})$/);
        if (matchedPkLocation) {
            const nextSlot = String(Number(matchedPkLocation[3]) + index).padStart(3, '0');
            return `${matchedPkLocation[1]}-${matchedPkLocation[2]}-${nextSlot}`;
        }

        const segments = String(locationCode).split('-');
        if (!segments.length) {
            return locationCode;
        }

        const lastSegment = Number(segments[segments.length - 1]);
        if (Number.isNaN(lastSegment)) {
            return `${locationCode}-${index + 1}`;
        }

        segments[segments.length - 1] = String(lastSegment + index);
        return segments.join('-');
    }

    bindEvents() {
        document.getElementById('searchBtn').addEventListener('click', () => this.search());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetSearch());
        document.getElementById('prevPage').addEventListener('click', () => this.goToPage(this.currentPage - 1));
        document.getElementById('nextPage').addEventListener('click', () => this.goToPage(this.currentPage + 1));

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

        document.getElementById('closeDetailModal').addEventListener('click', () => this.hideDetailModal());
        document.getElementById('closeDetailBtn').addEventListener('click', () => this.hideDetailModal());
        document.getElementById('closeItemDetailModal').addEventListener('click', () => this.hideItemDetailModal());
        document.getElementById('closeItemDetailBtn').addEventListener('click', () => this.hideItemDetailModal());

        [
            'searchWorkOrderNo',
            'searchProductInfo',
            'searchExecutor'
        ].forEach((id) => {
            document.getElementById(id).addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    this.search();
                }
            });
        });
    }

    search() {
        const workOrderNo = document.getElementById('searchWorkOrderNo').value.trim().toLowerCase();
        const status = document.getElementById('searchStatus').value;
        const syncStart = document.getElementById('searchSyncStart').value;
        const syncEnd = document.getElementById('searchSyncEnd').value;
        const productInfo = document.getElementById('searchProductInfo').value.trim().toLowerCase();
        const executor = document.getElementById('searchExecutor').value.trim().toLowerCase();
        const inboundCompleted = document.getElementById('searchInboundCompleted').value;

        this.filteredData = this.workOrderData.filter((item) => {
            const matchWorkOrderNo = !workOrderNo || item.workOrderNo.toLowerCase().includes(workOrderNo);
            const matchStatus = !status || item.status === status;
            const matchSyncTime = this.matchesDateRange(item.syncTime, syncStart, syncEnd);
            const matchProductInfo = !productInfo || item.productInfos.some((product) =>
                product.materialCode.toLowerCase().includes(productInfo) ||
                product.materialName.toLowerCase().includes(productInfo)
            );
            const matchExecutor = !executor || item.executor.toLowerCase().includes(executor);
            const inboundCompletedValue = item.inboundStatus === '全部入库' ? '是' : '否';
            const matchInboundCompleted = !inboundCompleted || inboundCompletedValue === inboundCompleted;

            return matchWorkOrderNo &&
                matchStatus &&
                matchSyncTime &&
                matchProductInfo &&
                matchExecutor &&
                matchInboundCompleted;
        });

        this.currentPage = 1;
        this.renderTable();
    }

    resetSearch() {
        [
            'searchWorkOrderNo',
            'searchStatus',
            'searchSyncStart',
            'searchSyncEnd',
            'searchProductInfo',
            'searchExecutor',
            'searchInboundCompleted'
        ].forEach((id) => {
            document.getElementById(id).value = '';
        });

        this.filteredData = [...this.workOrderData];
        this.currentPage = 1;
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

    renderTable() {
        const tbody = document.getElementById('workOrderTableBody');
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageData = this.filteredData.slice(start, end);

        if (!pageData.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="12">
                        <div class="empty-state">
                            <div class="empty-icon">🧾</div>
                            <div class="empty-text">暂无工单数据</div>
                            <div class="empty-desc">没有找到符合条件的MES生产工单</div>
                        </div>
                    </td>
                </tr>
            `;
            this.updatePagination();
            return;
        }

        tbody.innerHTML = pageData.map((item) => `
            <tr>
                <td><button class="workorder-link" data-action="view" data-id="${item.id}">${item.workOrderNo}</button></td>
                <td><span class="status-badge ${this.getWorkOrderStatusClass(item.status)}">${item.status}</span></td>
                <td class="product-summary">${this.renderProductSummary(item.productInfos)}</td>
                <td>${item.planQty}</td>
                <td>${item.packedQty}</td>
                <td>${item.syncTime}</td>
                <td>${item.executor}</td>
                <td>${item.startTime}</td>
                <td>${item.completeTime}</td>
                <td><span class="progress-badge ${this.getFlowStatusClass(item.pendingOutboundStatus)}">${item.pendingOutboundStatus}</span></td>
                <td><span class="progress-badge ${this.getFlowStatusClass(item.inboundStatus)}">${item.inboundStatus}</span></td>
                <td>
                    <div class="action-btns">
                        ${this.renderActionButtons(item)}
                    </div>
                </td>
            </tr>
        `).join('');

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
    }

    renderProductSummary(productInfos) {
        return productInfos.map((product) => `
            <div class="product-summary-item">${product.materialCode} / ${product.materialName}</div>
        `).join('');
    }

    renderActionButtons(item) {
        const actions = [];

        if (item.status === '待执行') {
            actions.push(`<button class="action-link primary" data-action="start" data-id="${item.id}">开始工单</button>`);
            actions.push(`<button class="action-link danger" data-action="cancel" data-id="${item.id}">取消工单</button>`);
        }

        if (item.status === '执行中') {
            actions.push(`<button class="action-link warning" data-action="toggle-pause" data-id="${item.id}">${item.isPaused ? '继续工单' : '暂停工单'}</button>`);
            actions.push(`<button class="action-link success" data-action="complete" data-id="${item.id}">完成工单</button>`);
        }

        return actions.join('');
    }

    getWorkOrderStatusClass(status) {
        const statusMap = {
            '待执行': 'pending',
            '执行中': 'processing',
            '已完成': 'completed',
            '已取消': 'cancelled'
        };
        return statusMap[status] || 'pending';
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

    startWorkOrder(id) {
        const item = this.workOrderData.find((record) => record.id === id);
        if (!item || item.status !== '待执行') {
            return;
        }

        const runningOrder = this.workOrderData.find((record) => record.status === '执行中' && record.id !== id);
        if (runningOrder) {
            this.showAlertDialog('开始工单提示', `当前已有执行中的工单“${runningOrder.workOrderNo}”，同一时间仅允许一个工单执行。`);
            return;
        }

        this.showConfirmDialog('确认开始工单', `确定开始工单“${item.workOrderNo}”吗？`, () => {
            item.status = '执行中';
            item.startTime = this.getCurrentTime();
            item.isPaused = false;
            this.renderTable();
            this.showMessage('工单已开始执行', 'success');
        });
    }

    togglePauseWorkOrder(id) {
        const item = this.workOrderData.find((record) => record.id === id);
        if (!item || item.status !== '执行中') {
            return;
        }

        const actionText = item.isPaused ? '继续' : '暂停';
        this.showConfirmDialog(`确认${actionText}工单`, `确定要${actionText}工单“${item.workOrderNo}”吗？`, () => {
            item.isPaused = !item.isPaused;
            this.renderTable();
            this.showMessage(`工单已${actionText}`, 'success');
        });
    }

    completeWorkOrder(id) {
        const item = this.workOrderData.find((record) => record.id === id);
        if (!item || item.status !== '执行中') {
            return;
        }

        this.showConfirmDialog('确认完成工单', `确定完成工单“${item.workOrderNo}”吗？`, () => {
            item.status = '已完成';
            item.isPaused = false;
            item.packedQty = item.planQty;
            item.completeTime = this.getCurrentTime();
            item.pendingOutboundStatus = '全部出库';
            item.inboundStatus = '全部入库';
            item.pendingOutboundDetails.forEach((detail) => {
                detail.status = '已出库';
                if (detail.time === '-') {
                    detail.time = item.completeTime;
                }
            });
            item.materialOutboundDetails.forEach((detail) => {
                detail.status = '已出库';
                if (detail.time === '-') {
                    detail.time = item.completeTime;
                }
            });
            item.inboundDetails.forEach((detail) => {
                detail.status = '已入库';
                if (detail.time === '-') {
                    detail.time = item.completeTime;
                }
            });
            this.renderTable();
            this.showMessage('工单已完成', 'success');
        });
    }

    cancelWorkOrder(id) {
        const item = this.workOrderData.find((record) => record.id === id);
        if (!item || item.status !== '待执行') {
            return;
        }

        this.showConfirmDialog('确认取消工单', `确定取消工单“${item.workOrderNo}”吗？取消后状态将变为已取消。`, () => {
            item.status = '已取消';
            this.renderTable();
            this.showMessage('工单已取消', 'success');
        });
    }

    showDetail(id) {
        const item = this.workOrderData.find((record) => record.id === id);
        if (!item) {
            return;
        }

        this.currentDetailId = id;
        document.getElementById('detailSummary').innerHTML = `
            <div class="detail-basic-item">
                <span class="detail-basic-label">工单编号：</span>
                <span class="detail-basic-value">${item.workOrderNo}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">工单状态：</span>
                <span class="detail-basic-value"><span class="basic-status-badge ${this.getWorkOrderStatusClass(item.status)}">${item.status}${item.status === '执行中' && item.isPaused ? '（已暂停）' : ''}</span></span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">执行人员：</span>
                <span class="detail-basic-value">${item.executor}</span>
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
                <span class="detail-basic-label">同步时间：</span>
                <span class="detail-basic-value">${item.syncTime}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">执行开始时间：</span>
                <span class="detail-basic-value">${item.startTime}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">执行完成时间：</span>
                <span class="detail-basic-value">${item.completeTime}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">待包装成品出库状态：</span>
                <span class="detail-basic-value">${item.pendingOutboundStatus}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">成品入库状态：</span>
                <span class="detail-basic-value">${item.inboundStatus}</span>
            </div>
        `;

        const pendingOutboundDetails = item.status === '已取消' ? [] : item.pendingOutboundDetails;
        const materialOutboundDetails = item.status === '已取消' ? [] : item.materialOutboundDetails;
        const inboundDetails = ['待执行', '已取消'].includes(item.status) ? [] : item.inboundDetails;

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
                <td>${row.time}</td>
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
        const itemDetailContent = document.getElementById('itemDetailContent');

        const map = {
            outbound: item.pendingOutboundDetails,
            material: item.materialOutboundDetails,
            inbound: item.inboundDetails
        };
        const detail = (map[category] || []).find((record) => record.seq === seq);
        if (!detail) {
            return;
        }

        if (category === 'outbound' || category === 'inbound') {
            this.showPalletDetail(detail, category);
            return;
        }

        itemDetailContent.className = 'item-detail-content';

        const quantityLabel = category === 'inbound' ? '入库数量' : '出库数量';
        const timeLabel = category === 'inbound' ? '入库时间' : '出库时间';
        const locationLabel = category === 'inbound' ? '入库位置' : '出库位置';

        document.getElementById('itemDetailTitle').textContent = detail.type;
        itemDetailContent.innerHTML = `
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
                        <span class="pallet-basic-value">${detail.time}</span>
                    </div>
                </div>
            </div>
        `;

        const modal = document.getElementById('itemDetailModal');
        modal.style.display = 'flex';
        modal.classList.add('active');
    }

    showPalletDetail(detail, category) {
        const quantityLabel = category === 'inbound' ? '入库数量' : '出库数量';
        const timeLabel = category === 'inbound' ? '入库时间' : '出库时间';
        const itemDetailContent = document.getElementById('itemDetailContent');

        itemDetailContent.className = 'item-detail-content';

        document.getElementById('itemDetailTitle').textContent = `${detail.type} - 托盘明细`;
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
                            <span class="pallet-basic-value">${detail.time}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="item-detail-section">
                <h4 class="item-detail-section-title">托盘内物料明细</h4>
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
                            ${detail.itemDetails.map((item) => `
                                <tr>
                                    <td>${item.seq}</td>
                                    <td>${item.snCode}</td>
                                    <td>${item.materialCode}</td>
                                    <td>${item.materialName}</td>
                                    <td>${item.status}</td>
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
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease;
        `;

        if (type === 'success') {
            messageEl.style.backgroundColor = '#52c41a';
        } else if (type === 'error') {
            messageEl.style.backgroundColor = '#ff4d4f';
        } else {
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
        }, 2500);
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
