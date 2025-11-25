import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaChartLine, FaUserMd, FaLock } from 'react-icons/fa';
import '../styles/LandingPage.css';

// Cast icons to ComponentType to fix TS2786
const FaShieldAltIcon = FaShieldAlt as unknown as React.ComponentType<any>;
const FaChartLineIcon = FaChartLine as unknown as React.ComponentType<any>;
const FaUserMdIcon = FaUserMd as unknown as React.ComponentType<any>;
const FaLockIcon = FaLock as unknown as React.ComponentType<any>;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.fade-in-section');
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.85;
        if (isVisible) {
          section.classList.add('is-visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container-landing">
          <div className="header-content">
            <div className="logo-section">
              <img src="/logo192.png" alt="Logo" className="header-logo" />
              <span className="logo-text">Quản Lý Tủ Thuốc</span>
            </div>
            <button 
              className="login-btn"
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container-landing">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Hệ thống quản lý <span className="highlight">tủ thuốc</span> – <span className="highlight">chính xác</span> – <span className="highlight">tiện lợi</span>
              </h1>
              <p className="hero-description">
                Giải pháp toàn diện giúp quản lý thuốc, theo dõi bệnh nhân và tối ưu hóa quy trình làm việc tại hiệu thuốc của bạn.
              </p>
              <button className="cta-button">
                Khám phá ngay
              </button>
            </div>
            <div className="hero-image">
              <div className="dashboard-preview">
                <div className="preview-card">
                  <div className="card-header"></div>
                  <div className="card-body">
                    <div className="chart-placeholder"></div>
                    <div className="stats-placeholder">
                      <div className="stat-item"></div>
                      <div className="stat-item"></div>
                      <div className="stat-item"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="intro-section fade-in-section">
        <div className="container-landing">
          <div className="intro-content">
            <div className="intro-image">
              <div className="pharmacy-illustration">
                <FaUserMdIcon className="illustration-icon" />
              </div>
            </div>
            <div className="intro-text">
              <h2 className="section-title">Quản lý tủ thuốc hiện đại và hiệu quả</h2>
              <p className="section-description">
                Hệ thống được thiết kế đặc biệt cho các hiệu thuốc, phòng khám và cơ sở y tế,
                giúp bạn quản lý kho thuốc một cách khoa học, theo dõi hạn sử dụng, 
                quản lý thông tin bệnh nhân và tạo báo cáo thống kê chi tiết. 
                Với giao diện trực quan và dễ sử dụng, mọi thao tác đều được đơn giản hóa 
                để bạn có thể tập trung vào việc chăm sóc sức khỏe khách hàng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Visualization */}
      <section className="dashboard-section fade-in-section">
        <div className="container-landing">
          <h2 className="section-title text-center">Giao diện trực quan và dễ sử dụng</h2>
          <p className="section-subtitle text-center">
            Quản lý thuốc, theo dõi bệnh nhân và thống kê dữ liệu một cách đơn giản và hiệu quả
          </p>
          <div className="dashboard-mockup">
            <div className="mockup-screen">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="mockup-content">
                <div className="mockup-sidebar"></div>
                <div className="mockup-main">
                  <div className="mockup-cards">
                    <div className="mockup-card"></div>
                    <div className="mockup-card"></div>
                    <div className="mockup-card"></div>
                  </div>
                  <div className="mockup-chart"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section fade-in-section">
        <div className="container-landing">
          <h2 className="section-title text-center">Tại sao chọn chúng tôi?</h2>
          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon">
                <FaChartLineIcon />
              </div>
              <h3 className="value-title">Chính xác</h3>
              <p className="value-description">Theo dõi tồn kho và hạn sử dụng chính xác</p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <FaLockIcon />
              </div>
              <h3 className="value-title">Bảo mật</h3>
              <p className="value-description">Bảo vệ thông tin bệnh nhân tuyệt đối</p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <FaShieldAltIcon />
              </div>
              <h3 className="value-title">Tối ưu</h3>
              <p className="value-description">Tự động hóa quy trình làm việc</p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <FaUserMdIcon />
              </div>
              <h3 className="value-title">Dễ sử dụng</h3>
              <p className="value-description">Giao diện đơn giản, dễ tiếp cận</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section fade-in-section">
        <div className="container-landing">
          <h2 className="section-title text-center">Tính năng nổi bật</h2>
          <p className="section-subtitle text-center">
            Các công cụ mạnh mẽ giúp bạn quản lý hiệu thuốc hiệu quả hơn
          </p>
          
          <div className="features-list">
            <div className="feature-row">
              <div className="feature-content">
                <h3 className="feature-title">Quản lý kho thuốc thông minh</h3>
                <p className="feature-description">
                  Theo dõi số lượng tồn kho, hạn sử dụng của từng loại thuốc. 
                  Cảnh báo tự động khi thuốc sắp hết hoặc gần hết hạn. 
                  Quản lý nhập xuất kho một cách chính xác và minh bạch.
                </p>
                <ul className="feature-list">
                  <li>Cảnh báo thuốc sắp hết hạn</li>
                  <li>Theo dõi tồn kho realtime</li>
                  <li>Quản lý lô hàng chi tiết</li>
                  <li>Báo cáo xuất nhập kho</li>
                </ul>
              </div>
              <div className="feature-visual">
                <div className="visual-placeholder feature-visual-1"></div>
              </div>
            </div>

            <div className="feature-row feature-row-reverse">
              <div className="feature-content">
                <h3 className="feature-title">Quản lý thông tin bệnh nhân</h3>
                <p className="feature-description">
                  Lưu trữ hồ sơ bệnh nhân an toàn và bảo mật. 
                  Theo dõi lịch sử mua thuốc, đơn thuốc và ghi chú quan trọng. 
                  Tìm kiếm nhanh chóng thông tin khi cần thiết.
                </p>
                <ul className="feature-list">
                  <li>Hồ sơ bệnh nhân điện tử</li>
                  <li>Lịch sử mua thuốc chi tiết</li>
                  <li>Quản lý đơn thuốc</li>
                  <li>Bảo mật thông tin cao</li>
                </ul>
              </div>
              <div className="feature-visual">
                <div className="visual-placeholder feature-visual-2"></div>
              </div>
            </div>

            <div className="feature-row">
              <div className="feature-content">
                <h3 className="feature-title">Thống kê và báo cáo</h3>
                <p className="feature-description">
                  Phân tích dữ liệu kinh doanh với biểu đồ trực quan. 
                  Theo dõi doanh thu, lợi nhuận theo ngày, tháng, năm. 
                  Báo cáo chi tiết giúp đưa ra quyết định kinh doanh đúng đắn.
                </p>
                <ul className="feature-list">
                  <li>Biểu đồ doanh thu trực quan</li>
                  <li>Báo cáo thuốc bán chạy</li>
                  <li>Phân tích xu hướng</li>
                  <li>Xuất báo cáo Excel/PDF</li>
                </ul>
              </div>
              <div className="feature-visual">
                <div className="visual-placeholder feature-visual-3"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section fade-in-section">
        <div className="container-landing">
          <h2 className="section-title text-center">Cách thức hoạt động</h2>
          <p className="section-subtitle text-center">
            Chỉ với 3 bước đơn giản để bắt đầu
          </p>
          
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <h3 className="step-title">Đăng ký tài khoản</h3>
              <p className="step-description">
                Tạo tài khoản miễn phí và thiết lập thông tin hiệu thuốc của bạn
              </p>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step-item">
              <div className="step-number">2</div>
              <h3 className="step-title">Nhập dữ liệu</h3>
              <p className="step-description">
                Thêm thông tin thuốc, bệnh nhân và cấu hình hệ thống theo nhu cầu
              </p>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step-item">
              <div className="step-number">3</div>
              <h3 className="step-title">Bắt đầu sử dụng</h3>
              <p className="step-description">
                Quản lý hiệu thuốc của bạn một cách dễ dàng và chuyên nghiệp
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section fade-in-section">
        <div className="container-landing">
          <h2 className="section-title text-center">Khách hàng nói gì về chúng tôi</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p className="testimonial-text">
                  "Hệ thống rất dễ sử dụng, giúp tôi quản lý tủ thuốc hiệu quả hơn rất nhiều. 
                  Đặc biệt là tính năng cảnh báo thuốc hết hạn rất hữu ích!"
                </p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">NV</div>
                <div className="author-info">
                  <h4 className="author-name">Nguyễn Văn A</h4>
                  <p className="author-role">Chủ hiệu thuốc ABC</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p className="testimonial-text">
                  "Tính năng thống kê giúp tôi nắm rõ tình hình kinh doanh. 
                  Giao diện đẹp, dễ nhìn và rất chuyên nghiệp."
                </p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">TM</div>
                <div className="author-info">
                  <h4 className="author-name">Trần Minh B</h4>
                  <p className="author-role">Quản lý phòng khám XYZ</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p className="testimonial-text">
                  "Hỗ trợ tốt, hệ thống ổn định. Quản lý bệnh nhân và thuốc 
                  trở nên đơn giản hơn rất nhiều so với trước đây."
                </p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">LP</div>
                <div className="author-info">
                  <h4 className="author-name">Lê Phương C</h4>
                  <p className="author-role">Dược sĩ tại Hiệu thuốc 123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section fade-in-section">
        <div className="container-landing">
          <div className="cta-content">
            <h2 className="cta-title">Sẵn sàng bắt đầu?</h2>
            <p className="cta-description">
              Hãy trải nghiệm hệ thống quản lý tủ thuốc hiện đại ngay hôm nay
            </p>
            <div className="cta-buttons">
              <button className="cta-button-primary" onClick={() => navigate('/register')}>
                Đăng ký miễn phí
              </button>
              <button className="cta-button-secondary" onClick={() => navigate('/login')}>
                Đăng nhập ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container-landing">
          <div className="footer-content">
            <div className="footer-column">
              <div className="footer-logo">
                <img src="/logo192.png" alt="Logo" />
                <span>Quản Lý Tủ Thuốc</span>
              </div>
              <p className="footer-tagline">
                Giải pháp quản lý tủ thuốc chuyên nghiệp
              </p>
            </div>
            <div className="footer-column">
              <h4>Liên hệ</h4>
              <ul>
                <li>Email: support@quanlytuthuoc.vn</li>
                <li>Hotline: 1900 1234</li>
                <li>Địa chỉ: TP. Hà Nội, Việt Nam</li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Thông tin</h4>
              <ul>
                <li><a href="#privacy">Chính sách bảo mật</a></li>
                <li><a href="#terms">Điều khoản sử dụng</a></li>
                <li><a href="#support">Hỗ trợ khách hàng</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Quản Lý Tủ Thuốc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
