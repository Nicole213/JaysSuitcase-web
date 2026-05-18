// ERP发货单页面脚本

class ERPShipmentPage {
    static PALLET_CAPACITY = 24;
    static SN_PREFIX = 'ERP-SN';

    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.shipmentData = this.buildMockData().map((order) => this.hydrateOrder(order));
        this.filteredData = [...this.shipmentData];
        this.currentDetailId = null;

        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTable();
    }

    buildMockData() {
        return [
            {
                id: 1,
                shipmentNo: 'ERP-SO-20240503-001',
                status: '未发货',
                isPaused: false,
                customerName: '吉仕箱包华南分销中心',
                customerCode: 'KH-10001',
                contactName: '陈敏',
                contactPhone: '13800138001',
                deliveryAddress: '广东省东莞市长安镇锦厦社区工业大道88号',
                syncTime: '2024-05-03 08:15:00',
                deliveryTime: '-',
                remark: 'ERP首批同步发货单，待现场开始发货',
                materials: [
                    {
                        materialCode: 'CP-2024-101',
                        materialName: '20寸拉杆箱',
                        planQty: 120,
                        shippedQty: 0,
                        containerBase: 'FH-1001',
                        areaCode: 'PK001',
                        locationCode: 'PK001-01-01-01',
                        shippedTime: '-'
                    },
                    {
                        materialCode: 'CP-2024-102',
                        materialName: '商务双肩包',
                        planQty: 60,
                        shippedQty: 0,
                        containerBase: 'FH-1002',
                        areaCode: 'PK001',
                        locationCode: 'PK001-01-01-21',
                        shippedTime: '-'
                    }
                ]
            },
            {
                id: 2,
                shipmentNo: 'ERP-SO-20240503-002',
                status: '发货中',
                isPaused: false,
                customerName: '华东连锁商贸有限公司',
                customerCode: 'KH-10018',
                contactName: '周洋',
                contactPhone: '13800138018',
                deliveryAddress: '江苏省苏州市工业园区金鸡湖大道108号',
                syncTime: '2024-05-03 09:10:00',
                deliveryTime: '2024-05-03 10:28:00',
                remark: '客户要求分批装车，先发A类成品',
                materials: [
                    {
                        materialCode: 'CP-2024-103',
                        materialName: '登机箱',
                        planQty: 96,
                        shippedQty: 72,
                        containerBase: 'FH-1011',
                        areaCode: 'PK002',
                        locationCode: 'PK002-02-02-01',
                        shippedTime: '2024-05-03 10:28:00'
                    },
                    {
                        materialCode: 'CP-2024-104',
                        materialName: '旅行收纳包',
                        planQty: 48,
                        shippedQty: 0,
                        containerBase: 'FH-1012',
                        areaCode: 'PK002',
                        locationCode: 'PK002-02-02-15',
                        shippedTime: '-'
                    }
                ]
            },
            {
                id: 3,
                shipmentNo: 'ERP-SO-20240503-003',
                status: '已完成',
                isPaused: false,
                customerName: '北方箱包供应链有限公司',
                customerCode: 'KH-10025',
                contactName: '刘峰',
                contactPhone: '13800138025',
                deliveryAddress: '天津市武清区京滨工业园创业路56号',
                syncTime: '2024-05-03 11:05:00',
                deliveryTime: '2024-05-03 14:46:00',
                remark: '整单发货完成',
                materials: [
                    {
                        materialCode: 'CP-2024-105',
                        materialName: '铝框箱',
                        planQty: 72,
                        shippedQty: 72,
                        containerBase: 'FH-1021',
                        areaCode: 'PK003',
                        locationCode: 'PK003-01-03-01',
                        shippedTime: '2024-05-03 14:46:00'
                    },
                    {
                        materialCode: 'CP-2024-106',
                        materialName: '儿童拉杆箱',
                        planQty: 48,
                        shippedQty: 48,
                        containerBase: 'FH-1022',
                        areaCode: 'PK003',
                        locationCode: 'PK003-01-03-13',
                        shippedTime: '2024-05-03 14:46:00'
                    }
                ]
            },
            {
                id: 4,
                shipmentNo: 'ERP-SO-20240503-004',
                status: '已取消',
                isPaused: false,
                customerName: '西南电商仓配中心',
                customerCode: 'KH-10032',
                contactName: '唐倩',
                contactPhone: '13800138032',
                deliveryAddress: '四川省成都市双流区空港物流园8号库',
                syncTime: '2024-05-03 12:20:00',
                deliveryTime: '-',
                remark: '客户撤单，整单取消发货',
                materials: [
                    {
                        materialCode: 'CP-2024-107',
                        materialName: '硬壳化妆箱',
                        planQty: 36,
                        shippedQty: 0,
                        containerBase: 'FH-1031',
                        areaCode: 'PK004',
                        locationCode: 'PK004-03-01-01',
                        shippedTime: '-'
                    }
                ]
            },
            {
                id: 5,
                shipmentNo: 'ERP-SO-20240503-005',
                status: '发货中',
                isPaused: true,
                customerName: '华中直营网点',
                customerCode: 'KH-10041',
                contactName: '马莉',
                contactPhone: '13800138041',
                deliveryAddress: '湖北省武汉市东西湖区金银湖物流大道199号',
                syncTime: '2024-05-03 13:18:00',
                deliveryTime: '2024-05-03 15:05:00',
                remark: '车辆等待中，当前发货已暂停',
                materials: [
                    {
                        materialCode: 'CP-2024-108',
                        materialName: '商务公文包',
                        planQty: 96,
                        shippedQty: 48,
                        containerBase: 'FH-1041',
                        areaCode: 'PK005',
                        locationCode: 'PK005-02-01-01',
                        shippedTime: '2024-05-03 15:05:00'
                    }
                ]
            }
        ];
    }

    hydrateOrder(order) {
        const planQty = order.materials.reduce((sum, material) => sum + material.planQty, 0);
        const shippedQty = order.materials.reduce((sum, material) => sum + material.shippedQty, 0);

        return {
            ...order,
            planQty,
            shippedQty,
            outboundDetails: this.buildOutboundDetails(order)
        };
    }

    refreshOrder(order) {
        Object.assign(order, this.hydrateOrder(order));
    }

    buildOutboundDetails(order) {
        let seq = 1;

        return order.materials.flatMap((material) =>
            this.splitMaterialToRows(order, material).map((row) => ({
                ...row,
                seq: seq++,
                itemDetails: this.buildItemDetails(row)
            }))
        );
    }

    splitMaterialToRows(order, material) {
        const rows = [];
        let remainingPlan = material.planQty;
        let remainingShipped = material.shippedQty;
        let index = 0;

        while (remainingPlan > 0) {
            const quantity = Math.min(ERPShipmentPage.PALLET_CAPACITY, remainingPlan);
            const done = remainingShipped >= quantity;
            const status = order.status === '已取消' ? '已取消' : (done ? '已出库' : '待出库');

            rows.push({
                materialCode: material.materialCode,
                materialName: material.materialName,
                containerCode: this.buildContainerCode(material.containerBase, index),
                quantity,
                areaCode: material.areaCode,
                locationCode: this.buildLocationCode(material.locationCode, index),
                time: done ? material.shippedTime : '-',
                status
            });

            remainingPlan -= quantity;
            remainingShipped = Math.max(0, remainingShipped - quantity);
            index += 1;
        }

        return rows;
    }

    buildContainerCode(baseCode, index) {
        return `${baseCode}-${String(index + 1).padStart(2, '0')}`;
    }

    buildLocationCode(baseCode, index) {
        const segments = String(baseCode).split('-');
        const lastSegment = Number(segments[segments.length - 1]);

        if (Number.isNaN(lastSegment)) {
            return `${baseCode}-${String(index + 1).padStart(2, '0')}`;
        }

        segments[segments.length - 1] = String(lastSegment + index).padStart(2, '0');
        return segments.join('-');
    }

    buildItemDetails(detail) {
        return Array.from({ length: detail.quantity }, (_, index) => ({
            seq: index + 1,
            snCode: this.buildSnCode(detail, index),
            materialCode: detail.materialCode,
            materialName: detail.materialName,
            status: detail.status
        }));
    }

    buildSnCode(detail, itemIndex) {
        const materialSegment = detail.materialCode.replace(/[^A-Za-z0-9]/g, '');
        const containerSegment = detail.containerCode.replace(/[^A-Za-z0-9]/g, '').slice(-6);
        return `${ERPShipmentPage.SN_PREFIX}-${materialSegment}-${containerSegment}-${String(itemIndex + 1).padStart(3, '0')}`;
    }

    bindEvents() {
        document.getElementById('searchBtn').addEventListener('click', () => this.applyFilters());
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
            'searchShipmentNo',
            'searchCustomerKeyword',
            'searchMaterialKeyword'
        ].forEach((id) => {
            document.getElementById(id).addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    this.applyFilters();
                }
            });
        });
    }

    applyFilters(resetPage = true) {
        const shipmentNo = document.getElementById('searchShipmentNo').value.trim().toLowerCase();
        const status = document.getElementById('searchStatus').value;
        const customerKeyword = document.getElementById('searchCustomerKeyword').value.trim().toLowerCase();
        const materialKeyword = document.getElementById('searchMaterialKeyword').value.trim().toLowerCase();
        const syncStart = document.getElementById('searchSyncStart').value;
        const syncEnd = document.getElementById('searchSyncEnd').value;
        const deliveryStart = document.getElementById('searchDeliveryStart').value;
        const deliveryEnd = document.getElementById('searchDeliveryEnd').value;

        this.filteredData = this.shipmentData.filter((item) => {
            const matchShipmentNo = !shipmentNo || item.shipmentNo.toLowerCase().includes(shipmentNo);
            const matchStatus = !status || item.status === status;
            const matchCustomer = !customerKeyword ||
                item.customerName.toLowerCase().includes(customerKeyword) ||
                item.customerCode.toLowerCase().includes(customerKeyword);
            const matchMaterial = !materialKeyword || item.materials.some((material) =>
                material.materialCode.toLowerCase().includes(materialKeyword) ||
                material.materialName.toLowerCase().includes(materialKeyword)
            );
            const matchSyncTime = this.matchesDateRange(item.syncTime, syncStart, syncEnd);
            const matchDeliveryTime = this.matchesDateRange(item.deliveryTime, deliveryStart, deliveryEnd);

            return matchShipmentNo &&
                matchStatus &&
                matchCustomer &&
                matchMaterial &&
                matchSyncTime &&
                matchDeliveryTime;
        });

        if (resetPage) {
            this.currentPage = 1;
        } else {
            const totalPages = Math.ceil(this.filteredData.length / this.pageSize) || 1;
            this.currentPage = Math.min(this.currentPage, totalPages);
        }

        this.renderTable();
    }

    resetSearch() {
        [
            'searchShipmentNo',
            'searchStatus',
            'searchCustomerKeyword',
            'searchMaterialKeyword',
            'searchSyncStart',
            'searchSyncEnd',
            'searchDeliveryStart',
            'searchDeliveryEnd'
        ].forEach((id) => {
            document.getElementById(id).value = '';
        });

        this.filteredData = [...this.shipmentData];
        this.currentPage = 1;
        this.renderTable();
    }

    matchesDateRange(value, start, end) {
        if (!start && !end) {
            return true;
        }

        const datePart = value && value !== '-' ? value.slice(0, 10) : '';
        if (!datePart) {
            return false;
        }

        return (!start || datePart >= start) && (!end || datePart <= end);
    }

    renderTable() {
        const tbody = document.getElementById('shipmentTableBody');
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageData = this.filteredData.slice(start, end);

        if (!pageData.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10">
                        <div class="empty-state">
                            <div class="empty-icon">📦</div>
                            <div class="empty-text">暂无ERP发货单数据</div>
                            <div class="empty-desc">没有找到符合条件的ERP发货单</div>
                        </div>
                    </td>
                </tr>
            `;
            this.updatePagination();
            return;
        }

        tbody.innerHTML = pageData.map((item) => `
            <tr>
                <td><button class="workorder-link" data-action="view" data-id="${item.id}">${item.shipmentNo}</button></td>
                <td><span class="status-badge ${this.getStatusClass(item.status)}">${this.getStatusText(item)}</span></td>
                <td>${item.customerName}</td>
                <td>${item.customerCode}</td>
                <td class="product-summary">${this.renderMaterialSummary(item.materials)}</td>
                <td>${item.planQty}</td>
                <td>${item.shippedQty}</td>
                <td>${item.syncTime}</td>
                <td>${item.deliveryTime}</td>
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
                    this.startShipment(id);
                } else if (action === 'toggle-pause') {
                    this.togglePauseShipment(id);
                } else if (action === 'complete') {
                    this.completeShipment(id);
                } else if (action === 'cancel') {
                    this.cancelShipment(id);
                } else if (action === 'view') {
                    this.showDetail(id);
                }
            });
        });

        this.updatePagination();
    }

    renderMaterialSummary(materials) {
        return materials.map((material) => `
            <div class="product-summary-item">${material.materialCode} / ${material.materialName} × ${material.planQty}</div>
        `).join('');
    }

    renderActionButtons(item) {
        const actions = [];

        if (item.status === '未发货') {
            actions.push(`<button class="action-link primary" data-action="start" data-id="${item.id}">开始发货</button>`);
            actions.push(`<button class="action-link danger" data-action="cancel" data-id="${item.id}">取消发货</button>`);
        }

        if (item.status === '发货中') {
            actions.push(`<button class="action-link warning" data-action="toggle-pause" data-id="${item.id}">${item.isPaused ? '继续发货' : '暂停发货'}</button>`);
            actions.push(`<button class="action-link success" data-action="complete" data-id="${item.id}">完成发货</button>`);
        }
        return actions.join('');
    }

    getStatusText(item) {
        if (item.status === '发货中' && item.isPaused) {
            return '发货中（已暂停）';
        }
        return item.status;
    }

    getStatusClass(status) {
        const statusMap = {
            '未发货': 'pending',
            '发货中': 'processing',
            '已完成': 'completed',
            '已取消': 'cancelled'
        };
        return statusMap[status] || 'pending';
    }

    getDetailStatusClass(status) {
        const statusMap = {
            '待出库': 'pending',
            '已出库': 'done',
            '已取消': 'cancelled'
        };
        return statusMap[status] || 'pending';
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

    startShipment(id) {
        const item = this.shipmentData.find((record) => record.id === id);
        if (!item || item.status !== '未发货') {
            return;
        }

        this.showConfirmDialog('确认开始发货', `确定开始发货单“${item.shipmentNo}”吗？`, () => {
            item.status = '发货中';
            item.isPaused = false;
            item.deliveryTime = this.getCurrentTime();
            this.refreshOrder(item);
            this.applyFilters(false);
            this.showMessage('发货单已开始发货', 'success');
        });
    }

    togglePauseShipment(id) {
        const item = this.shipmentData.find((record) => record.id === id);
        if (!item || item.status !== '发货中') {
            return;
        }

        const actionText = item.isPaused ? '继续' : '暂停';
        this.showConfirmDialog(`确认${actionText}发货`, `确定${actionText}发货单“${item.shipmentNo}”吗？`, () => {
            item.isPaused = !item.isPaused;
            this.applyFilters(false);
            this.showMessage(`发货单已${actionText}发货`, 'success');
        });
    }

    completeShipment(id) {
        const item = this.shipmentData.find((record) => record.id === id);
        if (!item || item.status !== '发货中') {
            return;
        }

        this.showConfirmDialog('确认完成发货', `确定完成发货单“${item.shipmentNo}”吗？`, () => {
            const completedTime = this.getCurrentTime();
            item.status = '已完成';
            item.isPaused = false;
            item.deliveryTime = completedTime;
            item.materials.forEach((material) => {
                material.shippedQty = material.planQty;
                material.shippedTime = completedTime;
            });
            this.refreshOrder(item);
            this.applyFilters(false);
            this.showMessage('发货单已完成发货', 'success');
        });
    }

    cancelShipment(id) {
        const item = this.shipmentData.find((record) => record.id === id);
        if (!item || item.status !== '未发货') {
            return;
        }

        this.showConfirmDialog('确认取消发货', `确定取消发货单“${item.shipmentNo}”吗？取消后状态将变为已取消。`, () => {
            item.status = '已取消';
            item.isPaused = false;
            item.deliveryTime = '-';
            item.materials.forEach((material) => {
                material.shippedQty = 0;
                material.shippedTime = '-';
            });
            this.refreshOrder(item);
            this.applyFilters(false);
            this.showMessage('发货单已取消', 'success');
        });
    }

    showDetail(id) {
        const item = this.shipmentData.find((record) => record.id === id);
        if (!item) {
            return;
        }

        this.currentDetailId = id;

        document.getElementById('detailSummary').innerHTML = `
            <div class="detail-basic-item">
                <span class="detail-basic-label">发货单编号：</span>
                <span class="detail-basic-value">${item.shipmentNo}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">发货单状态：</span>
                <span class="detail-basic-value"><span class="basic-status-badge ${this.getStatusClass(item.status)}">${this.getStatusText(item)}</span></span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">同步时间：</span>
                <span class="detail-basic-value">${item.syncTime}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">客户名称：</span>
                <span class="detail-basic-value">${item.customerName}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">客户编码：</span>
                <span class="detail-basic-value">${item.customerCode}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">发货时间：</span>
                <span class="detail-basic-value">${item.deliveryTime}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">联系人：</span>
                <span class="detail-basic-value">${item.contactName}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">联系电话：</span>
                <span class="detail-basic-value">${item.contactPhone}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">计划发货数量：</span>
                <span class="detail-basic-value">${item.planQty}</span>
            </div>
            <div class="detail-basic-item">
                <span class="detail-basic-label">已发货数量：</span>
                <span class="detail-basic-value">${item.shippedQty}</span>
            </div>
            <div class="detail-basic-item wide-item">
                <span class="detail-basic-label">收货地址：</span>
                <span class="detail-basic-value">${item.deliveryAddress}</span>
            </div>
            <div class="detail-basic-item wide-item">
                <span class="detail-basic-label">备注：</span>
                <span class="detail-basic-value">${item.remark || '-'}</span>
            </div>
        `;

        const materialTableBody = document.getElementById('materialTableBody');
        materialTableBody.innerHTML = item.materials.map((material, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${material.materialCode}</td>
                <td>${material.materialName}</td>
                <td>${material.planQty}</td>
                <td>${material.shippedQty}</td>
            </tr>
        `).join('');

        this.renderOutboundRows(item.outboundDetails);

        const modal = document.getElementById('detailModal');
        modal.style.display = 'flex';
        modal.classList.add('active');
    }

    renderOutboundRows(rows) {
        const tbody = document.getElementById('outboundTableBody');
        if (!rows.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="detail-empty">暂无成品出库明细</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = rows.map((row) => `
            <tr>
                <td>${row.seq}</td>
                <td>${row.materialCode}</td>
                <td>${row.materialName}</td>
                <td>${row.containerCode}</td>
                <td>${row.quantity}</td>
                <td>${row.areaCode}</td>
                <td>${row.locationCode}</td>
                <td>${row.time}</td>
                <td><span class="detail-status-badge ${this.getDetailStatusClass(row.status)}">${row.status}</span></td>
                <td><button class="inline-link" data-seq="${row.seq}">查看</button></td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.inline-link').forEach((button) => {
            button.addEventListener('click', () => {
                this.showItemDetail(Number(button.dataset.seq));
            });
        });
    }

    showItemDetail(seq) {
        const order = this.shipmentData.find((record) => record.id === this.currentDetailId);
        if (!order) {
            return;
        }

        const detail = order.outboundDetails.find((record) => record.seq === seq);
        if (!detail) {
            return;
        }

        document.getElementById('itemDetailTitle').textContent = '托盘内物料SN明细';
        document.getElementById('itemDetailContent').innerHTML = `
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
                            <span class="pallet-basic-label">出库数量：</span>
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
                            <span class="pallet-basic-label">出库时间：</span>
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
                                <th width="260">SN码</th>
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
            color: #fff;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

const erpShipmentToastStyle = document.createElement('style');
erpShipmentToastStyle.textContent = `
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
document.head.appendChild(erpShipmentToastStyle);

let erpShipmentPage;
document.addEventListener('DOMContentLoaded', () => {
    erpShipmentPage = new ERPShipmentPage();
});
