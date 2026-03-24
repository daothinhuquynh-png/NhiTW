/* =====================================================
   StemCell BMS — Phần mềm Quản lý Ngân hàng Tế bào gốc
   Bệnh viện Nhi Trung Ương
   ===================================================== */

// ===== DATA STORE (localStorage) =====
const DB = {
    get(key) {
        try { return JSON.parse(localStorage.getItem('scbms_' + key)) || []; }
        catch { return []; }
    },
    set(key, data) { localStorage.setItem('scbms_' + key, JSON.stringify(data)); },
    nextId(key) {
        const items = this.get(key);
        return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    }
};

// ===== INIT SAMPLE DATA =====
function initSampleData() {
    if (localStorage.getItem('scbms_initialized')) return;

    const sampleTypes = ['Máu cuống rốn', 'Máu ngoại vi', 'Mô mỡ', 'Tủy xương'];
    const stemGroups = ['Cộng đồng', 'Dịch vụ', 'Máu ngoại vi', 'Khối bạch cầu hạt'];
    const statuses = ['active', 'expiring', 'expired'];
    const customers = [
        { name: 'Nguyễn Văn An', phone: '0901234567', email: 'an.nv@email.com', dob: '1985-03-15' },
        { name: 'Trần Thị Bình', phone: '0912345678', email: 'binh.tt@email.com', dob: '1990-07-22' },
        { name: 'Lê Hoàng Cường', phone: '0923456789', email: 'cuong.lh@email.com', dob: '1988-11-08' },
        { name: 'Phạm Minh Duy', phone: '0934567890', email: 'duy.pm@email.com', dob: '1992-01-30' },
        { name: 'Hoàng Thị Em', phone: '0945678901', email: 'em.ht@email.com', dob: '1995-05-12' },
        { name: 'Vũ Đức Phong', phone: '0956789012', email: 'phong.vd@email.com', dob: '1987-09-18' },
        { name: 'Đỗ Thị Giang', phone: '0967890123', email: 'giang.dt@email.com', dob: '1993-12-25' },
        { name: 'Bùi Thanh Hải', phone: '0978901234', email: 'hai.bt@email.com', dob: '1986-06-03' },
    ];

    // Contracts
    const contracts = customers.map((c, i) => ({
        id: i + 1,
        code: `HD-2026-${String(i + 1).padStart(4, '0')}`,
        customerName: c.name,
        phone: c.phone,
        email: c.email,
        dob: c.dob,
        sampleType: sampleTypes[i % 4],
        stemGroup: stemGroups[i % 4],
        packageType: ['1 năm', '3 năm', '5 năm', '10 năm'][i % 4],
        status: statuses[i % 3],
        startDate: `2025-${String((i % 12) + 1).padStart(2, '0')}-01`,
        endDate: `2026-${String((i % 12) + 1).padStart(2, '0')}-01`,
        notes: '',
        createdAt: new Date(2025, i % 12, 1).toISOString(),
        testPackage: ['Gói cơ bản', 'Gói nâng cao', 'Gói toàn diện'][i % 3],
    }));
    DB.set('contracts', contracts);

    // Samples
    const samples = [];
    contracts.forEach((ct, i) => {
        if (i < 6) {
            samples.push({
                id: i + 1,
                code: `M-${String(i + 1).padStart(5, '0')}`,
                contractId: ct.id,
                contractCode: ct.code,
                customerName: ct.customerName,
                sampleType: ct.sampleType,
                stemGroup: ct.stemGroup,
                status: ['stored', 'in_transit', 'received', 'testing', 'stored', 'stored'][i],
                quality: ['good', 'good', 'fair', 'good', 'good', 'fair'][i],
                collectedAt: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String(5 + i).padStart(2, '0')}T08:30:00`,
                collectedBy: ['BS. Minh', 'BS. Lan', 'BS. Hùng', 'BS. Minh', 'BS. Lan', 'BS. Hùng'][i],
                location: i < 4 ? { cabinet: i < 2 ? 1 : 2, shelf: (i % 3) + 1, tray: 1, box: 1, position: i + 1 } : null,
                volume: (20 + Math.random() * 30).toFixed(1),
                color: ['Đỏ sẫm', 'Đỏ tươi', 'Đỏ sẫm', 'Đỏ tươi', 'Đỏ sẫm', 'Đỏ tươi'][i],
                testResults: i < 4 ? [
                    { name: 'CD34+', value: (0.5 + Math.random() * 2).toFixed(2) + '%', pass: true },
                    { name: 'Tế bào sống', value: (85 + Math.random() * 10).toFixed(1) + '%', pass: true },
                    { name: 'Vi khuẩn', value: 'Âm tính', pass: true },
                ] : [],
                createdAt: new Date(2025, i % 12, 5 + i).toISOString(),
            });
        }
    });
    DB.set('samples', samples);

    // Cabinets
    const cabinets = [
        { id: 1, name: 'Tủ N2 lỏng #01', shelves: 5, trays: 4, boxes: 6, positions: 25, temperature: '-196°C' },
        { id: 2, name: 'Tủ N2 lỏng #02', shelves: 5, trays: 4, boxes: 6, positions: 25, temperature: '-196°C' },
        { id: 3, name: 'Tủ đông sâu #01', shelves: 4, trays: 3, boxes: 8, positions: 16, temperature: '-80°C' },
    ];
    DB.set('cabinets', cabinets);

    // Storage map
    const storageMap = {};
    samples.forEach(s => {
        if (s.location) {
            const key = `${s.location.cabinet}-${s.location.shelf}-${s.location.tray}-${s.location.box}-${s.location.position}`;
            storageMap[key] = { sampleId: s.id, sampleCode: s.code, customerName: s.customerName, status: s.status };
        }
    });
    DB.set('storageMap', storageMap);

    // Transport logs
    const transports = [
        { id: 1, sampleId: 1, sampleCode: 'M-00001', from: 'BV Nhi TW - Khoa sản', to: 'Ngân hàng TBG', status: 'delivered', carrier: 'Nguyễn Minh', startTime: '2025-01-05T09:00:00', endTime: '2025-01-05T10:30:00', tempLog: ['-18°C', '-17°C', '-18°C'], notes: 'Vận chuyển bình thường' },
        { id: 2, sampleId: 2, sampleCode: 'M-00002', from: 'BV Phụ sản HN', to: 'Ngân hàng TBG', status: 'delivered', carrier: 'Trần Hùng', startTime: '2025-02-06T08:00:00', endTime: '2025-02-06T09:45:00', tempLog: ['-19°C', '-18°C', '-18°C'], notes: '' },
        { id: 3, sampleId: 3, sampleCode: 'M-00003', from: 'BV Nhi TW - Khoa sản', to: 'Ngân hàng TBG', status: 'in_transit', carrier: 'Lê Phong', startTime: '2025-03-07T07:30:00', endTime: null, tempLog: ['-17°C'], notes: 'Đang vận chuyển' },
    ];
    DB.set('transports', transports);

    // Storage requests
    const storageRequests = [
        { id: 1, sampleId: 1, sampleCode: 'M-00001', requestedBy: 'Nguyễn Thành', requestDate: '2025-01-05', status: 'approved', cabinetId: 1, location: '1-1-1-1-1', approvals: [
            { level: 1, approver: 'Trưởng phòng XN', status: 'approved', date: '2025-01-05', notes: 'Đồng ý' },
            { level: 2, approver: 'Phó giám đốc', status: 'approved', date: '2025-01-06', notes: 'Duyệt' },
            { level: 3, approver: 'Giám đốc', status: 'approved', date: '2025-01-06', notes: 'Phê duyệt' },
        ]},
        { id: 2, sampleId: 4, sampleCode: 'M-00004', requestedBy: 'Nguyễn Thành', requestDate: '2025-04-10', status: 'pending_level2', cabinetId: 2, location: '2-1-1-1-1', approvals: [
            { level: 1, approver: 'Trưởng phòng XN', status: 'approved', date: '2025-04-10', notes: 'Đồng ý' },
            { level: 2, approver: 'Phó giám đốc', status: 'pending', date: null, notes: '' },
            { level: 3, approver: 'Giám đốc', status: 'pending', date: null, notes: '' },
        ]},
    ];
    DB.set('storageRequests', storageRequests);

    // Export requests
    const exports = [
        { id: 1, sampleId: 1, sampleCode: 'M-00001', customerName: 'Nguyễn Văn An', purpose: 'Sử dụng điều trị', requestDate: '2025-06-01', status: 'pending', requestedBy: 'BS. Minh', notes: 'Xuất theo yêu cầu bệnh nhân' },
    ];
    DB.set('exports', exports);

    // CRM templates
    const templates = [
        { id: 1, name: 'Nhắc gia hạn hợp đồng', type: 'email', subject: 'Nhắc nhở gia hạn hợp đồng lưu mẫu', body: 'Kính gửi {customerName},\n\nHợp đồng {contractCode} của quý khách sẽ hết hạn vào ngày {endDate}. Vui lòng liên hệ để gia hạn.\n\nTrân trọng,\nNgân hàng TBG - BV Nhi TW' },
        { id: 2, name: 'Chúc mừng sinh nhật', type: 'sms', subject: '', body: 'Ngan hang TBG BV Nhi TW kinh chuc {customerName} sinh nhat vui ve! Chuc anh/chi suc khoe, hanh phuc.' },
        { id: 3, name: 'Báo cáo chất lượng mẫu', type: 'email', subject: 'Báo cáo chất lượng mẫu định kỳ', body: 'Kính gửi {customerName},\n\nMẫu {sampleCode} của quý khách hiện đang được lưu trữ an toàn. Kết quả kiểm tra chất lượng gần nhất cho thấy mẫu đạt tiêu chuẩn.\n\nTrân trọng.' },
    ];
    DB.set('crmTemplates', templates);

    // Notifications
    const notifs = [
        { id: 1, title: 'Hợp đồng cận hạn', text: 'HD-2026-0002 sẽ hết hạn trong 30 ngày', time: new Date().toISOString(), read: false },
        { id: 2, title: 'Mẫu đang vận chuyển', text: 'M-00003 đang trên đường vận chuyển về kho', time: new Date().toISOString(), read: false },
        { id: 3, title: 'Phiếu lưu chờ duyệt', text: 'Phiếu #2 đang chờ phê duyệt cấp 2', time: new Date().toISOString(), read: false },
    ];
    DB.set('notifications', notifs);

    localStorage.setItem('scbms_initialized', '1');
}

// ===== UTILITY FUNCTIONS =====
function formatDate(d) {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('vi-VN');
}
function formatDateTime(d) {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleString('vi-VN');
}
function statusText(s) {
    const map = {
        active: 'Còn hạn', expiring: 'Cận hạn', expired: 'Hết hạn',
        stored: 'Đang lưu', in_transit: 'Đang vận chuyển', received: 'Đã tiếp nhận',
        testing: 'Đang xét nghiệm', exported: 'Đã xuất', destroyed: 'Đã hủy',
        delivered: 'Đã giao', pending: 'Chờ xử lý',
        pending_level1: 'Chờ duyệt cấp 1', pending_level2: 'Chờ duyệt cấp 2', pending_level3: 'Chờ duyệt cấp 3',
        approved: 'Đã duyệt', rejected: 'Từ chối',
        good: 'Tốt', fair: 'Trung bình', poor: 'Kém',
        sent: 'Đã gửi', failed: 'Gửi thất bại',
    };
    return map[s] || s;
}
function statusClass(s) {
    const map = {
        active: 'status-active', good: 'status-active', approved: 'status-active', stored: 'status-active', delivered: 'status-active', sent: 'status-active',
        expiring: 'status-warning', pending: 'status-warning', fair: 'status-warning', in_transit: 'status-warning', testing: 'status-info',
        pending_level1: 'status-warning', pending_level2: 'status-warning', pending_level3: 'status-warning',
        expired: 'status-danger', rejected: 'status-danger', poor: 'status-danger', destroyed: 'status-danger', failed: 'status-danger',
        received: 'status-info', exported: 'status-purple',
    };
    return map[s] || 'status-default';
}
function generateCode(prefix) {
    return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

// ===== UI HELPERS =====
function toast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span>${['✅','❌','⚠️','ℹ️'][['success','error','warning','info'].indexOf(type)] || '✅'}</span><span>${msg}</span>`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

function openModal(title, bodyHtml, footerHtml = '', large = false) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalFooter').innerHTML = footerHtml;
    document.getElementById('modal').className = large ? 'modal modal-lg' : 'modal';
    document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
}

// ===== ROUTER =====
let currentPage = 'dashboard';

function navigate(page) {
    currentPage = page;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
    const titles = {
        dashboard: 'Tổng quan', contracts: 'Hợp đồng lưu mẫu',
        collection: 'Thu thập & Vận chuyển', receiving: 'Tiếp nhận & Lưu mẫu',
        export: 'Xuất mẫu', crm: 'Quan hệ khách hàng', storage: 'Quản lý tủ lưu mẫu',
    };
    document.getElementById('breadcrumb').textContent = titles[page] || page;
    renderPage(page);
    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
}

function renderPage(page) {
    const content = document.getElementById('pageContent');
    const renderers = { dashboard: renderDashboard, contracts: renderContracts, collection: renderCollection, receiving: renderReceiving, export: renderExport, crm: renderCRM, storage: renderStorage };
    if (renderers[page]) renderers[page](content);
}

// ===== DASHBOARD =====
function renderDashboard(el) {
    const contracts = DB.get('contracts');
    const samples = DB.get('samples');
    const cabinets = DB.get('cabinets');
    const storageRequests = DB.get('storageRequests');

    const active = contracts.filter(c => c.status === 'active').length;
    const expiring = contracts.filter(c => c.status === 'expiring').length;
    const totalSamples = samples.length;
    const stored = samples.filter(s => s.status === 'stored').length;
    const pendingApprovals = storageRequests.filter(r => r.status.startsWith('pending')).length;

    el.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(41,128,185,0.1);color:#2980b9">📋</div>
                <div><div class="stat-value">${contracts.length}</div><div class="stat-label">Tổng hợp đồng</div></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(39,174,96,0.1);color:#27ae60">✅</div>
                <div><div class="stat-value">${active}</div><div class="stat-label">Còn hạn</div></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(243,156,18,0.1);color:#f39c12">⚠️</div>
                <div><div class="stat-value">${expiring}</div><div class="stat-label">Cận hạn</div></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(142,68,173,0.1);color:#8e44ad">🧬</div>
                <div><div class="stat-value">${totalSamples}</div><div class="stat-label">Tổng mẫu</div></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(52,152,219,0.1);color:#3498db">🗄️</div>
                <div><div class="stat-value">${stored}</div><div class="stat-label">Đang lưu trữ</div></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(231,76,60,0.1);color:#e74c3c">📝</div>
                <div><div class="stat-value">${pendingApprovals}</div><div class="stat-label">Chờ duyệt</div></div>
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
            <div class="card">
                <div class="card-header"><div class="card-title">Phân bổ trạng thái hợp đồng</div></div>
                <div class="chart-bars">
                    <div class="chart-bar-item">
                        <div class="chart-bar-label">Còn hạn</div>
                        <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${contracts.length ? active/contracts.length*100 : 0}%;background:#27ae60">${active}</div></div>
                    </div>
                    <div class="chart-bar-item">
                        <div class="chart-bar-label">Cận hạn</div>
                        <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${contracts.length ? expiring/contracts.length*100 : 0}%;background:#f39c12">${expiring}</div></div>
                    </div>
                    <div class="chart-bar-item">
                        <div class="chart-bar-label">Hết hạn</div>
                        <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${contracts.length ? contracts.filter(c=>c.status==='expired').length/contracts.length*100 : 0}%;background:#e74c3c">${contracts.filter(c=>c.status==='expired').length}</div></div>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><div class="card-title">Trạng thái mẫu</div></div>
                <div class="chart-bars">
                    ${['stored', 'in_transit', 'received', 'testing'].map(s => {
                        const count = samples.filter(m => m.status === s).length;
                        return `<div class="chart-bar-item">
                            <div class="chart-bar-label">${statusText(s)}</div>
                            <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${totalSamples ? count/totalSamples*100 : 0}%;background:${s==='stored'?'#27ae60':s==='in_transit'?'#f39c12':'#3498db'}">${count}</div></div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:20px;margin-top:4px">
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Hợp đồng cận hạn</div>
                    <button class="btn btn-sm btn-outline" onclick="navigate('contracts')">Xem tất cả</button>
                </div>
                <div class="table-wrap"><table class="data-table">
                    <thead><tr><th>Mã HĐ</th><th>Khách hàng</th><th>Ngày hết hạn</th><th>Trạng thái</th></tr></thead>
                    <tbody>
                        ${contracts.filter(c => c.status === 'expiring' || c.status === 'expired').slice(0, 5).map(c => `
                            <tr style="cursor:pointer" onclick="viewContract(${c.id})">
                                <td><strong>${c.code}</strong></td>
                                <td>${c.customerName}</td>
                                <td>${formatDate(c.endDate)}</td>
                                <td><span class="status ${statusClass(c.status)}">${statusText(c.status)}</span></td>
                            </tr>
                        `).join('') || '<tr><td colspan="4" class="empty-state">Không có hợp đồng cận hạn</td></tr>'}
                    </tbody>
                </table></div>
            </div>
            <div class="card">
                <div class="card-header"><div class="card-title">Tủ lưu trữ</div></div>
                ${cabinets.map(cab => {
                    const total = cab.shelves * cab.trays * cab.boxes * cab.positions;
                    const map = DB.get('storageMap');
                    const used = Object.keys(map).filter(k => k.startsWith(cab.id + '-')).length;
                    const pct = total > 0 ? (used / total * 100).toFixed(0) : 0;
                    return `<div style="margin-bottom:12px">
                        <div style="display:flex;justify-content:space-between;font-size:0.85rem;font-weight:600">
                            <span>${cab.name}</span><span>${pct}%</span>
                        </div>
                        <div class="fill-bar"><div class="fill-bar-inner ${pct > 80 ? 'high' : pct > 50 ? 'medium' : 'low'}" style="width:${pct}%"></div></div>
                        <div class="fill-text">${used}/${total} vị trí &middot; ${cab.temperature}</div>
                    </div>`;
                }).join('')}
            </div>
        </div>
    `;
}

// ===== FR-2.1: HỢP ĐỒNG LƯU MẪU =====
function renderContracts(el) {
    const contracts = DB.get('contracts');
    el.innerHTML = `
        <div class="toolbar">
            <div class="filter-group">
                <select id="filterStatus" onchange="renderContracts(document.getElementById('pageContent'))">
                    <option value="">Tất cả trạng thái</option>
                    <option value="active">Còn hạn</option>
                    <option value="expiring">Cận hạn</option>
                    <option value="expired">Hết hạn</option>
                </select>
                <select id="filterStemGroup" onchange="renderContracts(document.getElementById('pageContent'))">
                    <option value="">Tất cả nhóm TBG</option>
                    <option value="Cộng đồng">Cộng đồng</option>
                    <option value="Dịch vụ">Dịch vụ</option>
                    <option value="Máu ngoại vi">Máu ngoại vi</option>
                    <option value="Khối bạch cầu hạt">Khối bạch cầu hạt</option>
                </select>
                <input type="text" placeholder="Tìm kiếm..." id="contractSearch" oninput="renderContracts(document.getElementById('pageContent'))">
            </div>
            <div class="spacer"></div>
            <button class="btn btn-primary" onclick="openContractForm()">+ Thêm hợp đồng</button>
        </div>
        <div class="card">
            <div class="table-wrap"><table class="data-table">
                <thead><tr>
                    <th>Mã HĐ</th><th>Khách hàng</th><th>Loại mẫu</th><th>Nhóm TBG</th>
                    <th>Gói</th><th>Ngày bắt đầu</th><th>Ngày kết thúc</th><th>Trạng thái</th><th>Thao tác</th>
                </tr></thead>
                <tbody id="contractsBody"></tbody>
            </table></div>
        </div>
    `;
    renderContractRows(contracts);
}

function renderContractRows(contracts) {
    const status = document.getElementById('filterStatus')?.value || '';
    const group = document.getElementById('filterStemGroup')?.value || '';
    const search = (document.getElementById('contractSearch')?.value || '').toLowerCase();

    let filtered = contracts;
    if (status) filtered = filtered.filter(c => c.status === status);
    if (group) filtered = filtered.filter(c => c.stemGroup === group);
    if (search) filtered = filtered.filter(c => c.code.toLowerCase().includes(search) || c.customerName.toLowerCase().includes(search));

    const tbody = document.getElementById('contractsBody');
    if (!tbody) return;
    tbody.innerHTML = filtered.map(c => `
        <tr>
            <td><strong style="color:var(--primary);cursor:pointer" onclick="viewContract(${c.id})">${c.code}</strong></td>
            <td>${c.customerName}</td>
            <td>${c.sampleType}</td>
            <td>${c.stemGroup}</td>
            <td>${c.packageType}</td>
            <td>${formatDate(c.startDate)}</td>
            <td>${formatDate(c.endDate)}</td>
            <td><span class="status ${statusClass(c.status)}">${statusText(c.status)}</span></td>
            <td>
                <button class="btn btn-sm btn-outline btn-icon" onclick="openContractForm(${c.id})" title="Sửa">✏️</button>
                <button class="btn btn-sm btn-outline btn-icon" onclick="deleteContract(${c.id})" title="Xóa">🗑️</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">📋</div><h3>Chưa có hợp đồng</h3><p>Nhấn "Thêm hợp đồng" để tạo mới</p></div></td></tr>';
}

function openContractForm(id) {
    const c = id ? DB.get('contracts').find(x => x.id === id) : null;
    const title = c ? 'Sửa hợp đồng' : 'Thêm hợp đồng mới';
    const body = `
        <div class="form-row">
            <div class="form-group"><label class="form-label">Mã hợp đồng</label><input class="form-control" id="fCode" value="${c ? c.code : generateCode('HD')}" ${c ? 'readonly' : ''}></div>
            <div class="form-group"><label class="form-label">Tên khách hàng <span class="required">*</span></label><input class="form-control" id="fName" value="${c ? c.customerName : ''}" required></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Số điện thoại</label><input class="form-control" id="fPhone" value="${c ? c.phone : ''}"></div>
            <div class="form-group"><label class="form-label">Email</label><input class="form-control" id="fEmail" value="${c ? c.email : ''}"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Ngày sinh</label><input type="date" class="form-control" id="fDob" value="${c ? c.dob : ''}"></div>
            <div class="form-group">
                <label class="form-label">Loại mẫu</label>
                <select class="form-control" id="fSampleType">
                    ${['Máu cuống rốn','Máu ngoại vi','Mô mỡ','Tủy xương'].map(t => `<option ${c && c.sampleType === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Nhóm tế bào gốc</label>
                <select class="form-control" id="fStemGroup">
                    ${['Cộng đồng','Dịch vụ','Máu ngoại vi','Khối bạch cầu hạt'].map(t => `<option ${c && c.stemGroup === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Gói lưu trữ</label>
                <select class="form-control" id="fPackage">
                    ${['1 năm','3 năm','5 năm','10 năm','20 năm'].map(t => `<option ${c && c.packageType === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Ngày bắt đầu</label><input type="date" class="form-control" id="fStart" value="${c ? c.startDate : new Date().toISOString().split('T')[0]}"></div>
            <div class="form-group"><label class="form-label">Ngày kết thúc</label><input type="date" class="form-control" id="fEnd" value="${c ? c.endDate : ''}"></div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Trạng thái</label>
                <select class="form-control" id="fStatus">
                    ${['active','expiring','expired'].map(s => `<option value="${s}" ${c && c.status === s ? 'selected' : ''}>${statusText(s)}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Gói xét nghiệm</label>
                <select class="form-control" id="fTestPkg">
                    ${['Gói cơ bản','Gói nâng cao','Gói toàn diện'].map(t => `<option ${c && c.testPackage === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
            </div>
        </div>
        <div class="form-group"><label class="form-label">Ghi chú</label><textarea class="form-control" id="fNotes">${c ? c.notes || '' : ''}</textarea></div>
    `;
    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">Hủy</button>
        <button class="btn btn-primary" onclick="saveContract(${id || 'null'})">${c ? 'Cập nhật' : 'Tạo hợp đồng'}</button>
    `;
    openModal(title, body, footer, true);
}

function saveContract(id) {
    const name = document.getElementById('fName').value.trim();
    if (!name) return toast('Vui lòng nhập tên khách hàng', 'error');

    const contracts = DB.get('contracts');
    const data = {
        code: document.getElementById('fCode').value,
        customerName: name,
        phone: document.getElementById('fPhone').value,
        email: document.getElementById('fEmail').value,
        dob: document.getElementById('fDob').value,
        sampleType: document.getElementById('fSampleType').value,
        stemGroup: document.getElementById('fStemGroup').value,
        packageType: document.getElementById('fPackage').value,
        startDate: document.getElementById('fStart').value,
        endDate: document.getElementById('fEnd').value,
        status: document.getElementById('fStatus').value,
        testPackage: document.getElementById('fTestPkg').value,
        notes: document.getElementById('fNotes').value,
    };

    if (id) {
        const idx = contracts.findIndex(c => c.id === id);
        contracts[idx] = { ...contracts[idx], ...data };
        toast('Cập nhật hợp đồng thành công');
    } else {
        data.id = DB.nextId('contracts');
        data.createdAt = new Date().toISOString();
        contracts.push(data);
        toast('Tạo hợp đồng thành công');
    }
    DB.set('contracts', contracts);
    closeModal();
    renderContracts(document.getElementById('pageContent'));
}

function deleteContract(id) {
    if (!confirm('Bạn có chắc muốn xóa hợp đồng này?')) return;
    const contracts = DB.get('contracts').filter(c => c.id !== id);
    DB.set('contracts', contracts);
    toast('Đã xóa hợp đồng');
    renderContracts(document.getElementById('pageContent'));
}

function viewContract(id) {
    const c = DB.get('contracts').find(x => x.id === id);
    if (!c) return;
    const samples = DB.get('samples').filter(s => s.contractId === id);
    const body = `
        <div class="detail-header">
            <div>
                <div class="detail-title">${c.customerName}</div>
                <div class="detail-id">${c.code}</div>
            </div>
            <span class="status ${statusClass(c.status)}">${statusText(c.status)}</span>
        </div>
        <div class="detail-grid" style="margin-bottom:20px">
            <div class="detail-field"><div class="field-label">Số điện thoại</div><div class="field-value">${c.phone || '—'}</div></div>
            <div class="detail-field"><div class="field-label">Email</div><div class="field-value">${c.email || '—'}</div></div>
            <div class="detail-field"><div class="field-label">Ngày sinh</div><div class="field-value">${formatDate(c.dob)}</div></div>
            <div class="detail-field"><div class="field-label">Loại mẫu</div><div class="field-value">${c.sampleType}</div></div>
            <div class="detail-field"><div class="field-label">Nhóm TBG</div><div class="field-value">${c.stemGroup}</div></div>
            <div class="detail-field"><div class="field-label">Gói lưu trữ</div><div class="field-value">${c.packageType}</div></div>
            <div class="detail-field"><div class="field-label">Gói xét nghiệm</div><div class="field-value">${c.testPackage}</div></div>
            <div class="detail-field"><div class="field-label">Ngày bắt đầu</div><div class="field-value">${formatDate(c.startDate)}</div></div>
            <div class="detail-field"><div class="field-label">Ngày kết thúc</div><div class="field-value">${formatDate(c.endDate)}</div></div>
        </div>
        ${samples.length > 0 ? `
        <h4 style="margin-bottom:12px;color:var(--primary)">Mẫu liên quan (${samples.length})</h4>
        <table class="data-table">
            <thead><tr><th>Mã mẫu</th><th>Loại</th><th>Trạng thái</th><th>Chất lượng</th><th>Ngày thu</th></tr></thead>
            <tbody>${samples.map(s => `
                <tr>
                    <td><strong>${s.code}</strong></td><td>${s.sampleType}</td>
                    <td><span class="status ${statusClass(s.status)}">${statusText(s.status)}</span></td>
                    <td><span class="status ${statusClass(s.quality)}">${statusText(s.quality)}</span></td>
                    <td>${formatDateTime(s.collectedAt)}</td>
                </tr>`).join('')}</tbody>
        </table>` : '<div class="empty-state"><p>Chưa có mẫu nào được thu thập</p></div>'}
    `;
    openModal('Chi tiết hợp đồng', body, `<button class="btn btn-outline" onclick="closeModal()">Đóng</button>`, true);
}

// ===== FR-2.2: THU THẬP & VẬN CHUYỂN =====
function renderCollection(el) {
    const samples = DB.get('samples');
    const transports = DB.get('transports');

    el.innerHTML = `
        <div class="tabs">
            <button class="tab active" onclick="switchCollectionTab('samples',this)">Mẫu thu thập</button>
            <button class="tab" onclick="switchCollectionTab('transport',this)">Vận chuyển</button>
        </div>
        <div id="collectionSamples" class="tab-panel active">
            <div class="toolbar">
                <div class="filter-group">
                    <select id="sampleStatusFilter" onchange="filterSamples()">
                        <option value="">Tất cả</option>
                        <option value="testing">Đang xét nghiệm</option>
                        <option value="received">Đã tiếp nhận</option>
                        <option value="stored">Đang lưu</option>
                        <option value="in_transit">Đang vận chuyển</option>
                    </select>
                </div>
                <div class="spacer"></div>
                <button class="btn btn-primary" onclick="openSampleForm()">+ Ghi nhận thu thập</button>
            </div>
            <div class="card">
                <div class="table-wrap"><table class="data-table">
                    <thead><tr><th>Mã mẫu</th><th>Mã HĐ</th><th>Khách hàng</th><th>Loại</th><th>Thể tích</th><th>Màu</th><th>Chất lượng</th><th>Người thu</th><th>Thời gian</th><th>Trạng thái</th><th></th></tr></thead>
                    <tbody id="samplesBody">
                        ${samples.map(s => `<tr>
                            <td><strong style="color:var(--primary);cursor:pointer" onclick="viewSample(${s.id})">${s.code}</strong></td>
                            <td>${s.contractCode}</td><td>${s.customerName}</td><td>${s.sampleType}</td>
                            <td>${s.volume} ml</td><td>${s.color}</td>
                            <td><span class="status ${statusClass(s.quality)}">${statusText(s.quality)}</span></td>
                            <td>${s.collectedBy}</td><td>${formatDateTime(s.collectedAt)}</td>
                            <td><span class="status ${statusClass(s.status)}">${statusText(s.status)}</span></td>
                            <td><button class="btn btn-sm btn-outline btn-icon" onclick="viewSample(${s.id})">👁️</button></td>
                        </tr>`).join('') || '<tr><td colspan="11"><div class="empty-state"><div class="empty-icon">🔬</div><h3>Chưa có mẫu</h3></div></td></tr>'}
                    </tbody>
                </table></div>
            </div>
        </div>
        <div id="collectionTransport" class="tab-panel">
            <div class="toolbar">
                <div class="spacer"></div>
                <button class="btn btn-primary" onclick="openTransportForm()">+ Tạo vận chuyển</button>
            </div>
            <div class="card">
                <div class="table-wrap"><table class="data-table">
                    <thead><tr><th>Mã mẫu</th><th>Từ</th><th>Đến</th><th>Người vận chuyển</th><th>Bắt đầu</th><th>Kết thúc</th><th>Nhiệt độ</th><th>Trạng thái</th><th></th></tr></thead>
                    <tbody>
                        ${transports.map(t => `<tr>
                            <td><strong>${t.sampleCode}</strong></td>
                            <td>${t.from}</td><td>${t.to}</td><td>${t.carrier}</td>
                            <td>${formatDateTime(t.startTime)}</td><td>${formatDateTime(t.endTime)}</td>
                            <td>${t.tempLog.join(', ')}</td>
                            <td><span class="status ${statusClass(t.status)}">${statusText(t.status)}</span></td>
                            <td>
                                ${t.status === 'in_transit' ? `<button class="btn btn-sm btn-accent" onclick="completeTransport(${t.id})">Hoàn thành</button>` : ''}
                            </td>
                        </tr>`).join('') || '<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">🚚</div><h3>Chưa có vận chuyển</h3></div></td></tr>'}
                    </tbody>
                </table></div>
            </div>
        </div>
    `;
}

function switchCollectionTab(tab, btn) {
    document.querySelectorAll('#pageContent .tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('collectionSamples').classList.toggle('active', tab === 'samples');
    document.getElementById('collectionTransport').classList.toggle('active', tab === 'transport');
}

function openSampleForm() {
    const contracts = DB.get('contracts');
    const body = `
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Hợp đồng <span class="required">*</span></label>
                <select class="form-control" id="fSampleContract">
                    <option value="">-- Chọn hợp đồng --</option>
                    ${contracts.map(c => `<option value="${c.id}" data-name="${c.customerName}" data-type="${c.sampleType}" data-group="${c.stemGroup}" data-code="${c.code}">${c.code} — ${c.customerName}</option>`).join('')}
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Thể tích (ml)</label><input type="number" class="form-control" id="fVolume" value="25" step="0.1"></div>
            <div class="form-group"><label class="form-label">Màu sắc</label>
                <select class="form-control" id="fColor"><option>Đỏ sẫm</option><option>Đỏ tươi</option><option>Hồng nhạt</option></select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Người thu thập</label><input class="form-control" id="fCollector" value=""></div>
            <div class="form-group">
                <label class="form-label">Đánh giá chất lượng</label>
                <select class="form-control" id="fQuality"><option value="good">Tốt</option><option value="fair">Trung bình</option><option value="poor">Kém</option></select>
            </div>
        </div>
        <div class="form-group"><label class="form-label">Ghi chú</label><textarea class="form-control" id="fSampleNotes"></textarea></div>
    `;
    openModal('Ghi nhận thu thập mẫu', body, `
        <button class="btn btn-outline" onclick="closeModal()">Hủy</button>
        <button class="btn btn-primary" onclick="saveSample()">Lưu</button>
    `);
}

function saveSample() {
    const sel = document.getElementById('fSampleContract');
    if (!sel.value) return toast('Vui lòng chọn hợp đồng', 'error');
    const opt = sel.options[sel.selectedIndex];
    const samples = DB.get('samples');
    samples.push({
        id: DB.nextId('samples'),
        code: generateCode('M'),
        contractId: parseInt(sel.value),
        contractCode: opt.dataset.code,
        customerName: opt.dataset.name,
        sampleType: opt.dataset.type,
        stemGroup: opt.dataset.group,
        status: 'received',
        quality: document.getElementById('fQuality').value,
        collectedAt: new Date().toISOString(),
        collectedBy: document.getElementById('fCollector').value || 'N/A',
        location: null,
        volume: document.getElementById('fVolume').value,
        color: document.getElementById('fColor').value,
        testResults: [],
        createdAt: new Date().toISOString(),
    });
    DB.set('samples', samples);
    toast('Ghi nhận thu thập mẫu thành công');
    closeModal();
    renderCollection(document.getElementById('pageContent'));
}

function viewSample(id) {
    const s = DB.get('samples').find(x => x.id === id);
    if (!s) return;
    const body = `
        <div class="detail-header">
            <div><div class="detail-title">${s.code}</div><div class="detail-id">${s.customerName} — ${s.contractCode}</div></div>
            <span class="status ${statusClass(s.status)}">${statusText(s.status)}</span>
        </div>
        <div class="detail-grid" style="margin-bottom:20px">
            <div class="detail-field"><div class="field-label">Loại mẫu</div><div class="field-value">${s.sampleType}</div></div>
            <div class="detail-field"><div class="field-label">Nhóm TBG</div><div class="field-value">${s.stemGroup}</div></div>
            <div class="detail-field"><div class="field-label">Thể tích</div><div class="field-value">${s.volume} ml</div></div>
            <div class="detail-field"><div class="field-label">Màu sắc</div><div class="field-value">${s.color}</div></div>
            <div class="detail-field"><div class="field-label">Chất lượng</div><div class="field-value"><span class="status ${statusClass(s.quality)}">${statusText(s.quality)}</span></div></div>
            <div class="detail-field"><div class="field-label">Người thu thập</div><div class="field-value">${s.collectedBy}</div></div>
            <div class="detail-field"><div class="field-label">Thời gian thu thập</div><div class="field-value">${formatDateTime(s.collectedAt)}</div></div>
            <div class="detail-field"><div class="field-label">Vị trí lưu</div><div class="field-value">${s.location ? `Tủ ${s.location.cabinet} / Ngăn ${s.location.shelf} / Khay ${s.location.tray} / Hộp ${s.location.box} / Vị trí ${s.location.position}` : 'Chưa lưu kho'}</div></div>
        </div>
        ${s.testResults.length > 0 ? `
        <h4 style="margin-bottom:8px;color:var(--primary)">Kết quả xét nghiệm</h4>
        <table class="data-table"><thead><tr><th>Chỉ số</th><th>Kết quả</th><th>Đánh giá</th></tr></thead>
        <tbody>${s.testResults.map(t => `<tr><td>${t.name}</td><td>${t.value}</td><td><span class="status ${t.pass ? 'status-active' : 'status-danger'}">${t.pass ? 'Đạt' : 'Không đạt'}</span></td></tr>`).join('')}</tbody></table>
        ` : '<p style="color:var(--text-secondary)">Chưa có kết quả xét nghiệm</p>'}
    `;
    openModal('Chi tiết mẫu', body, `
        ${!s.testResults.length ? `<button class="btn btn-primary" onclick="addTestResults(${s.id})">Nhập kết quả XN</button>` : ''}
        <button class="btn btn-outline" onclick="closeModal()">Đóng</button>
    `, true);
}

function addTestResults(sampleId) {
    const body = `
        <p style="margin-bottom:16px;color:var(--text-secondary)">Nhập kết quả xét nghiệm cho mẫu</p>
        <div id="testResultsFields">
            <div class="form-row test-row">
                <div class="form-group"><label class="form-label">Chỉ số</label><input class="form-control test-name" value="CD34+"></div>
                <div class="form-group"><label class="form-label">Kết quả</label><input class="form-control test-value"></div>
                <div class="form-group"><label class="form-label">Đánh giá</label><select class="form-control test-pass"><option value="true">Đạt</option><option value="false">Không đạt</option></select></div>
            </div>
            <div class="form-row test-row">
                <div class="form-group"><label class="form-label">Chỉ số</label><input class="form-control test-name" value="Tế bào sống"></div>
                <div class="form-group"><label class="form-label">Kết quả</label><input class="form-control test-value"></div>
                <div class="form-group"><label class="form-label">Đánh giá</label><select class="form-control test-pass"><option value="true">Đạt</option><option value="false">Không đạt</option></select></div>
            </div>
            <div class="form-row test-row">
                <div class="form-group"><label class="form-label">Chỉ số</label><input class="form-control test-name" value="Vi khuẩn"></div>
                <div class="form-group"><label class="form-label">Kết quả</label><input class="form-control test-value"></div>
                <div class="form-group"><label class="form-label">Đánh giá</label><select class="form-control test-pass"><option value="true">Đạt</option><option value="false">Không đạt</option></select></div>
            </div>
        </div>
        <button class="btn btn-sm btn-outline" onclick="addTestRow()" style="margin-top:8px">+ Thêm chỉ số</button>
    `;
    openModal('Nhập kết quả xét nghiệm', body, `
        <button class="btn btn-outline" onclick="closeModal()">Hủy</button>
        <button class="btn btn-primary" onclick="saveTestResults(${sampleId})">Lưu kết quả</button>
    `);
}

function addTestRow() {
    const container = document.getElementById('testResultsFields');
    const row = document.createElement('div');
    row.className = 'form-row test-row';
    row.innerHTML = `
        <div class="form-group"><label class="form-label">Chỉ số</label><input class="form-control test-name"></div>
        <div class="form-group"><label class="form-label">Kết quả</label><input class="form-control test-value"></div>
        <div class="form-group"><label class="form-label">Đánh giá</label><select class="form-control test-pass"><option value="true">Đạt</option><option value="false">Không đạt</option></select></div>
    `;
    container.appendChild(row);
}

function saveTestResults(sampleId) {
    const rows = document.querySelectorAll('.test-row');
    const results = [];
    rows.forEach(row => {
        const name = row.querySelector('.test-name').value.trim();
        const value = row.querySelector('.test-value').value.trim();
        const pass = row.querySelector('.test-pass').value === 'true';
        if (name && value) results.push({ name, value, pass });
    });
    if (!results.length) return toast('Vui lòng nhập ít nhất 1 kết quả', 'error');

    const samples = DB.get('samples');
    const idx = samples.findIndex(s => s.id === sampleId);
    samples[idx].testResults = results;
    samples[idx].status = 'testing';
    DB.set('samples', samples);
    toast('Lưu kết quả xét nghiệm thành công');
    closeModal();
    renderCollection(document.getElementById('pageContent'));
}

function openTransportForm() {
    const samples = DB.get('samples').filter(s => s.status === 'received' || s.status === 'testing');
    const body = `
        <div class="form-group">
            <label class="form-label">Mẫu cần vận chuyển <span class="required">*</span></label>
            <select class="form-control" id="fTransSample">
                <option value="">-- Chọn mẫu --</option>
                ${samples.map(s => `<option value="${s.id}" data-code="${s.code}">${s.code} — ${s.customerName}</option>`).join('')}
            </select>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Từ</label><input class="form-control" id="fTransFrom" value="BV Nhi TW - Khoa sản"></div>
            <div class="form-group"><label class="form-label">Đến</label><input class="form-control" id="fTransTo" value="Ngân hàng TBG"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Người vận chuyển</label><input class="form-control" id="fTransCarrier"></div>
            <div class="form-group"><label class="form-label">Nhiệt độ hiện tại</label><input class="form-control" id="fTransTemp" value="-18°C"></div>
        </div>
        <div class="form-group"><label class="form-label">Ghi chú</label><textarea class="form-control" id="fTransNotes"></textarea></div>
    `;
    openModal('Tạo vận chuyển mới', body, `
        <button class="btn btn-outline" onclick="closeModal()">Hủy</button>
        <button class="btn btn-primary" onclick="saveTransport()">Tạo</button>
    `);
}

function saveTransport() {
    const sel = document.getElementById('fTransSample');
    if (!sel.value) return toast('Vui lòng chọn mẫu', 'error');
    const transports = DB.get('transports');
    const sampleId = parseInt(sel.value);
    transports.push({
        id: DB.nextId('transports'),
        sampleId,
        sampleCode: sel.options[sel.selectedIndex].dataset.code,
        from: document.getElementById('fTransFrom').value,
        to: document.getElementById('fTransTo').value,
        status: 'in_transit',
        carrier: document.getElementById('fTransCarrier').value,
        startTime: new Date().toISOString(),
        endTime: null,
        tempLog: [document.getElementById('fTransTemp').value],
        notes: document.getElementById('fTransNotes').value,
    });
    DB.set('transports', transports);
    // Update sample status
    const samples = DB.get('samples');
    const idx = samples.findIndex(s => s.id === sampleId);
    if (idx !== -1) { samples[idx].status = 'in_transit'; DB.set('samples', samples); }
    toast('Tạo vận chuyển thành công');
    closeModal();
    renderCollection(document.getElementById('pageContent'));
}

function completeTransport(id) {
    const transports = DB.get('transports');
    const idx = transports.findIndex(t => t.id === id);
    transports[idx].status = 'delivered';
    transports[idx].endTime = new Date().toISOString();
    DB.set('transports', transports);
    // Update sample
    const samples = DB.get('samples');
    const sIdx = samples.findIndex(s => s.id === transports[idx].sampleId);
    if (sIdx !== -1) { samples[sIdx].status = 'received'; DB.set('samples', samples); }
    toast('Vận chuyển hoàn thành');
    renderCollection(document.getElementById('pageContent'));
}

// ===== FR-2.3: TIẾP NHẬN & LƯU MẪU =====
function renderReceiving(el) {
    const samples = DB.get('samples');
    const requests = DB.get('storageRequests');
    const pendingSamples = samples.filter(s => s.status === 'received' || s.status === 'testing');

    el.innerHTML = `
        <div class="tabs">
            <button class="tab active" onclick="switchRecTab('pending',this)">Mẫu chờ tiếp nhận (${pendingSamples.length})</button>
            <button class="tab" onclick="switchRecTab('requests',this)">Phiếu yêu cầu lưu (${requests.length})</button>
        </div>
        <div id="recPending" class="tab-panel active">
            <div class="card">
                <div class="table-wrap"><table class="data-table">
                    <thead><tr><th>Mã mẫu</th><th>Khách hàng</th><th>Loại</th><th>Chất lượng</th><th>Thời gian thu</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                    <tbody>
                        ${pendingSamples.map(s => `<tr>
                            <td><strong>${s.code}</strong></td><td>${s.customerName}</td><td>${s.sampleType}</td>
                            <td><span class="status ${statusClass(s.quality)}">${statusText(s.quality)}</span></td>
                            <td>${formatDateTime(s.collectedAt)}</td>
                            <td><span class="status ${statusClass(s.status)}">${statusText(s.status)}</span></td>
                            <td><button class="btn btn-sm btn-primary" onclick="createStorageRequest(${s.id})">Tạo phiếu lưu</button></td>
                        </tr>`).join('') || '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📥</div><h3>Không có mẫu chờ tiếp nhận</h3></div></td></tr>'}
                    </tbody>
                </table></div>
            </div>
        </div>
        <div id="recRequests" class="tab-panel">
            <div class="card">
                <div class="table-wrap"><table class="data-table">
                    <thead><tr><th>ID</th><th>Mã mẫu</th><th>Người tạo</th><th>Ngày tạo</th><th>Vị trí lưu</th><th>Trạng thái</th><th>Phê duyệt</th><th></th></tr></thead>
                    <tbody>
                        ${requests.map(r => `<tr>
                            <td>#${r.id}</td><td><strong>${r.sampleCode}</strong></td><td>${r.requestedBy}</td>
                            <td>${formatDate(r.requestDate)}</td><td>${r.location}</td>
                            <td><span class="status ${statusClass(r.status)}">${statusText(r.status)}</span></td>
                            <td>
                                <div class="approval-flow">
                                    ${r.approvals.map((a, i) => `
                                        <span class="approval-step ${a.status}">${a.status === 'approved' ? '✅' : a.status === 'rejected' ? '❌' : '⏳'} Cấp ${a.level}</span>
                                        ${i < r.approvals.length - 1 ? '<span class="approval-arrow">→</span>' : ''}
                                    `).join('')}
                                </div>
                            </td>
                            <td>
                                ${r.status.startsWith('pending') ? `<button class="btn btn-sm btn-accent" onclick="approveRequest(${r.id})">Duyệt</button>` : ''}
                                <button class="btn btn-sm btn-outline btn-icon" onclick="viewStorageRequest(${r.id})">👁️</button>
                            </td>
                        </tr>`).join('') || '<tr><td colspan="8"><div class="empty-state"><p>Chưa có phiếu yêu cầu lưu</p></div></td></tr>'}
                    </tbody>
                </table></div>
            </div>
        </div>
    `;
}

function switchRecTab(tab, btn) {
    document.querySelectorAll('#pageContent .tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('recPending').classList.toggle('active', tab === 'pending');
    document.getElementById('recRequests').classList.toggle('active', tab === 'requests');
}

function createStorageRequest(sampleId) {
    const s = DB.get('samples').find(x => x.id === sampleId);
    const cabinets = DB.get('cabinets');
    const body = `
        <p style="margin-bottom:16px">Tạo phiếu yêu cầu lưu cho mẫu <strong>${s.code}</strong> — ${s.customerName}</p>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Tủ lưu trữ</label>
                <select class="form-control" id="fReqCabinet" onchange="updateLocationPreview()">
                    ${cabinets.map(c => `<option value="${c.id}">${c.name} (${c.temperature})</option>`).join('')}
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Ngăn</label><input type="number" class="form-control" id="fReqShelf" value="1" min="1" max="10"></div>
            <div class="form-group"><label class="form-label">Khay</label><input type="number" class="form-control" id="fReqTray" value="1" min="1" max="10"></div>
            <div class="form-group"><label class="form-label">Hộp</label><input type="number" class="form-control" id="fReqBox" value="1" min="1" max="10"></div>
            <div class="form-group"><label class="form-label">Vị trí</label><input type="number" class="form-control" id="fReqPos" value="1" min="1" max="50"></div>
        </div>
        <div class="form-group"><label class="form-label">Ghi chú</label><textarea class="form-control" id="fReqNotes"></textarea></div>
    `;
    openModal('Tạo phiếu yêu cầu lưu', body, `
        <button class="btn btn-outline" onclick="closeModal()">Hủy</button>
        <button class="btn btn-primary" onclick="saveStorageRequest(${sampleId})">Tạo phiếu</button>
    `);
}

function saveStorageRequest(sampleId) {
    const s = DB.get('samples').find(x => x.id === sampleId);
    const cab = document.getElementById('fReqCabinet').value;
    const shelf = document.getElementById('fReqShelf').value;
    const tray = document.getElementById('fReqTray').value;
    const box = document.getElementById('fReqBox').value;
    const pos = document.getElementById('fReqPos').value;
    const location = `${cab}-${shelf}-${tray}-${box}-${pos}`;

    // Check if position is occupied
    const map = DB.get('storageMap');
    if (map[location]) {
        toast('Vị trí này đã có mẫu! Vui lòng chọn vị trí khác.', 'error');
        return;
    }

    const requests = DB.get('storageRequests');
    requests.push({
        id: DB.nextId('storageRequests'),
        sampleId,
        sampleCode: s.code,
        requestedBy: 'Nguyễn Thành',
        requestDate: new Date().toISOString().split('T')[0],
        status: 'pending_level1',
        cabinetId: parseInt(cab),
        location,
        approvals: [
            { level: 1, approver: 'Trưởng phòng XN', status: 'pending', date: null, notes: '' },
            { level: 2, approver: 'Phó giám đốc', status: 'pending', date: null, notes: '' },
            { level: 3, approver: 'Giám đốc', status: 'pending', date: null, notes: '' },
        ],
    });
    DB.set('storageRequests', requests);
    toast('Tạo phiếu yêu cầu lưu thành công');
    closeModal();
    renderReceiving(document.getElementById('pageContent'));
}

function approveRequest(id) {
    const requests = DB.get('storageRequests');
    const req = requests.find(r => r.id === id);
    const pendingIdx = req.approvals.findIndex(a => a.status === 'pending');
    if (pendingIdx === -1) return;

    req.approvals[pendingIdx].status = 'approved';
    req.approvals[pendingIdx].date = new Date().toISOString().split('T')[0];
    req.approvals[pendingIdx].notes = 'Đồng ý';

    const nextPending = req.approvals.findIndex(a => a.status === 'pending');
    if (nextPending === -1) {
        req.status = 'approved';
        // Store sample
        const samples = DB.get('samples');
        const sIdx = samples.findIndex(s => s.id === req.sampleId);
        if (sIdx !== -1) {
            const parts = req.location.split('-').map(Number);
            samples[sIdx].status = 'stored';
            samples[sIdx].location = { cabinet: parts[0], shelf: parts[1], tray: parts[2], box: parts[3], position: parts[4] };
            DB.set('samples', samples);
        }
        const map = DB.get('storageMap');
        map[req.location] = { sampleId: req.sampleId, sampleCode: req.sampleCode, status: 'stored' };
        DB.set('storageMap', map);
        toast('Phiếu đã được duyệt hoàn tất — Mẫu đã lưu kho');
    } else {
        req.status = `pending_level${nextPending + 1}`;
        toast(`Đã duyệt cấp ${pendingIdx + 1} — Chờ duyệt cấp ${nextPending + 1}`);
    }

    DB.set('storageRequests', requests);
    renderReceiving(document.getElementById('pageContent'));
}

function viewStorageRequest(id) {
    const r = DB.get('storageRequests').find(x => x.id === id);
    const body = `
        <div class="detail-grid" style="margin-bottom:20px">
            <div class="detail-field"><div class="field-label">Mã mẫu</div><div class="field-value">${r.sampleCode}</div></div>
            <div class="detail-field"><div class="field-label">Người tạo</div><div class="field-value">${r.requestedBy}</div></div>
            <div class="detail-field"><div class="field-label">Ngày tạo</div><div class="field-value">${formatDate(r.requestDate)}</div></div>
            <div class="detail-field"><div class="field-label">Vị trí lưu</div><div class="field-value">${r.location}</div></div>
            <div class="detail-field"><div class="field-label">Trạng thái</div><div class="field-value"><span class="status ${statusClass(r.status)}">${statusText(r.status)}</span></div></div>
        </div>
        <h4 style="margin-bottom:12px;color:var(--primary)">Luồng phê duyệt</h4>
        <div class="history-timeline">
            ${r.approvals.map(a => `
                <div class="timeline-item">
                    <div class="tl-text"><strong>Cấp ${a.level}</strong> — ${a.approver}</div>
                    <div><span class="status ${statusClass(a.status)}">${statusText(a.status)}</span></div>
                    ${a.date ? `<div class="tl-time">${formatDate(a.date)} — ${a.notes}</div>` : ''}
                </div>
            `).join('')}
        </div>
    `;
    openModal('Chi tiết phiếu yêu cầu lưu #' + r.id, body, '<button class="btn btn-outline" onclick="closeModal()">Đóng</button>');
}

// ===== FR-2.4: XUẤT MẪU =====
function renderExport(el) {
    const exports = DB.get('exports');
    el.innerHTML = `
        <div class="toolbar">
            <div class="filter-group">
                <select id="exportStatusFilter">
                    <option value="">Tất cả</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="exported">Đã xuất</option>
                </select>
            </div>
            <div class="spacer"></div>
            <button class="btn btn-primary" onclick="openExportForm()">+ Tạo phiếu xuất</button>
        </div>
        <div class="card">
            <div class="table-wrap"><table class="data-table">
                <thead><tr><th>ID</th><th>Mã mẫu</th><th>Khách hàng</th><th>Mục đích</th><th>Người yêu cầu</th><th>Ngày yêu cầu</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>
                    ${exports.map(e => `<tr>
                        <td>#${e.id}</td><td><strong>${e.sampleCode}</strong></td><td>${e.customerName}</td>
                        <td>${e.purpose}</td><td>${e.requestedBy}</td><td>${formatDate(e.requestDate)}</td>
                        <td><span class="status ${statusClass(e.status)}">${statusText(e.status)}</span></td>
                        <td>
                            ${e.status === 'pending' ? `
                                <button class="btn btn-sm btn-accent" onclick="approveExport(${e.id})">Duyệt xuất</button>
                                <button class="btn btn-sm btn-danger" onclick="rejectExport(${e.id})">Từ chối</button>
                            ` : ''}
                            ${e.status === 'approved' ? `<button class="btn btn-sm btn-primary" onclick="confirmExport(${e.id})">Xác nhận xuất</button>` : ''}
                        </td>
                    </tr>`).join('') || '<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">📤</div><h3>Chưa có phiếu xuất mẫu</h3><p>Nhấn "Tạo phiếu xuất" để bắt đầu</p></div></td></tr>'}
                </tbody>
            </table></div>
        </div>
    `;
}

function openExportForm() {
    const samples = DB.get('samples').filter(s => s.status === 'stored');
    const body = `
        <div class="form-group">
            <label class="form-label">Chọn mẫu đang lưu <span class="required">*</span></label>
            <select class="form-control" id="fExpSample">
                <option value="">-- Chọn mẫu --</option>
                ${samples.map(s => `<option value="${s.id}" data-code="${s.code}" data-name="${s.customerName}">${s.code} — ${s.customerName} (${s.sampleType})</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Mục đích xuất</label>
            <select class="form-control" id="fExpPurpose">
                <option>Sử dụng điều trị</option>
                <option>Thanh lý</option>
                <option>Hủy mẫu</option>
                <option>Nghiên cứu</option>
            </select>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Người yêu cầu</label><input class="form-control" id="fExpBy" value=""></div>
            <div class="form-group"><label class="form-label">Ngày yêu cầu</label><input type="date" class="form-control" id="fExpDate" value="${new Date().toISOString().split('T')[0]}"></div>
        </div>
        <div class="form-group"><label class="form-label">Ghi chú</label><textarea class="form-control" id="fExpNotes"></textarea></div>
    `;
    openModal('Tạo phiếu yêu cầu xuất mẫu', body, `
        <button class="btn btn-outline" onclick="closeModal()">Hủy</button>
        <button class="btn btn-primary" onclick="saveExport()">Tạo phiếu</button>
    `);
}

function saveExport() {
    const sel = document.getElementById('fExpSample');
    if (!sel.value) return toast('Vui lòng chọn mẫu', 'error');
    const opt = sel.options[sel.selectedIndex];
    const exports = DB.get('exports');
    exports.push({
        id: DB.nextId('exports'),
        sampleId: parseInt(sel.value),
        sampleCode: opt.dataset.code,
        customerName: opt.dataset.name,
        purpose: document.getElementById('fExpPurpose').value,
        requestedBy: document.getElementById('fExpBy').value || 'N/A',
        requestDate: document.getElementById('fExpDate').value,
        status: 'pending',
        notes: document.getElementById('fExpNotes').value,
    });
    DB.set('exports', exports);
    toast('Tạo phiếu xuất thành công');
    closeModal();
    renderExport(document.getElementById('pageContent'));
}

function approveExport(id) {
    const exports = DB.get('exports');
    const idx = exports.findIndex(e => e.id === id);
    exports[idx].status = 'approved';
    DB.set('exports', exports);
    toast('Đã duyệt phiếu xuất');
    renderExport(document.getElementById('pageContent'));
}

function rejectExport(id) {
    const exports = DB.get('exports');
    const idx = exports.findIndex(e => e.id === id);
    exports[idx].status = 'rejected';
    DB.set('exports', exports);
    toast('Đã từ chối phiếu xuất');
    renderExport(document.getElementById('pageContent'));
}

function confirmExport(id) {
    const exports = DB.get('exports');
    const exp = exports.find(e => e.id === id);
    exp.status = 'exported';
    DB.set('exports', exports);

    // Update sample
    const samples = DB.get('samples');
    const sIdx = samples.findIndex(s => s.id === exp.sampleId);
    if (sIdx !== -1) {
        const s = samples[sIdx];
        // Remove from storage map
        if (s.location) {
            const map = DB.get('storageMap');
            const key = `${s.location.cabinet}-${s.location.shelf}-${s.location.tray}-${s.location.box}-${s.location.position}`;
            delete map[key];
            DB.set('storageMap', map);
        }
        s.status = 'exported';
        s.location = null;
        DB.set('samples', samples);
    }
    toast('Xuất mẫu thành công');
    renderExport(document.getElementById('pageContent'));
}

// ===== FR-2.5: QUAN HỆ KHÁCH HÀNG =====
function renderCRM(el) {
    const templates = DB.get('crmTemplates');
    const contracts = DB.get('contracts');
    const expiring = contracts.filter(c => c.status === 'expiring');

    el.innerHTML = `
        <div class="tabs">
            <button class="tab active" onclick="switchCrmTab('reminders',this)">Nhắc gia hạn (${expiring.length})</button>
            <button class="tab" onclick="switchCrmTab('templates',this)">Mẫu thông báo</button>
            <button class="tab" onclick="switchCrmTab('campaigns',this)">Chiến dịch gửi</button>
        </div>

        <div id="crmReminders" class="tab-panel active">
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Hợp đồng cận hạn cần nhắc gia hạn</div>
                    <button class="btn btn-primary btn-sm" onclick="sendBulkReminder()">Gửi nhắc tất cả</button>
                </div>
                <div class="table-wrap"><table class="data-table">
                    <thead><tr><th>Mã HĐ</th><th>Khách hàng</th><th>Email</th><th>SĐT</th><th>Ngày hết hạn</th><th>Gói</th><th>Thao tác</th></tr></thead>
                    <tbody>
                        ${expiring.map(c => `<tr>
                            <td><strong>${c.code}</strong></td><td>${c.customerName}</td><td>${c.email}</td><td>${c.phone}</td>
                            <td>${formatDate(c.endDate)}</td><td>${c.packageType}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="sendReminder(${c.id}, 'email')">📧 Email</button>
                                <button class="btn btn-sm btn-outline" onclick="sendReminder(${c.id}, 'sms')">📱 SMS</button>
                            </td>
                        </tr>`).join('') || '<tr><td colspan="7"><div class="empty-state"><p>Không có hợp đồng cận hạn</p></div></td></tr>'}
                    </tbody>
                </table></div>
            </div>
        </div>

        <div id="crmTemplates" class="tab-panel">
            <div class="toolbar">
                <div class="spacer"></div>
                <button class="btn btn-primary" onclick="openTemplateForm()">+ Thêm mẫu</button>
            </div>
            <div class="card">
                <div class="table-wrap"><table class="data-table">
                    <thead><tr><th>Tên mẫu</th><th>Loại</th><th>Tiêu đề</th><th>Thao tác</th></tr></thead>
                    <tbody>
                        ${templates.map(t => `<tr>
                            <td><strong>${t.name}</strong></td>
                            <td><span class="status ${t.type === 'email' ? 'status-info' : 'status-purple'}">${t.type === 'email' ? 'Email' : 'SMS'}</span></td>
                            <td>${t.subject || '—'}</td>
                            <td>
                                <button class="btn btn-sm btn-outline btn-icon" onclick="openTemplateForm(${t.id})">✏️</button>
                                <button class="btn btn-sm btn-outline btn-icon" onclick="deleteTemplate(${t.id})">🗑️</button>
                                <button class="btn btn-sm btn-outline" onclick="previewTemplate(${t.id})">Xem trước</button>
                            </td>
                        </tr>`).join('')}
                    </tbody>
                </table></div>
            </div>
        </div>

        <div id="crmCampaigns" class="tab-panel">
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Tạo chiến dịch gửi thông báo</div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Mẫu thông báo</label>
                        <select class="form-control" id="campaignTemplate">
                            ${templates.map(t => `<option value="${t.id}">${t.name} (${t.type})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Đối tượng</label>
                        <select class="form-control" id="campaignTarget">
                            <option value="all">Tất cả khách hàng</option>
                            <option value="expiring">Hợp đồng cận hạn</option>
                            <option value="active">Hợp đồng còn hạn</option>
                            <option value="birthday">Sinh nhật hôm nay</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Thời gian gửi</label>
                    <select class="form-control" id="campaignSchedule">
                        <option value="now">Gửi ngay</option>
                        <option value="daily">Hàng ngày</option>
                        <option value="weekly">Hàng tuần</option>
                        <option value="monthly">Hàng tháng</option>
                    </select>
                </div>
                <button class="btn btn-primary" onclick="launchCampaign()">Gửi chiến dịch</button>
            </div>
        </div>
    `;
}

function switchCrmTab(tab, btn) {
    document.querySelectorAll('#pageContent .tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    ['Reminders', 'Templates', 'Campaigns'].forEach(t => {
        document.getElementById('crm' + t).classList.toggle('active', t.toLowerCase() === tab);
    });
}

function sendReminder(contractId, type) {
    const c = DB.get('contracts').find(x => x.id === contractId);
    toast(`Đã gửi ${type === 'email' ? 'Email' : 'SMS'} nhắc gia hạn cho ${c.customerName}`);
}

function sendBulkReminder() {
    const expiring = DB.get('contracts').filter(c => c.status === 'expiring');
    toast(`Đã gửi nhắc gia hạn cho ${expiring.length} khách hàng`);
}

function openTemplateForm(id) {
    const t = id ? DB.get('crmTemplates').find(x => x.id === id) : null;
    const body = `
        <div class="form-group"><label class="form-label">Tên mẫu</label><input class="form-control" id="fTplName" value="${t ? t.name : ''}"></div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Loại</label>
                <select class="form-control" id="fTplType">
                    <option value="email" ${t && t.type === 'email' ? 'selected' : ''}>Email</option>
                    <option value="sms" ${t && t.type === 'sms' ? 'selected' : ''}>SMS</option>
                </select>
            </div>
            <div class="form-group"><label class="form-label">Tiêu đề (Email)</label><input class="form-control" id="fTplSubject" value="${t ? t.subject || '' : ''}"></div>
        </div>
        <div class="form-group"><label class="form-label">Nội dung</label><textarea class="form-control" id="fTplBody" style="min-height:150px">${t ? t.body : ''}</textarea></div>
        <div class="form-hint">Biến: {customerName}, {contractCode}, {endDate}, {sampleCode}</div>
    `;
    openModal(t ? 'Sửa mẫu thông báo' : 'Thêm mẫu thông báo', body, `
        <button class="btn btn-outline" onclick="closeModal()">Hủy</button>
        <button class="btn btn-primary" onclick="saveTemplate(${id || 'null'})">${t ? 'Cập nhật' : 'Tạo'}</button>
    `);
}

function saveTemplate(id) {
    const name = document.getElementById('fTplName').value.trim();
    if (!name) return toast('Vui lòng nhập tên mẫu', 'error');
    const templates = DB.get('crmTemplates');
    const data = {
        name,
        type: document.getElementById('fTplType').value,
        subject: document.getElementById('fTplSubject').value,
        body: document.getElementById('fTplBody').value,
    };
    if (id) {
        const idx = templates.findIndex(t => t.id === id);
        templates[idx] = { ...templates[idx], ...data };
    } else {
        data.id = DB.nextId('crmTemplates');
        templates.push(data);
    }
    DB.set('crmTemplates', templates);
    toast('Lưu mẫu thông báo thành công');
    closeModal();
    renderCRM(document.getElementById('pageContent'));
}

function deleteTemplate(id) {
    if (!confirm('Xóa mẫu thông báo này?')) return;
    DB.set('crmTemplates', DB.get('crmTemplates').filter(t => t.id !== id));
    toast('Đã xóa mẫu thông báo');
    renderCRM(document.getElementById('pageContent'));
}

function previewTemplate(id) {
    const t = DB.get('crmTemplates').find(x => x.id === id);
    const preview = t.body.replace('{customerName}', 'Nguyễn Văn An').replace('{contractCode}', 'HD-2026-0001').replace('{endDate}', '01/01/2027').replace('{sampleCode}', 'M-00001');
    openModal('Xem trước: ' + t.name, `
        ${t.subject ? `<div style="margin-bottom:12px"><strong>Tiêu đề:</strong> ${t.subject}</div>` : ''}
        <div style="background:var(--bg);padding:16px;border-radius:8px;white-space:pre-wrap;font-size:0.9rem">${preview}</div>
    `, '<button class="btn btn-outline" onclick="closeModal()">Đóng</button>');
}

function launchCampaign() {
    const target = document.getElementById('campaignTarget').value;
    const labels = { all: 'tất cả', expiring: 'cận hạn', active: 'còn hạn', birthday: 'sinh nhật' };
    toast(`Đã khởi tạo chiến dịch gửi cho nhóm: ${labels[target]}`);
}

// ===== FR-2.6: QUẢN LÝ TỦ LƯU MẪU =====
function renderStorage(el) {
    const cabinets = DB.get('cabinets');
    const map = DB.get('storageMap');
    const samples = DB.get('samples');
    const contracts = DB.get('contracts');

    el.innerHTML = `
        <div class="tabs">
            <button class="tab active" onclick="switchStorageTab('visual',this)">Sơ đồ 2D</button>
            <button class="tab" onclick="switchStorageTab('list',this)">Danh sách tủ</button>
            <button class="tab" onclick="switchStorageTab('history',this)">Lịch sử</button>
        </div>

        <div id="storageVisual" class="tab-panel active">
            <div class="storage-visual">
                ${cabinets.map(cab => {
                    const totalPositions = cab.shelves * cab.trays * cab.boxes * cab.positions;
                    const usedPositions = Object.keys(map).filter(k => k.startsWith(cab.id + '-')).length;
                    const pct = totalPositions > 0 ? (usedPositions / totalPositions * 100).toFixed(1) : 0;
                    return `
                    <div class="cabinet-box">
                        <div class="cabinet-title">
                            🗄️ ${cab.name} <span style="font-size:0.8rem;color:var(--text-secondary)">${cab.temperature}</span>
                            <div class="spacer"></div>
                            <span class="status ${pct > 80 ? 'status-danger' : pct > 50 ? 'status-warning' : 'status-active'}">${pct}% (${usedPositions}/${totalPositions})</span>
                        </div>
                        ${Array.from({length: cab.shelves}, (_, shelfIdx) => `
                            <div style="margin-bottom:12px">
                                <div style="font-size:0.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:4px">Ngăn ${shelfIdx + 1}</div>
                                <div class="shelf-grid">
                                    ${Array.from({length: cab.trays * cab.boxes}, (_, cellIdx) => {
                                        const tray = Math.floor(cellIdx / cab.boxes) + 1;
                                        const box = (cellIdx % cab.boxes) + 1;
                                        // For simplicity, show first position of each box
                                        const key = `${cab.id}-${shelfIdx + 1}-${tray}-${box}-1`;
                                        const cell = map[key];
                                        let cellClass = 'cell-empty';
                                        let cellContent = '';
                                        if (cell) {
                                            // Check if contract is expiring
                                            const sample = samples.find(s => s.id === cell.sampleId);
                                            if (sample) {
                                                const contract = contracts.find(c => c.id === sample.contractId);
                                                if (contract && contract.status === 'expired') cellClass = 'cell-expired';
                                                else if (contract && contract.status === 'expiring') cellClass = 'cell-expiring';
                                                else cellClass = 'cell-occupied';
                                            } else {
                                                cellClass = 'cell-occupied';
                                            }
                                            cellContent = cell.sampleCode ? cell.sampleCode.split('-').pop() : '';
                                        }
                                        return `<div class="cell ${cellClass}" title="${cell ? cell.sampleCode + ' — ' + (cell.customerName || '') : 'Trống: K' + tray + '/H' + box}" onclick="cellClick('${key}')">${cellContent}</div>`;
                                    }).join('')}
                                </div>
                            </div>
                        `).join('')}
                        <div class="fill-bar"><div class="fill-bar-inner ${pct > 80 ? 'high' : pct > 50 ? 'medium' : 'low'}" style="width:${pct}%"></div></div>
                        <div class="fill-text">${pct > 80 ? '⚠️ Cảnh báo: Tủ sắp đầy!' : `${usedPositions}/${totalPositions} vị trí đã sử dụng`}</div>
                    </div>`;
                }).join('')}
            </div>
        </div>

        <div id="storageList" class="tab-panel">
            <div class="toolbar">
                <div class="spacer"></div>
                <button class="btn btn-primary" onclick="openCabinetForm()">+ Thêm tủ</button>
            </div>
            <div class="card">
                <div class="table-wrap"><table class="data-table">
                    <thead><tr><th>Tên tủ</th><th>Nhiệt độ</th><th>Số ngăn</th><th>Số khay/ngăn</th><th>Số hộp/khay</th><th>Vị trí/hộp</th><th>Tổng</th><th>Đã dùng</th><th>%</th><th></th></tr></thead>
                    <tbody>
                        ${cabinets.map(c => {
                            const total = c.shelves * c.trays * c.boxes * c.positions;
                            const used = Object.keys(map).filter(k => k.startsWith(c.id + '-')).length;
                            const pct = total > 0 ? (used / total * 100).toFixed(0) : 0;
                            return `<tr>
                                <td><strong>${c.name}</strong></td><td>${c.temperature}</td>
                                <td>${c.shelves}</td><td>${c.trays}</td><td>${c.boxes}</td><td>${c.positions}</td>
                                <td>${total}</td><td>${used}</td>
                                <td><span class="status ${pct > 80 ? 'status-danger' : pct > 50 ? 'status-warning' : 'status-active'}">${pct}%</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline btn-icon" onclick="openCabinetForm(${c.id})">✏️</button>
                                    <button class="btn btn-sm btn-outline btn-icon" onclick="deleteCabinet(${c.id})">🗑️</button>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table></div>
            </div>
        </div>

        <div id="storageHistory" class="tab-panel">
            <div class="card">
                <div class="card-header"><div class="card-title">Lịch sử thay đổi trạng thái mẫu</div></div>
                <div class="history-timeline">
                    ${samples.slice().reverse().map(s => `
                        <div class="timeline-item">
                            <div class="tl-text"><strong>${s.code}</strong> — ${s.customerName}</div>
                            <div><span class="status ${statusClass(s.status)}">${statusText(s.status)}</span>
                            ${s.location ? ` | Tủ ${s.location.cabinet}, Ngăn ${s.location.shelf}` : ''}</div>
                            <div class="tl-time">${formatDateTime(s.createdAt)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function switchStorageTab(tab, btn) {
    document.querySelectorAll('#pageContent .tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    ['Visual', 'List', 'History'].forEach(t => {
        document.getElementById('storage' + t).classList.toggle('active', t.toLowerCase() === tab);
    });
}

function cellClick(key) {
    const map = DB.get('storageMap');
    const cell = map[key];
    if (cell) {
        const s = DB.get('samples').find(x => x.id === cell.sampleId);
        if (s) viewSample(s.id);
    } else {
        const parts = key.split('-');
        toast(`Vị trí trống: Tủ ${parts[0]}, Ngăn ${parts[1]}, Khay ${parts[2]}, Hộp ${parts[3]}, VT ${parts[4]}`, 'info');
    }
}

function openCabinetForm(id) {
    const c = id ? DB.get('cabinets').find(x => x.id === id) : null;
    const body = `
        <div class="form-group"><label class="form-label">Tên tủ</label><input class="form-control" id="fCabName" value="${c ? c.name : ''}"></div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Nhiệt độ</label><input class="form-control" id="fCabTemp" value="${c ? c.temperature : '-196°C'}"></div>
            <div class="form-group"><label class="form-label">Số ngăn</label><input type="number" class="form-control" id="fCabShelves" value="${c ? c.shelves : 5}" min="1"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Số khay/ngăn</label><input type="number" class="form-control" id="fCabTrays" value="${c ? c.trays : 4}" min="1"></div>
            <div class="form-group"><label class="form-label">Số hộp/khay</label><input type="number" class="form-control" id="fCabBoxes" value="${c ? c.boxes : 6}" min="1"></div>
            <div class="form-group"><label class="form-label">Vị trí/hộp</label><input type="number" class="form-control" id="fCabPos" value="${c ? c.positions : 25}" min="1"></div>
        </div>
    `;
    openModal(c ? 'Sửa thông tin tủ' : 'Thêm tủ mới', body, `
        <button class="btn btn-outline" onclick="closeModal()">Hủy</button>
        <button class="btn btn-primary" onclick="saveCabinet(${id || 'null'})">${c ? 'Cập nhật' : 'Thêm'}</button>
    `);
}

function saveCabinet(id) {
    const name = document.getElementById('fCabName').value.trim();
    if (!name) return toast('Vui lòng nhập tên tủ', 'error');
    const cabinets = DB.get('cabinets');
    const data = {
        name,
        temperature: document.getElementById('fCabTemp').value,
        shelves: parseInt(document.getElementById('fCabShelves').value),
        trays: parseInt(document.getElementById('fCabTrays').value),
        boxes: parseInt(document.getElementById('fCabBoxes').value),
        positions: parseInt(document.getElementById('fCabPos').value),
    };
    if (id) {
        const idx = cabinets.findIndex(c => c.id === id);
        cabinets[idx] = { ...cabinets[idx], ...data };
    } else {
        data.id = DB.nextId('cabinets');
        cabinets.push(data);
    }
    DB.set('cabinets', cabinets);
    toast('Lưu thông tin tủ thành công');
    closeModal();
    renderStorage(document.getElementById('pageContent'));
}

function deleteCabinet(id) {
    if (!confirm('Xóa tủ lưu mẫu này?')) return;
    DB.set('cabinets', DB.get('cabinets').filter(c => c.id !== id));
    toast('Đã xóa tủ');
    renderStorage(document.getElementById('pageContent'));
}

// ===== NOTIFICATIONS =====
function renderNotifications() {
    const notifs = DB.get('notifications');
    const list = document.getElementById('notifList');
    const badge = document.getElementById('notifBadge');
    const unread = notifs.filter(n => !n.read).length;
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'flex' : 'none';
    if (list) {
        list.innerHTML = notifs.map(n => `
            <div class="notif-item ${n.read ? '' : 'unread'}" onclick="markNotifRead(${n.id})">
                <div class="notif-title">${n.title}</div>
                <div class="notif-text">${n.text}</div>
                <div class="notif-time">${formatDateTime(n.time)}</div>
            </div>
        `).join('') || '<div style="padding:24px;text-align:center;color:var(--text-secondary)">Không có thông báo</div>';
    }
}

function markNotifRead(id) {
    const notifs = DB.get('notifications');
    const n = notifs.find(x => x.id === id);
    if (n) n.read = true;
    DB.set('notifications', notifs);
    renderNotifications();
}

// ===== GLOBAL SEARCH =====
function setupGlobalSearch() {
    const input = document.getElementById('globalSearch');
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            const q = input.value.trim().toLowerCase();
            if (!q) return;
            // Search across contracts and samples
            const contracts = DB.get('contracts').filter(c => c.code.toLowerCase().includes(q) || c.customerName.toLowerCase().includes(q));
            const samples = DB.get('samples').filter(s => s.code.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q));

            let html = '<h4 style="margin-bottom:12px">Kết quả tìm kiếm</h4>';
            if (contracts.length) {
                html += `<h5 style="color:var(--primary);margin:8px 0">Hợp đồng (${contracts.length})</h5>`;
                html += contracts.map(c => `<div class="notif-item" onclick="closeModal();viewContract(${c.id})" style="cursor:pointer"><div class="notif-title">${c.code}</div><div class="notif-text">${c.customerName} — ${statusText(c.status)}</div></div>`).join('');
            }
            if (samples.length) {
                html += `<h5 style="color:var(--primary);margin:8px 0">Mẫu (${samples.length})</h5>`;
                html += samples.map(s => `<div class="notif-item" onclick="closeModal();viewSample(${s.id})" style="cursor:pointer"><div class="notif-title">${s.code}</div><div class="notif-text">${s.customerName} — ${statusText(s.status)}</div></div>`).join('');
            }
            if (!contracts.length && !samples.length) {
                html += '<div class="empty-state"><p>Không tìm thấy kết quả</p></div>';
            }
            openModal('Tìm kiếm: "' + input.value + '"', html, '<button class="btn btn-outline" onclick="closeModal()">Đóng</button>');
        }
    });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    initSampleData();

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            navigate(item.dataset.page);
        });
    });

    // Sidebar toggle (mobile)
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
    document.getElementById('sidebarClose').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
    });

    // Modal close
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', e => {
        if (e.target === document.getElementById('modalOverlay')) closeModal();
    });

    // Notification panel
    document.getElementById('notifBtn').addEventListener('click', () => {
        document.getElementById('notifPanel').classList.toggle('open');
        renderNotifications();
    });
    document.getElementById('notifClose').addEventListener('click', () => {
        document.getElementById('notifPanel').classList.remove('open');
    });

    // Global search
    setupGlobalSearch();

    // Render notifications
    renderNotifications();

    // Render default page
    navigate('dashboard');
});
