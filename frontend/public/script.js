// Line selector functionality
document.addEventListener('DOMContentLoaded', function() {
  const lineItems = document.querySelectorAll('.line-item');
  const headerTitle = document.querySelector('.header h1');
  
  lineItems.forEach((item, index) => {
    item.addEventListener('click', function() {
      // Remove active class from all items
      lineItems.forEach(li => li.classList.remove('active'));
      
      // Add active class to clicked item
      this.classList.add('active');
      
      // Update header title
      const lineNumber = String(index + 1).padStart(2, '0');
      headerTitle.textContent = `Thông Số LINE ${lineNumber}`;
      
      // Simulate data update
      updateMetricValues();
    });
  });
  
  // Simulate real-time data updates
  setInterval(updateMetricValues, 5000);
});

function updateMetricValues() {
  const metricValues = document.querySelectorAll('.metric-value');
  
  metricValues.forEach(value => {
    // Generate random value between 35-55
    const randomValue = (Math.random() * 20 + 35).toFixed(1);
    const numValue = parseFloat(randomValue);
    
    // Update value
    value.textContent = randomValue;
    
    // Update status based on value
    const statusElement = value.nextElementSibling;
    
    // Remove existing classes
    value.classList.remove('normal', 'low', 'high');
    
    if (numValue < 45) {
      value.classList.add('low');
      if (statusElement && statusElement.classList.contains('metric-status')) {
        statusElement.textContent = '● Thấp';
        statusElement.style.color = '#dc2626';
      }
    } else if (numValue > 52) {
      value.classList.add('high');
      if (statusElement && statusElement.classList.contains('metric-status')) {
        statusElement.textContent = '● Cao';
        statusElement.style.color = '#dc2626';
      }
    } else {
      value.classList.add('normal');
      if (statusElement && statusElement.classList.contains('metric-status')) {
        statusElement.textContent = '';
      }
    }
  });
  
  // Update alert values
  const alertNumbers = document.querySelectorAll('.alert-number');
  alertNumbers.forEach(alert => {
    const randomValue = (Math.random() * 10 + 35).toFixed(1);
    alert.textContent = randomValue;
  });
  
  // Update system alert times
  const alertTimes = document.querySelectorAll('.alert-time');
  const now = new Date();
  const timeString = now.toLocaleTimeString('vi-VN', { hour12: false });
  
  alertTimes.forEach(time => {
    time.textContent = timeString;
  });
}

// Add hover effects for metric cards
document.addEventListener('DOMContentLoaded', function() {
  const metricCards = document.querySelectorAll('.metric-card');
  
  metricCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      this.style.transition = 'all 0.3s ease';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = 'none';
    });
  });
});

// Simulate connection status
function updateConnectionStatus() {
  const isConnected = Math.random() > 0.1; // 90% chance of being connected
  
  if (!isConnected) {
    showConnectionAlert();
  }
}

function showConnectionAlert() {
  const alert = document.createElement('div');
  alert.className = 'connection-alert';
  alert.innerHTML = `
    <div class="alert-icon">⚠️</div>
    <div class="alert-content">
      <div class="alert-title">Mất kết nối với hệ thống</div>
      <div class="alert-value">Đang thử kết nối lại...</div>
    </div>
  `;
  
  alert.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(alert);
  
  setTimeout(() => {
    alert.remove();
  }, 3000);
}

// Add CSS animation for alerts
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

// Check connection status periodically
setInterval(updateConnectionStatus, 30000);
