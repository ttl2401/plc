import { NextResponse } from 'next/server';

export function GET() {
  return new NextResponse(`
  <!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Industrial Monitoring Dashboard</title>
  <link rel="stylesheet" href="/styles.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="dashboard">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="logo-text">ZTECHIUS</span>
      </div>
      
      <nav class="nav">
        <div class="nav-section">
          <h3>CHỌN LINE</h3>
          <div class="nav-item active">
            <span class="line-label">LINE</span>
            <span class="line-number">01</span>
          </div>
          <div class="nav-item">
            <span class="line-label">LINE</span>
            <span class="line-number">02</span>
          </div>
          <div class="nav-item">
            <span class="line-label">LINE</span>
            <span class="line-number">03</span>
          </div>
          <div class="nav-item">
            <span class="line-label">LINE</span>
            <span class="line-number">04</span>
          </div>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="header">
        <h1>Thông Số LINE 1</h1>
        <div class="alerts">
          <div class="alert">
            <div class="alert-icon">⚠</div>
            <div class="alert-content">
              <span class="alert-label">Dòng điện bơm Boiling Degreasing</span>
              <span class="alert-value">là <strong>39.6</strong> đang quá thấp</span>
            </div>
          </div>
          <div class="alert">
            <div class="alert-icon">⚠</div>
            <div class="alert-content">
              <span class="alert-label">Nhiệt độ bơm Boiling Degreasing</span>
              <span class="alert-value">là <strong>39.6</strong> đang quá thấp</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Temperature Section -->
        <section class="section temperature-section">
          <div class="section-header">
            <div class="section-icon">🌡️</div>
            <h2>NHIỆT ĐỘ</h2>
          </div>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-header">Washing</div>
              <div class="metric-value normal">49.6</div>
              <div class="metric-target">
                <span>Cài đặt</span>
                <span class="target-value">50</span>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-header">Boiling degreasing</div>
              <div class="metric-value low">39.6</div>
              <div class="metric-status">● Thấp</div>
              <div class="metric-target">
                <span>Cài đặt</span>
                <span class="target-value">50</span>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-header">Electro degreasing 1</div>
              <div class="metric-value high">52.6</div>
              <div class="metric-status">● Cao</div>
              <div class="metric-target">
                <span>Cài đặt</span>
                <span class="target-value">50</span>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-header">Electro degreasing 2</div>
              <div class="metric-value normal">49.6</div>
              <div class="metric-target">
                <span>Cài đặt</span>
                <span class="target-value">50</span>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-header">Pre-nickel plating</div>
              <div class="metric-value normal">49.6</div>
              <div class="metric-target">
                <span>Cài đặt</span>
                <span class="target-value">50</span>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-header">Nickel plating 1</div>
              <div class="metric-value low">39.6</div>
              <div class="metric-status">● Thấp</div>
              <div class="metric-target">
                <span>Cài đặt</span>
                <span class="target-value">50</span>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-header">Nickel plating 2</div>
              <div class="metric-value high">52.6</div>
              <div class="metric-status">● Cao</div>
              <div class="metric-target">
                <span>Cài đặt</span>
                <span class="target-value">50</span>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-header">Nickel plating 3</div>
              <div class="metric-value normal">49.6</div>
              <div class="metric-target">
                <span>Cài đặt</span>
                <span class="target-value">50</span>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-header">Ultrasonic hot rinse</div>
              <div class="metric-value normal">49.6</div>
              <div class="metric-target">
                <span>Cài đặt</span>
                <span class="target-value">50</span>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-header">Hot Rinse</div>
              <div class="metric-value low">39.6</div>
              <div class="metric-status">● Thấp</div>
              <div class="metric-target">
                <span>Cài đặt</span>
                <span class="target-value">50</span>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-header">Dryer 1</div>
              <div class="metric-value high">52.6</div>
              <div class="metric-status">● Cao</div>
              <div class="metric-target">
                <span>Cài đặt</span>
                <span class="target-value">50</span>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-header">Dryer 2</div>
              <div class="metric-value normal">49.6</div>
              <div class="metric-target">
                <span>Cài đặt</span>
                <span class="target-value">50</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Current Section -->
        <section class="section current-section">
          <div class="section-header">
            <div class="section-icon">⚡</div>
            <h2>Dòng Điện</h2>
          </div>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-header">Electro degreasing 1</div>
              <div class="metric-value normal">49.6</div>
              <div class="metric-target">
                <span>Cài đặt</span>
                <span class="target-value">50</span>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-header">Electro degreasing 2</div>
              <div class="metric-value low">39.6</div>
              <div class="metric-status">● Thấp</div>
              <div class="metric-target">
                <span>Cài đặt</span>
                <span class="target-value">50</span>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-header">Pre-nickel plating</div>
              <div class="metric-value normal">49.6</div>
              <div class="metric-target">
                <span>Cài đặt</span>
                <span class="target-value">50</span>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-header">Nickel plating 1</div>
              <div class="metric-value low">39.6</div>
              <div class="metric-status">● Thấp</div>
              <div class="metric-target">
                <span>Cài đặt</span>
                <span class="target-value">50</span>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-header">Nickel plating 2</div>
              <div class="metric-value normal">49.6</div>
              <div class="metric-target">
                <span>Cài đặt</span>
                <span class="target-value">50</span>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-header">Nickel plating 3</div>
              <div class="metric-value normal">49.6</div>
              <div class="metric-target">
                <span>Cài đặt</span>
                <span class="target-value">50</span>
              </div>
            </div>
          </div>
          
          <!-- Status Alerts -->
          <div class="status-alerts">
            <div class="status-alert">
              <div class="alert-icon">⚠</div>
              <div class="alert-content">
                <span class="alert-label">Vệ sinh máy lọc</span>
                <span class="alert-time">23:59:30</span>
              </div>
            </div>
            <div class="status-alert">
              <div class="alert-icon">⚠</div>
              <div class="alert-content">
                <span class="alert-label">Vệ sinh máy bơm</span>
                <span class="alert-time">23:59:30</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>

  <script src="/script.js"></script>
</body>
</html>


    `, { headers: { 'Content-Type': 'text/html' } });
}
