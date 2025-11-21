// src/components/dashboard/StatsCards.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useTransportContext } from '../../context/TransportContext';
import FirebaseService from '../../services/firebaseService';
import 'boxicons/css/boxicons.min.css';

const StatsCards = ({ data }) => {
  const { t } = useTranslation();
  const [trips, setTrips] = useState([]);

  // Get real data from TransportContext
  const {
    vehicles = []
  } = useTransportContext() || {};

  // Subscribe to trips data from Firebase
  useEffect(() => {
    const unsubscribe = FirebaseService.subscribeToTrips((tripsData) => {
      setTrips(tripsData || []);
    });

    return () => unsubscribe();
  }, []);

  // Calculate real statistics from Firebase data
  const totalVehicles = vehicles.length;

  // Active trips (in-transit or pending status)
  const activeTrips = trips.filter(
    trip => trip.status === 'in-progress' || trip.status === 'planned'
  ).length;

  // Total distance from active trips
  const totalDistanceActiveTrips = trips
    .filter(trip => trip.status === 'in-progress' || trip.status === 'planned')
    .reduce((sum, trip) => sum + (parseFloat(trip.distance) || 0), 0);

  // Fuel cost from all trips
  const fuelCostAllTrips = trips.reduce((sum, trip) => {
    const fuelCost = parseFloat(trip.fuelCost) || 0;
    return sum + fuelCost;
  }, 0);

  // Total cost from all trips
  const totalCostAllTrips = trips.reduce(
    (sum, trip) => sum + (parseFloat(trip.total) || 0), 0
  );

  // Completed trips count
  const completedTrips = trips.filter(
    trip => trip.status === 'completed'
  ).length;

  // Total distance from all trips
  const totalDistanceAll = trips.reduce(
    (sum, trip) => sum + (parseFloat(trip.distance) || 0), 0
  );

  // Total revenue from all trips (using total as revenue)
  const totalRevenue = trips.reduce(
    (sum, trip) => sum + (parseFloat(trip.total) || 0), 0
  );

  const stats = [
    {
      title: t('dashboard.totalVehicles'),
      value: totalVehicles,
      variant: 'primary',
      icon: 'bx bx-car',
      color: '#065f46',
      trend: `${totalVehicles} ${t('dashboard.registered')}`
    },
    {
      title: t('dashboard.activeTrips'),
      value: activeTrips,
      variant: 'success',
      icon: 'bx bx-trip',
      color: '#10b981',
      trend: t('dashboard.inTransitPending')
    },
    {
      title: t('dashboard.activeTripDistance'),
      value: totalDistanceActiveTrips > 1000
        ? `${(totalDistanceActiveTrips / 1000).toFixed(1)}K KM`
        : `${totalDistanceActiveTrips.toFixed(0)} KM`,
      variant: 'info',
      icon: 'bx bx-map',
      color: '#3b82f6',
      trend: t('dashboard.activeTripsOnly')
    },
    {
      title: t('dashboard.fuelCost'),
      value: fuelCostAllTrips > 1000
        ? `₹${(fuelCostAllTrips / 1000).toFixed(1)}K`
        : `₹${fuelCostAllTrips.toFixed(0)}`,
      variant: 'warning',
      icon: 'bx bx-gas-pump',
      color: '#f59e0b',
      trend: t('dashboard.allTrips')
    },
    {
      title: t('dashboard.totalCost'),
      value: totalCostAllTrips > 1000
        ? `₹${(totalCostAllTrips / 1000).toFixed(1)}K`
        : `₹${totalCostAllTrips.toFixed(0)}`,
      variant: 'danger',
      icon: 'bx bx-wallet',
      color: '#ef4444',
      trend: t('dashboard.allTrips')
    },
    {
      title: t('dashboard.completedTrips'),
      value: completedTrips,
      variant: 'success',
      icon: 'bx bx-check-circle',
      color: '#10b981',
      trend: `${completedTrips} ${t('dashboard.completed')}`
    },
    {
      title: t('dashboard.totalDistance'),
      value: totalDistanceAll > 1000
        ? `${(totalDistanceAll / 1000).toFixed(1)}K KM`
        : `${totalDistanceAll.toFixed(0)} KM`,
      variant: 'info',
      icon: 'bx bx-map-alt',
      color: '#3b82f6',
      trend: t('dashboard.allTrips')
    },
    {
      title: t('dashboard.totalRevenue'),
      value: totalRevenue > 1000
        ? `₹${(totalRevenue / 1000).toFixed(1)}K`
        : `₹${totalRevenue.toFixed(0)}`,
      variant: 'primary',
      icon: 'bx bx-dollar-circle',
      color: '#065f46',
      trend: t('dashboard.allTrips')
    }
  ];

  return (
    <Row className="mb-4 g-3 stats-cards-row">
      {stats.map((stat, index) => (
        <Col xs={6} sm={6} md={6} lg={4} xl={3} key={index}>
          <Card className={`stats-card ${index % 2 === 0 ? 'primary' : 'secondary'} h-100`}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1 pe-2">
                  <h6 className="mb-2">{stat.title}</h6>
                  <h3 className="mb-1">{stat.value}</h3>
                  <small className="d-flex align-items-center trend up">
                    <i className="bx bx-trending-up me-1"></i>
                    <span>{stat.trend}</span>
                  </small>
                </div>
                <div className="trend-icon flex-shrink-0">
                  <i className={stat.icon} style={{ fontSize: '1.4rem', color: stat.color }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatsCards;