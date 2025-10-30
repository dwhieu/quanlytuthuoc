import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Dashboard: React.FC = () => {
  const { fullName, username } = useAuth();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    const storedFullName = localStorage.getItem('fullName');
    if (storedFullName) {
      // Re-render with stored full name
      return;
    }
    // Try to fetch user info if we have username but no fullName
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/auth/user/${username}`);
        if (response.ok) {
          const userData = await response.json();
          if (userData.fullName) {
            localStorage.setItem('fullName', userData.fullName);
            window.location.reload(); // Force refresh to update display
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
    
    if (username && !fullName) {
      fetchUserInfo();
    }
  }, [username, fullName]);

  // Get the last word (name) from the full name
  const getLastName = (name: string | null | undefined): string => {
    if (!name) return 'Người dùng';
    // Remove any trailing spaces and split by spaces
    const names = name.trim().split(' ');
    // Get the last word (last name)
    return names[names.length - 1];
  };

  const handleViewPatients = () => {
    navigate('/patients');
  };

  const handleViewDrugs = () => {
    navigate('/drugs');
  };
  
  return (
    <div className="p-4">
      {/* Welcome Message */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mb-4"
      >
        <Card className="bg-primary text-white p-4">
          <h2 className="mb-2">Xin chào {getLastName(fullName)}</h2>
          <h4>Mừng quay trở lại!</h4>
        </Card>
      </motion.div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-sm h-100">
              <Card.Body className="d-flex flex-column">
                <Card.Title>Số lượng bệnh nhân</Card.Title>
                <div className="text-center my-3">
                  <h2 className="display-4">50</h2>
                </div>
                <div className="mt-auto text-end">
                  <Card.Link 
                    onClick={handleViewPatients} 
                    style={{ cursor: 'pointer' }} 
                    className="text-primary"
                  >
                    Xem chi tiết
                  </Card.Link>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        <Col md={4}>
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-sm h-100">
              <Card.Body className="d-flex flex-column">
                <Card.Title>Tổng số lượng thuốc trong kho</Card.Title>
                <div className="text-center my-3">
                  <h2 className="display-4">5000</h2>
                </div>
                <div className="mt-auto text-end">
                  <Card.Link 
                    onClick={handleViewDrugs} 
                    style={{ cursor: 'pointer' }} 
                    className="text-primary"
                  >
                    Xem chi tiết
                  </Card.Link>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        <Col md={4}>
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-sm h-100">
              <Card.Body className="d-flex flex-column">
                <Card.Title>Số lượng thuốc đã nhập</Card.Title>
                <div className="text-center my-3">
                  <h2 className="display-4">10.00</h2>
                </div>
                <div className="mt-auto text-end">
                  <Card.Link 
                    onClick={handleViewDrugs} 
                    style={{ cursor: 'pointer' }} 
                    className="text-primary"
                  >
                    Xem chi tiết
                  </Card.Link>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
