// src/components/dashboard/DashboardHeader.jsx
import React from 'react';
import { Row, Col, Breadcrumb, Button } from 'react-bootstrap';
import 'boxicons/css/boxicons.min.css';

const DashboardHeader = ({ title, subtitle }) => {
  return (
    <Row className="mb-4">
      <Col>
        <div className="dashboard-header">
          <div className="d-flex align-items-center mb-2">
            <i className="bx bx-tachometer me-2" style={{ fontSize: '2rem', color: '#065f46' }}></i>
            <h2 className="text-primary mb-0">{title}</h2>
          </div>
          <p className="text-muted">{subtitle}</p>
          <Breadcrumb>
            <Breadcrumb.Item href="#" className="d-flex align-items-center">
              <i className="bx bx-home me-1"></i>
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active className="d-flex align-items-center">
              <i className="bx bx-user me-1"></i>
              Supplier
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </Col>
      <Col xs="auto">
        <Button variant="primary" className="me-2 d-flex align-items-center gap-1">
          <i className="bx bx-plus"></i>
          New Order
        </Button>
        <Button variant="outline-secondary" className="d-flex align-items-center gap-1">
          <i className="bx bx-download"></i>
          Export Report
        </Button>
      </Col>
    </Row>
  );
};

export default DashboardHeader;