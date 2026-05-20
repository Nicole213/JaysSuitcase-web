class FinishedInspectionOrderPage {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.editingId = null;
        this.currentDetailId = null;
        this.labOptions = ['检验室1', '检验室2', '检验室3'];
        this.mesOptions = [
            { no: 'SO-20260514-001', productCode: 'CP-300101', productName: '20寸拉杆箱', totalPallets: 12 },
            { no: 'SO-20260514-002', productCode: 'CP-300205', productName: '商务双肩包', totalPallets: 8 },
            { no: 'SO-20260514-003', productCode: 'CP-300318', productName: '旅行收纳箱', totalPallets: 16 },
            { no: 'SO-20260514-004', productCode: 'CP-300422', productName: '儿童拉杆箱', totalPallets: 10 }
        ];

        this.statusMap = {
            '待分配': 'pending',
            '已分配': 'processing',
            '待生成': 'pending',
            '待出库': 'pending',
            '部分已出库': 'processing',
            '已出库': 'processing',
            '待检验': 'processing',
            '检验中': 'processing',
            '待回库': 'pending',
            '部分已回库': 'processing',
            '已回库': 'completed',
            '已完成': 'completed',
            '合格': 'completed',
            '待判定': 'pending'
        };

        this.orderData = this.buildMockData();
        this.filteredData = [...this.orderData];
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.renderMesOptions();
        this.applyFilters();
    }

    cacheElements() {
        this.tableBody = document.getElementById('inspectionTableBody');
        this.searchInspectionNo = document.getElementById('searchInspectionNo');
        this.searchMesNo = document.getElementById('searchMesNo');
        this.searchStatus = document.getElementById('searchStatus');
        this.currentPageEl = document.getElementById('currentPage');
        this.totalPagesEl = document.getElementById('totalPages');
        this.prevPageBtn = document.getElementById('prevPage');
        this.nextPageBtn = document.getElementById('nextPage');

        this.pendingCountEl = document.getElementById('pendingCount');
        this.processingCountEl = document.getElementById('processingCount');
        this.completedCountEl = document.getElementById('completedCount');
        this.cancelledCountEl = document.getElementById('cancelledCount');

        this.inspectionModal = document.getElementById('inspectionModal');
        this.detailModal = document.getElementById('detailModal');
        this.snDetailModal = document.getElementById('snDetailModal');
        this.imagePreviewModal = document.getElementById('imagePreviewModal');
        this.outboundDetailSection = document.getElementById('outboundDetailSection');
        this.palletDetailSection = document.getElementById('palletDetailSection');
        this.modalTitle = document.getElementById('modalTitle');
        this.inspectionForm = document.getElementById('inspectionForm');
        this.inspectionNoInput = document.getElementById('inspectionNo');
        this.mesOrderNoInput = document.getElementById('mesOrderNo');
        this.inspectionTypeInput = document.getElementById('inspectionType');
        this.materialDisplay = document.getElementById('materialDisplay');
        this.totalPalletsDisplay = document.getElementById('totalPalletsDisplay');
        this.targetLabGroup = document.getElementById('targetLabGroup');
        this.targetLabInput = document.getElementById('targetLab');
        this.palletCountGroup = document.getElementById('palletCountGroup');
        this.palletCountInput = document.getElementById('palletCount');
        this.inspectionRemarkInput = document.getElementById('inspectionRemark');
    }

    bindEvents() {
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.currentPage = 1;
            this.applyFilters();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.searchInspectionNo.value = '';
            this.searchMesNo.value = '';
            this.searchStatus.value = '';
            this.currentPage = 1;
            this.applyFilters();
        });

        document.getElementById('addBtn').addEventListener('click', () => this.openAddModal());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveOrder());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal(this.inspectionModal));
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal(this.inspectionModal));
        document.getElementById('closeDetailModal').addEventListener('click', () => this.closeModal(this.detailModal));
        document.getElementById('closeDetailBtn').addEventListener('click', () => this.closeModal(this.detailModal));
        document.getElementById('closeSnDetailModal').addEventListener('click', () => this.closeModal(this.snDetailModal));
        document.getElementById('closeSnDetailBtn').addEventListener('click', () => this.closeModal(this.snDetailModal));
        document.getElementById('closeImagePreviewModal').addEventListener('click', () => this.closeModal(this.imagePreviewModal));
        document.getElementById('closeImagePreviewBtn').addEventListener('click', () => this.closeModal(this.imagePreviewModal));
        this.mesOrderNoInput.addEventListener('change', () => this.updateMesRelatedFields(this.mesOrderNoInput.value));
        this.inspectionTypeInput.addEventListener('change', () => {
            this.syncInspectionTypePlaceholderState();
            this.updateInspectionTypeFields(this.inspectionTypeInput.value);
        });
        this.inspectionTypeInput.addEventListener('mousedown', () => this.prepareInspectionTypeDropdown());
        this.inspectionTypeInput.addEventListener('keydown', (event) => {
            if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
                this.prepareInspectionTypeDropdown();
            }
        });
        this.inspectionTypeInput.addEventListener('blur', () => this.syncInspectionTypePlaceholderState());

        this.prevPageBtn.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage -= 1;
                this.renderTable();
            }
        });

        this.nextPageBtn.addEventListener('click', () => {
            const totalPages = this.getTotalPages();
            if (this.currentPage < totalPages) {
                this.currentPage += 1;
                this.renderTable();
            }
        });

        [this.inspectionModal, this.detailModal, this.snDetailModal, this.imagePreviewModal].forEach((modal) => {
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
    }

    buildMockData() {
        return [
            this.hydrateOrder({
                id: 1,
                inspectionNo: 'CJ-CJ-20260514-001',
                mesOrderNo: 'SO-20260514-001',
                inspectionType: '检验室抽检',
                productCode: 'CP-300101',
                productName: '20寸拉杆箱',
                targetLab: '检验室1',
                palletCount: 4,
                status: '待分配',
                createTime: '2026-05-14 08:30:00',
                completeTime: '-',
                remark: '检验室抽检待分配，待系统分配出库容器',
                outboundStarted: false,
                outboundDetails: [],
                inboundDetails: [],
                resultDetails: []
            }),
            this.hydrateOrder({
                id: 2,
                inspectionNo: 'CJ-CJ-20260514-002',
                mesOrderNo: 'SO-20260514-002',
                inspectionType: '检验室抽检',
                productCode: 'CP-300205',
                productName: '商务双肩包',
                targetLab: '检验室2',
                palletCount: 3,
                status: '已分配',
                outboundProgress: 'none',
                createTime: '2026-05-14 09:05:00',
                completeTime: '-',
                remark: '检验室抽检已分配，当前均待出库',
                outboundStarted: false
            }),
            this.hydrateOrder({
                id: 3,
                inspectionNo: 'CJ-CJ-20260514-003',
                mesOrderNo: 'SO-20260514-003',
                inspectionType: '检验室抽检',
                productCode: 'CP-300318',
                productName: '旅行收纳箱',
                targetLab: '检验室3',
                palletCount: 5,
                status: '已分配',
                outboundProgress: 'mixed',
                createTime: '2026-05-14 09:20:00',
                completeTime: '-',
                remark: '检验室抽检已分配，当前部分容器已出库',
                outboundStarted: false
            }),
            this.hydrateOrder({
                id: 4,
                inspectionNo: 'CJ-CJ-20260514-004',
                mesOrderNo: 'SO-20260514-003',
                inspectionType: '检验室抽检',
                productCode: 'CP-300318',
                productName: '旅行收纳箱',
                targetLab: '检验室3',
                palletCount: 5,
                status: '待检验',
                outboundProgress: 'allOut',
                createTime: '2026-05-14 09:40:00',
                completeTime: '-',
                remark: '检验室抽检待检验，容器均已出库',
                outboundStarted: true
            }),
            this.hydrateOrder({
                id: 5,
                inspectionType: '现场抽检',
                inspectionNo: 'CJ-CJ-20260514-005',
                mesOrderNo: 'SO-20260514-004',
                productCode: 'CP-300422',
                productName: '儿童拉杆箱',
                status: '待检验',
                createTime: '2026-05-14 10:05:00',
                completeTime: '-',
                remark: '现场抽检待检验，待现场执行抽检',
                outboundStarted: false,
                outboundDetails: [],
                inboundDetails: [],
                resultDetails: []
            }),
            this.hydrateOrder({
                id: 6,
                inspectionNo: 'CJ-CJ-20260514-006',
                mesOrderNo: 'SO-20260514-001',
                inspectionType: '检验室抽检',
                productCode: 'CP-300101',
                productName: '20寸拉杆箱',
                targetLab: '检验室1',
                palletCount: 2,
                status: '检验中',
                outboundProgress: 'allOut',
                resultProgress: 'partial',
                completedInspectCount: 1,
                createTime: '2026-05-14 10:15:00',
                completeTime: '-',
                remark: '检验室抽检进行中，正在复核拉杆耐久项目',
                outboundStarted: true
            }),
            this.hydrateOrder({
                id: 7,
                inspectionNo: 'CJ-CJ-20260514-007',
                mesOrderNo: 'SO-20260514-002',
                inspectionType: '现场抽检',
                productCode: 'CP-300205',
                productName: '商务双肩包',
                status: '检验中',
                createTime: '2026-05-14 10:40:00',
                completeTime: '-',
                remark: '现场抽检进行中，正在复核缝线与拉链一致性',
                outboundStarted: false,
                outboundDetails: [],
                inboundDetails: [],
                resultDetails: []
            }),
            this.hydrateOrder({
                id: 8,
                inspectionNo: 'CJ-CJ-20260514-008',
                mesOrderNo: 'SO-20260514-003',
                inspectionType: '检验室抽检',
                productCode: 'CP-300318',
                productName: '旅行收纳箱',
                targetLab: '检验室3',
                palletCount: 3,
                status: '已完成',
                outboundProgress: 'allOut',
                resultProgress: 'full',
                inboundProgress: 'allIn',
                createTime: '2026-05-14 08:55:00',
                completeTime: '2026-05-14 13:18:00',
                remark: '检验室抽检已完成并回库',
                outboundStarted: true
            }),
            this.hydrateOrder({
                id: 9,
                inspectionNo: 'CJ-CJ-20260514-009',
                mesOrderNo: 'SO-20260514-004',
                inspectionType: '现场抽检',
                productCode: 'CP-300422',
                productName: '儿童拉杆箱',
                status: '已完成',
                createTime: '2026-05-14 11:20:00',
                completeTime: '2026-05-14 13:05:00',
                remark: '现场抽检已完成',
                outboundStarted: false,
                outboundDetails: [],
                inboundDetails: [],
                resultDetails: []
            })
        ];
    }

    hydrateOrder(order) {
        const base = { ...order };

        base.inspectionType = Object.prototype.hasOwnProperty.call(order, 'inspectionType')
            ? this.normalizeInspectionType(base.inspectionType)
            : '检验室抽检';
        if (base.inspectionType === '现场抽检') {
            base.targetLab = '';
            base.palletCount = 0;
        } else {
            base.targetLab = base.targetLab || '';
            base.palletCount = Number(base.palletCount) || 0;
        }

        if (!base.outboundDetails || base.outboundDetails.length === 0) {
            base.outboundDetails = this.buildOutboundDetails(base);
        }

        if (!base.resultDetails || base.resultDetails.length === 0) {
            base.resultDetails = this.buildResultDetails(base);
        }

        if (!base.inboundDetails || base.inboundDetails.length === 0) {
            base.inboundDetails = this.buildInboundDetails(base);
        }

        base.status = this.normalizeStatus(base);

        return base;
    }

    buildOutboundDetails(order) {
        if (order.status === '待分配') {
            return [];
        }

        const details = [];

        for (let index = 0; index < order.palletCount; index += 1) {
            let status = '待出库';

            if (['待检验', '检验中', '已完成'].includes(order.status)) {
                status = '已出库';
            } else if (order.status === '已分配') {
                if (order.outboundProgress === 'mixed') {
                    status = index < Math.ceil(order.palletCount / 2) ? '已出库' : '待出库';
                } else if (order.outboundProgress === 'allOut') {
                    status = '已出库';
                }
            }

            details.push({
                seq: index + 1,
                palletCode: `TP-CJ-${order.id}${String(index + 1).padStart(2, '0')}`,
                containerCode: `R${String(order.id).padStart(2, '0')}-CJ-${String(index + 1).padStart(2, '0')}`,
                materialCode: order.productCode,
                materialName: order.productName,
                quantity: 24,
                sourceLocation: `CPK-0${(order.id % 4) + 1}-0${(index % 3) + 1}-0${(index % 5) + 1}`,
                taskNo: `OB-CJ-${order.id}${String(index + 1).padStart(2, '0')}`,
                status
            });
        }

        return details;
    }

    buildInboundDetails(order) {
        if (['待分配', '已分配', '待检验', '检验中'].includes(order.status)) {
            return [];
        }

        return Array.from({ length: order.palletCount }, (_, index) => {
            const seq = index + 1;
            const containerCode = `R${String(order.id).padStart(2, '0')}-CJ-${String(seq).padStart(2, '0')}`;
            const matchedResult = (order.resultDetails || []).find((item) => item.seq === seq);
            const inboundQty = this.calculateInboundQuantity(matchedResult);

            return {
                seq,
                palletCode: `TP-RK-${order.id}${String(seq).padStart(2, '0')}`,
                containerCode: `R${String(order.id).padStart(2, '0')}-RK-${String(seq).padStart(2, '0')}`,
                sourceContainerCode: containerCode,
                materialCode: order.productCode,
                materialName: order.productName,
                quantity: inboundQty,
                targetLocation: `RKQ-0${(order.id % 4) + 1}-0${(index % 3) + 1}-0${(index % 5) + 1}`,
                taskNo: `IB-CJ-${order.id}${String(seq).padStart(2, '0')}`,
                status: this.getInboundStatus(order, index)
            };
        });
    }

    buildResultDetails(order) {
        if (['待分配', '已分配', '待检验'].includes(order.status)) {
            return [];
        }

        const templates = [
            ['外观检验', '李晓雯', '箱体外观良好，无明显划伤'],
            ['尺寸抽检', '陈亚楠', '尺寸偏差在工艺允许范围内'],
            ['功能测试', '周宇航', '轮组与拉杆功能正常'],
            ['承重测试', '王思琪', '承重测试结果符合抽检标准'],
            ['包装复核', '赵晨曦', '包装标签与实物一致']
        ];
        const failReasons = ['外观瑕疵', '尺寸不符', '配件缺失', '包装不合格', '其他'];
        const isLabInspection = this.isLabInspection(order.inspectionType);
        const palletReferences = isLabInspection
            ? Array.from({ length: order.palletCount }, (_, index) => ({
                palletCode: `TP-CJ-${order.id}${String(index + 1).padStart(2, '0')}`,
                containerCode: `R${String(order.id).padStart(2, '0')}-CJ-${String(index + 1).padStart(2, '0')}`
            }))
            : this.buildRelatedPalletDetails(order).slice(0, order.status === '检验中' ? 1 : 2);
        const totalResultTargets = palletReferences.length;

        let resultCount = totalResultTargets;
        if (order.status === '检验中') {
            if (isLabInspection) {
                resultCount = Math.min(order.completedInspectCount || Math.max(1, order.palletCount - 1), order.palletCount);
            } else {
                resultCount = Math.min(1, totalResultTargets);
            }
        }

        return Array.from({ length: resultCount }, (_, index) => {
            const template = templates[index % templates.length];
            const palletReference = palletReferences[index] || {
                palletCode: `TP-CJ-${order.id}${String(index + 1).padStart(2, '0')}`,
                containerCode: `R${String(order.id).padStart(2, '0')}-CJ-${String(index + 1).padStart(2, '0')}`
            };
            const isInProgress = order.status === '检验中' && index === resultCount - 1 && resultCount < totalResultTargets;
            const isFailed = order.status === '已完成' && order.id % 2 === 0 && index === resultCount - 1;
            const failReason = isFailed ? failReasons[index % failReasons.length] : '';
            const failPhotos = isFailed ? this.buildFailPhotos(order.id, index) : [];

            return {
                seq: index + 1,
                palletCode: palletReference.palletCode,
                containerCode: palletReference.containerCode,
                checkItem: template[0],
                result: isInProgress ? '待判定' : (isFailed ? '不合格' : '合格'),
                inspector: template[1],
                checkTime: ['检验中', '已完成'].includes(order.status) ? `2026-05-14 ${String(10 + index).padStart(2, '0')}:2${index}:00` : '-',
                description: isInProgress ? '当前容器检验进行中，结果待最终确认' : template[2],
                failReason,
                failPhotos,
                snDetails: this.buildSnDetails(order, index, template, isInProgress, isFailed, failReason, failPhotos, palletReference.containerCode)
            };
        });
    }

    buildSnDetails(order, index, template, isInProgress, isFailed, failReason, failPhotos, containerCode) {
        return Array.from({ length: 4 }, (_, snIndex) => {
            const checkedCount = isInProgress ? 3 : 2;
            const isChecked = snIndex < checkedCount;
            const snFailed = isFailed && isChecked && snIndex === checkedCount - 1;

            return {
                seq: snIndex + 1,
                snCode: `SN-${order.id}${String(index + 1).padStart(2, '0')}-${String(snIndex + 1).padStart(3, '0')}`,
                containerCode,
                materialCode: order.productCode,
                materialName: order.productName,
                checkItem: isChecked ? template[0] : '',
                result: !isChecked ? '' : (isInProgress && snIndex === checkedCount - 1 ? '待判定' : (snFailed ? '不合格' : '合格')),
                inspector: isChecked ? template[1] : '',
                checkTime: isChecked ? `2026-05-14 ${String(10 + index).padStart(2, '0')}:${String(10 + snIndex).padStart(2, '0')}:00` : '',
                description: !isChecked ? '' : (isInProgress && snIndex === checkedCount - 1 ? '当前SN仍在复检中' : template[2]),
                failReason: snFailed ? failReason : '',
                failPhotos: snFailed ? failPhotos : []
            };
        });
    }

    buildFailPhotos(orderId, index) {
        const seed = `${orderId}${index}`;
        return [
            {
                thumb: `https://picsum.photos/seed/cj-thumb-${seed}/56/56`,
                full: `https://picsum.photos/seed/cj-full-${seed}/1200/900`
            }
        ];
    }

    calculateInboundQuantity(resultDetail) {
        if (!resultDetail || !Array.isArray(resultDetail.snDetails) || resultDetail.snDetails.length === 0) {
            return 24;
        }

        const totalQty = 24;
        const failedCount = resultDetail.snDetails.filter((sn) => sn.result === '不合格').length;

        return totalQty - failedCount;
    }

    normalizeStatus(order) {
        if (order.status === '待分配') {
            return '待分配';
        }

        const outboundDetails = order.outboundDetails || [];
        const hasOutbound = outboundDetails.length > 0;
        const allOutboundDone = hasOutbound && outboundDetails.every((detail) => detail.status === '已出库');

        if (order.status === '已分配' && allOutboundDone) {
            return '待检验';
        }

        return order.status;
    }

    getInboundStatus(order, index) {
        if (order.status === '已完成' || order.inboundProgress === 'allIn') {
            return '已回库';
        }

        return '待回库';
    }

    renderMesOptions(selected = '') {
        const options = ['<option value="">请选择</option>'].concat(
            this.mesOptions.map((item) => {
                return `<option value="${item.no}" ${selected === item.no ? 'selected' : ''}>${item.no}</option>`;
            })
        );

        this.mesOrderNoInput.innerHTML = options.join('');
        this.updateMesRelatedFields(selected);
    }

    updateMesRelatedFields(mesOrderNo) {
        const mesInfo = this.mesOptions.find((item) => item.no === mesOrderNo);
        this.materialDisplay.value = mesInfo ? `${mesInfo.productCode}-${mesInfo.productName}` : '';
        this.totalPalletsDisplay.value = mesInfo ? `${mesInfo.totalPallets}` : '';
        this.palletCountInput.max = mesInfo ? String(mesInfo.totalPallets) : '20';
    }

    normalizeInspectionType(inspectionType) {
        if (inspectionType === '现场抽检' || inspectionType === '检验室抽检') {
            return inspectionType;
        }
        return '';
    }

    isLabInspection(inspectionType) {
        return inspectionType === '检验室抽检';
    }

    getInspectionTypePlaceholderOption() {
        return this.inspectionTypeInput.querySelector('option[data-placeholder="true"]');
    }

    resetInspectionTypeSelection() {
        const placeholder = this.getInspectionTypePlaceholderOption();
        if (placeholder) {
            placeholder.hidden = false;
            placeholder.disabled = false;
            placeholder.selected = true;
        }

        this.inspectionTypeInput.value = '';
        this.syncInspectionTypePlaceholderState();
    }

    prepareInspectionTypeDropdown() {
        const placeholder = this.getInspectionTypePlaceholderOption();
        if (placeholder && !this.inspectionTypeInput.value) {
            placeholder.hidden = true;
            placeholder.disabled = true;
        }
    }

    syncInspectionTypePlaceholderState() {
        const placeholder = this.getInspectionTypePlaceholderOption();
        if (!placeholder) {
            return;
        }

        const hasSelection = Boolean(this.inspectionTypeInput.value);
        placeholder.hidden = hasSelection;
        placeholder.disabled = hasSelection;

        if (!hasSelection) {
            placeholder.hidden = false;
            placeholder.disabled = false;
            placeholder.selected = true;
        }
    }

    updateInspectionTypeFields(inspectionType) {
        const isLabInspection = this.isLabInspection(inspectionType);

        this.targetLabGroup.classList.toggle('is-hidden', !isLabInspection);
        this.palletCountGroup.classList.toggle('is-hidden', !isLabInspection);
        this.targetLabInput.required = isLabInspection;
        this.palletCountInput.required = isLabInspection;

        if (!isLabInspection) {
            this.targetLabInput.value = '';
            this.palletCountInput.value = '';
        }
    }

    applyFilters() {
        const inspectionNo = this.searchInspectionNo.value.trim();
        const mesNo = this.searchMesNo.value.trim();
        const status = this.searchStatus.value;

        this.filteredData = this.orderData.filter((item) => {
            const matchInspectionNo = !inspectionNo || item.inspectionNo.includes(inspectionNo);
            const matchMesNo = !mesNo || item.mesOrderNo.includes(mesNo);
            const matchStatus = !status || item.status === status;
            return matchInspectionNo && matchMesNo && matchStatus;
        });

        this.renderStats();
        this.renderTable();
    }

    renderStats() {
        if (!this.pendingCountEl || !this.processingCountEl || !this.completedCountEl || !this.cancelledCountEl) {
            return;
        }

        const counts = { pending: 0, processing: 0, completed: 0, cancelled: 0 };
        this.filteredData.forEach((item) => {
            const group = this.statusMap[item.status];
            if (group && counts[group] !== undefined) {
                counts[group] += 1;
            }
        });

        this.pendingCountEl.textContent = counts.pending;
        this.processingCountEl.textContent = counts.processing;
        this.completedCountEl.textContent = counts.completed;
        this.cancelledCountEl.textContent = counts.cancelled;
    }

    getTotalPages() {
        return Math.max(1, Math.ceil(this.filteredData.length / this.pageSize));
    }

    renderTable() {
        const totalPages = this.getTotalPages();
        if (this.currentPage > totalPages) {
            this.currentPage = totalPages;
        }

        const startIndex = (this.currentPage - 1) * this.pageSize;
        const pageData = this.filteredData.slice(startIndex, startIndex + this.pageSize);

        if (pageData.length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="12" class="empty-row">暂无符合条件的成品抽检单</td></tr>';
        } else {
            this.tableBody.innerHTML = pageData.map((item) => `
                <tr>
                    <td><button class="order-link" data-action="view" data-id="${item.id}">${item.inspectionNo}</button></td>
                    <td>${item.mesOrderNo}</td>
                    <td>${item.productCode}</td>
                    <td>${item.productName}</td>
                    <td>${this.getTotalPallets(item.mesOrderNo)}</td>
                    <td>${this.getTableInspectionType(item)}</td>
                    <td>${this.getTablePalletCount(item)}</td>
                    <td>${this.getTableTargetLab(item)}</td>
                    <td>${this.renderStatusBadge(item.status)}</td>
                    <td>${item.createTime}</td>
                    <td>${item.completeTime || '-'}</td>
                    <td>${this.renderActions(item)}</td>
                </tr>
            `).join('');
        }

        this.currentPageEl.textContent = String(this.currentPage);
        this.totalPagesEl.textContent = String(totalPages);
        this.prevPageBtn.disabled = this.currentPage <= 1;
        this.nextPageBtn.disabled = this.currentPage >= totalPages;

        this.bindTableActions();
    }

    renderStatusBadge(status) {
        const cls = this.statusMap[status] || 'pending';
        const statusClass = this.getStatusClass(status);
        return `<span class="status-badge ${cls} ${statusClass}">${status}</span>`;
    }

    getStatusClass(status) {
        const classMap = {
            '待分配': 'status-wait-assign',
            '已分配': 'status-assigned',
            '待出库': 'status-wait-outbound',
            '部分已出库': 'status-part-outbound',
            '已出库': 'status-outbound-done',
            '待检验': 'status-wait-check',
            '检验中': 'status-checking',
            '待回库': 'status-wait-inbound',
            '部分已回库': 'status-part-inbound',
            '已回库': 'status-inbound-done',
            '已完成': 'status-finished',
            '合格': 'status-qualified',
            '待判定': 'status-pending-judge'
        };

        return classMap[status] || 'status-default';
    }

    renderActions(item) {
        const actions = [];

        if (this.canEdit(item)) {
            actions.push(`<button class="action-link" data-action="edit" data-id="${item.id}">编辑</button>`);
        }

        if (this.canDelete(item)) {
            actions.push(`<button class="action-link danger" data-action="delete" data-id="${item.id}">删除</button>`);
        }

        if (this.canAllocate(item)) {
            actions.push(`<button class="action-link success" data-action="allocate" data-id="${item.id}">分配出库</button>`);
        }

        if (this.canCancel(item)) {
            actions.push(`<button class="action-link warning" data-action="cancel" data-id="${item.id}">取消抽检</button>`);
        }

        if (this.canCompleteInspection(item)) {
            actions.push(`<button class="action-link success" data-action="complete-inspection" data-id="${item.id}">完成抽检</button>`);
        }

        return `<div class="action-btns">${actions.join('')}</div>`;
    }

    bindTableActions() {
        this.tableBody.querySelectorAll('[data-action]').forEach((button) => {
            button.addEventListener('click', (event) => {
                const { action, id } = event.currentTarget.dataset;
                const orderId = Number(id);

                if (action === 'view') this.openDetail(orderId);
                if (action === 'edit') this.openEditModal(orderId);
                if (action === 'delete') this.deleteOrder(orderId);
                if (action === 'allocate') this.allocateOrder(orderId);
                if (action === 'cancel') this.cancelOrder(orderId);
                if (action === 'complete-inspection') this.completeInspection(orderId);
            });
        });
    }

    canEdit(item) {
        return this.isLabInspection(item.inspectionType) && item.status === '待分配';
    }

    canDelete(item) {
        if (this.isLabInspection(item.inspectionType)) {
            return item.status === '待分配';
        }

        return item.status === '待检验';
    }

    canAllocate(item) {
        return this.isLabInspection(item.inspectionType) && item.status === '待分配';
    }

    canCancel(item) {
        return this.isLabInspection(item.inspectionType)
            && item.status === '已分配'
            && item.outboundDetails.every((detail) => detail.status === '待出库');
    }

    canCompleteInspection(item) {
        return item.status === '检验中';
    }

    openAddModal() {
        this.editingId = null;
        this.modalTitle.textContent = '新增成品抽检单';
        this.inspectionForm.reset();
        this.renderMesOptions();
        this.resetInspectionTypeSelection();
        this.updateInspectionTypeFields(this.inspectionTypeInput.value);
        this.inspectionNoInput.value = this.generateOrderNo();
        this.updateMesRelatedFields('');
        this.openModal(this.inspectionModal);
    }

    openEditModal(id) {
        const item = this.orderData.find((order) => order.id === id);
        if (!item) return;

        this.editingId = id;
        this.modalTitle.textContent = '编辑成品抽检单';
        this.inspectionForm.reset();
        this.renderMesOptions(item.mesOrderNo);
        this.inspectionTypeInput.value = this.normalizeInspectionType(item.inspectionType) || '检验室抽检';
        this.syncInspectionTypePlaceholderState();
        this.updateInspectionTypeFields(this.inspectionTypeInput.value);
        this.inspectionNoInput.value = item.inspectionNo;
        if (this.isLabInspection(item.inspectionType)) {
            this.targetLabInput.value = item.targetLab;
            this.palletCountInput.value = item.palletCount;
        }
        this.inspectionRemarkInput.value = item.remark || '';
        this.updateMesRelatedFields(item.mesOrderNo);
        this.openModal(this.inspectionModal);
    }

    saveOrder() {
        const inspectionNo = this.inspectionNoInput.value.trim();
        const mesOrderNo = this.mesOrderNoInput.value;
        const inspectionType = this.normalizeInspectionType(this.inspectionTypeInput.value);
        const targetLab = this.targetLabInput.value;
        const palletCount = Number(this.palletCountInput.value);
        const remark = this.inspectionRemarkInput.value.trim();
        const isLabInspection = this.isLabInspection(inspectionType);

        if (!inspectionNo || !mesOrderNo || !inspectionType) {
            alert('请完整填写成品抽检单信息。');
            return;
        }

        if (isLabInspection && (!targetLab || !palletCount)) {
            alert('检验室抽检请完整填写目标检验室和抽检托数。');
            return;
        }

        const mesInfo = this.mesOptions.find((item) => item.no === mesOrderNo);
        if (!mesInfo) {
            alert('请选择有效的关联订单。');
            return;
        }

        if (isLabInspection && palletCount > mesInfo.totalPallets) {
            alert(`抽检托数不能大于该关联订单总托数 ${mesInfo.totalPallets}。`);
            return;
        }

        const finalTargetLab = isLabInspection ? targetLab : '';
        const finalPalletCount = isLabInspection ? palletCount : 0;

        if (this.editingId) {
            const target = this.orderData.find((item) => item.id === this.editingId);
            if (!target) return;

            Object.assign(target, this.hydrateOrder({
                ...target,
                status: isLabInspection ? target.status : '待检验',
                mesOrderNo,
                inspectionType,
                productCode: mesInfo.productCode,
                productName: mesInfo.productName,
                targetLab: finalTargetLab,
                palletCount: finalPalletCount,
                remark
            }));
        } else {
            const newStatus = isLabInspection ? '待分配' : '待检验';
            const newOrder = this.hydrateOrder({
                id: Date.now(),
                inspectionNo,
                mesOrderNo,
                inspectionType,
                productCode: mesInfo.productCode,
                productName: mesInfo.productName,
                targetLab: finalTargetLab,
                palletCount: finalPalletCount,
                status: newStatus,
                createTime: this.formatNow(),
                completeTime: '-',
                remark,
                outboundStarted: false
            });
            this.orderData.unshift(newOrder);
        }

        this.closeModal(this.inspectionModal);
        this.currentPage = 1;
        this.applyFilters();
        alert(this.editingId ? '成品抽检单已更新。' : '成品抽检单已新增。');
    }

    deleteOrder(id) {
        const item = this.orderData.find((order) => order.id === id);
        if (!item || !this.canDelete(item)) {
            alert('仅检验室抽检待分配或现场抽检待检验状态的成品抽检单允许删除。');
            return;
        }

        if (!window.confirm(`确定删除成品抽检单“${item.inspectionNo}”吗？`)) {
            return;
        }

        this.orderData = this.orderData.filter((order) => order.id !== id);
        this.applyFilters();
        alert('成品抽检单已删除。');
    }

    allocateOrder(id) {
        const item = this.orderData.find((order) => order.id === id);
        if (!item || !this.canAllocate(item)) {
            alert('当前状态不可执行分配出库。');
            return;
        }

        item.status = '已分配';
        item.outboundStarted = false;
        item.outboundProgress = 'none';
        item.outboundDetails = item.outboundDetails.map((detail, index) => ({
            ...detail,
            taskNo: `OB-CJ-${item.id}${String(index + 1).padStart(2, '0')}`,
            status: '待出库'
        }));
        item.remark = item.remark ? `${item.remark}；系统已自动分配抽检出库容器并生成出库任务` : '系统已自动分配抽检出库容器并生成出库任务';

        this.applyFilters();
        alert('已自动分配抽检容器并生成对应出库任务。');
    }

    completeInspection(id) {
        const item = this.orderData.find((order) => order.id === id);
        if (!item || !this.canCompleteInspection(item)) {
            alert('当前状态不可执行完成抽检。');
            return;
        }

        const isLabInspection = this.isLabInspection(item.inspectionType);
        const updatedOrder = this.hydrateOrder({
            ...item,
            status: '已完成',
            completeTime: this.formatNow(),
            outboundStarted: isLabInspection ? true : item.outboundStarted,
            outboundProgress: isLabInspection ? 'allOut' : item.outboundProgress,
            resultProgress: isLabInspection ? 'full' : item.resultProgress,
            inboundProgress: isLabInspection ? 'allIn' : item.inboundProgress,
            completedInspectCount: isLabInspection ? item.palletCount : 0,
            outboundDetails: [],
            inboundDetails: [],
            resultDetails: []
        });

        Object.assign(item, updatedOrder);
        this.applyFilters();
        alert('抽检单已完成抽检。');
    }

    cancelOrder(id) {
        const item = this.orderData.find((order) => order.id === id);
        if (!item || !this.canCancel(item)) {
            alert('仅已分配且尚未开始出库时允许取消当前抽检分配。');
            return;
        }

        if (!window.confirm(`确定取消抽检单“${item.inspectionNo}”吗？取消后对应出库任务也会取消。`)) {
            return;
        }

        item.status = '待分配';
        item.completeTime = '-';
        item.outboundStarted = false;
        item.outboundProgress = 'none';
        item.outboundDetails = [];
        item.inboundDetails = [];
        item.resultDetails = [];

        this.applyFilters();
        alert('抽检单已取消当前分配，状态已恢复为待分配。');
    }

    openDetail(id) {
        const item = this.orderData.find((order) => order.id === id);
        if (!item) return;

        this.currentDetailId = id;
        this.renderDetailSummary(item);
        this.toggleDetailSections(item);

        if (this.isLabInspection(item.inspectionType)) {
            this.renderDetailTable('outboundDetailBody', item.outboundDetails, (detail) => `
                <tr>
                    <td>${detail.seq}</td>
                    <td>${detail.containerCode}</td>
                    <td>${detail.materialCode}</td>
                    <td>${detail.materialName}</td>
                    <td>${detail.quantity}</td>
                    <td>${detail.sourceLocation}</td>
                    <td>${detail.taskNo}</td>
                    <td>${this.renderStatusBadge(detail.status)}</td>
                </tr>
            `, 8, '暂无抽检出库明细');
        } else {
            this.renderDetailTable('palletDetailBody', this.buildRelatedPalletDetails(item), (detail) => `
                <tr>
                    <td>${detail.seq}</td>
                    <td>${detail.containerCode}</td>
                    <td>${detail.materialCode}</td>
                    <td>${detail.materialName}</td>
                    <td>${detail.storageChannelCode}</td>
                    <td>${detail.locationCode}</td>
                </tr>
            `, 6, '暂无关联托盘信息');
        }

        this.renderDetailTable('resultDetailBody', item.resultDetails, (detail) => `
            <tr>
                <td>${detail.seq}</td>
                <td>${detail.containerCode}</td>
                <td>${detail.result}</td>
                <td>${detail.inspector}</td>
                <td>${detail.checkTime}</td>
                <td>${detail.description}</td>
                <td>${detail.failReason || '-'}</td>
                <td>${this.renderPhotoThumbs(detail.failPhotos)}</td>
                <td><button class="action-link" data-action="view-sn" data-order-id="${item.id}" data-seq="${detail.seq}">查看</button></td>
            </tr>
        `, 8, '暂无抽检结果明细');

        this.openModal(this.detailModal);
        this.bindResultDetailActions();
        this.bindPhotoPreviewActions();
    }

    toggleDetailSections(item) {
        const isLabInspection = this.isLabInspection(item.inspectionType);
        this.outboundDetailSection.classList.toggle('is-hidden', !isLabInspection);
        this.palletDetailSection.classList.toggle('is-hidden', isLabInspection);
    }

    buildRelatedPalletDetails(order) {
        const mesInfo = this.mesOptions.find((item) => item.no === order.mesOrderNo);
        const totalPallets = mesInfo ? mesInfo.totalPallets : 0;
        const orderSuffix = order.mesOrderNo.split('-').pop() || String(order.id).padStart(3, '0');

        return Array.from({ length: totalPallets }, (_, index) => {
            const seq = index + 1;
            const storageChannelCode = `CPK-${String((order.id % 4) + 1).padStart(2, '0')}-${String((index % 3) + 1).padStart(2, '0')}`;

            return {
                seq,
                containerCode: `TP-${orderSuffix}-${String(seq).padStart(2, '0')}`,
                materialCode: order.productCode,
                materialName: order.productName,
                storageChannelCode,
                locationCode: `${storageChannelCode}-${String((index % 5) + 1).padStart(3, '0')}`
            };
        });
    }

    bindResultDetailActions() {
        document.querySelectorAll('[data-action="view-sn"]').forEach((button) => {
            button.addEventListener('click', (event) => {
                const orderId = Number(event.currentTarget.dataset.orderId);
                const seq = Number(event.currentTarget.dataset.seq);
                this.openSnDetail(orderId, seq);
            });
        });
    }

    openSnDetail(orderId, seq) {
        const order = this.orderData.find((item) => item.id === orderId);
        if (!order) return;

        const detail = (order.resultDetails || []).find((item) => item.seq === seq);
        if (!detail) return;

        document.getElementById('snDetailTitle').textContent = `容器SN明细 - ${detail.containerCode}`;
        const tbody = document.getElementById('snDetailBody');
        const rows = detail.snDetails || [];

        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="detail-empty">暂无SN明细</td></tr>';
        } else {
            tbody.innerHTML = rows.map((row) => `
                <tr>
                    <td>${row.seq}</td>
                    <td>${row.snCode}</td>
                    <td>${row.containerCode}</td>
                    <td>${row.materialCode}</td>
                    <td>${row.materialName}</td>
                    <td>${row.result}</td>
                    <td>${row.inspector || '-'}</td>
                    <td>${row.checkTime || '-'}</td>
                    <td>${row.description || '-'}</td>
                    <td>${row.failReason || '-'}</td>
                    <td>${this.renderPhotoThumbs(row.failPhotos)}</td>
                </tr>
            `).join('');
        }

        this.openModal(this.snDetailModal);
        this.bindPhotoPreviewActions();
    }

    renderPhotoThumbs(photos = []) {
        if (!photos.length) {
            return '<span class="photo-empty">-</span>';
        }

        return photos.map((photo) => `
            <img
                src="${photo.thumb}"
                data-full-image="${photo.full}"
                class="photo-thumb"
                alt="不合格照片缩略图"
            >
        `).join('');
    }

    bindPhotoPreviewActions() {
        document.querySelectorAll('[data-full-image]').forEach((img) => {
            img.addEventListener('click', (event) => {
                const fullImage = event.currentTarget.getAttribute('data-full-image');
                this.openImagePreview(fullImage);
            });
        });
    }

    openImagePreview(imageUrl) {
        const target = document.getElementById('imagePreviewTarget');
        target.src = imageUrl;
        this.openModal(this.imagePreviewModal);
    }

    renderDetailSummary(item) {
        const summaryItems = [
            ['成品抽检单号', item.inspectionNo],
            ['关联订单号', item.mesOrderNo],
            ['抽检类型', this.normalizeInspectionType(item.inspectionType)],
            ['成品信息', `${item.productCode} / ${item.productName}`],
            ['总托数', this.getTotalPallets(item.mesOrderNo)],
            ['目标检验室', this.getDisplayTargetLab(item)],
            ['抽检托数', this.getDisplayPalletCount(item)],
            ['状态', this.renderStatusBadge(item.status)],
            ['创建时间', item.createTime],
            ['完成时间', item.completeTime || '-'],
            ['备注', item.remark || '-']
        ];

        document.getElementById('detailSummary').innerHTML = summaryItems.map(([label, value]) => `
            <div class="detail-basic-item">
                <span class="detail-basic-label">${label}：</span>
                <span class="detail-basic-value">${value}</span>
            </div>
        `).join('');
    }

    renderDetailTable(containerId, rows, template, colspan, emptyText) {
        const tbody = document.getElementById(containerId);
        if (!rows || rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${colspan}" class="detail-empty">${emptyText}</td></tr>`;
            return;
        }
        tbody.innerHTML = rows.map(template).join('');
    }

    getTotalPallets(mesOrderNo) {
        const mesInfo = this.mesOptions.find((item) => item.no === mesOrderNo);
        return mesInfo ? `${mesInfo.totalPallets} 托` : '-';
    }

    getDisplayTargetLab(item) {
        return this.isLabInspection(item.inspectionType) ? (item.targetLab || '-') : '-';
    }

    getDisplayPalletCount(item) {
        return this.isLabInspection(item.inspectionType) && item.palletCount ? `${item.palletCount} 托` : '-';
    }

    getTableInspectionType(item) {
        return this.normalizeInspectionType(item.inspectionType) || '';
    }

    getTableTargetLab(item) {
        return this.isLabInspection(item.inspectionType) ? (item.targetLab || '') : '';
    }

    getTablePalletCount(item) {
        return this.isLabInspection(item.inspectionType) && item.palletCount ? `${item.palletCount} 托` : '';
    }

    generateOrderNo() {
        const suffix = String(this.orderData.length + 1).padStart(3, '0');
        return `CJ-CJ-20260514-${suffix}`;
    }

    formatNow() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    openModal(modal) {
        modal.classList.add('active');
    }

    closeModal(modal) {
        modal.classList.remove('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.finishedInspectionOrderPage = new FinishedInspectionOrderPage();
});
