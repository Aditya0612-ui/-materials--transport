// src/components/dashboard/StatsCards.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransportContext } from '../../context/TransportContext';
import FirebaseService from '../../services/firebaseService';
import 'boxicons/css/boxicons.min.css';

const StatsCards = () => {
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
      icon: 'bx bx-car',
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      cardBg: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      trend: `${totalVehicles} ${t('dashboard.registered')}`,
      trendColor: 'text-emerald-600'
    },
    {
      title: t('dashboard.activeTrips'),
      value: activeTrips,
      icon: 'bx bx-trip',
      color: 'text-teal-600',
      bg: 'bg-teal-100',
      cardBg: 'bg-teal-50',
      borderColor: 'border-teal-100',
      trend: t('dashboard.inTransitPending'),
      trendColor: 'text-teal-600'
    },
    {
      title: t('dashboard.activeTripDistance'),
      value: totalDistanceActiveTrips > 1000
        ? `${(totalDistanceActiveTrips / 1000).toFixed(1)}K KM`
        : `${totalDistanceActiveTrips.toFixed(0)} KM`,
      icon: 'bx bx-map',
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      cardBg: 'bg-blue-50',
      borderColor: 'border-blue-100',
      trend: t('dashboard.activeTripsOnly'),
      trendColor: 'text-blue-600'
    },
    {
      title: t('dashboard.fuelCost'),
      value: fuelCostAllTrips > 1000
        ? `₹${(fuelCostAllTrips / 1000).toFixed(1)}K`
        : `₹${fuelCostAllTrips.toFixed(0)}`,
      icon: 'bx bx-gas-pump',
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      cardBg: 'bg-amber-50',
      borderColor: 'border-amber-100',
      trend: t('dashboard.allTrips'),
      trendColor: 'text-amber-600'
    },
    {
      title: t('dashboard.totalCost'),
      value: totalCostAllTrips > 1000
        ? `₹${(totalCostAllTrips / 1000).toFixed(1)}K`
        : `₹${totalCostAllTrips.toFixed(0)}`,
      icon: 'bx bx-wallet',
      color: 'text-red-600',
      bg: 'bg-red-100',
      cardBg: 'bg-red-50',
      borderColor: 'border-red-100',
      trend: t('dashboard.allTrips'),
      trendColor: 'text-red-600'
    },
    {
      title: t('dashboard.completedTrips'),
      value: completedTrips,
      icon: 'bx bx-check-circle',
      color: 'text-green-600',
      bg: 'bg-green-100',
      cardBg: 'bg-green-50',
      borderColor: 'border-green-100',
      trend: `${completedTrips} ${t('dashboard.completed')}`,
      trendColor: 'text-green-600'
    },
    {
      title: t('dashboard.totalDistance'),
      value: totalDistanceAll > 1000
        ? `${(totalDistanceAll / 1000).toFixed(1)}K KM`
        : `${totalDistanceAll.toFixed(0)} KM`,
      icon: 'bx bx-map-alt',
      color: 'text-cyan-600',
      bg: 'bg-cyan-100',
      cardBg: 'bg-cyan-50',
      borderColor: 'border-cyan-100',
      trend: t('dashboard.allTrips'),
      trendColor: 'text-cyan-600'
    },
    {
      title: t('dashboard.totalRevenue'),
      value: totalRevenue > 1000
        ? `₹${(totalRevenue / 1000).toFixed(1)}K`
        : `₹${totalRevenue.toFixed(0)}`,
      icon: 'bx bx-dollar-circle',
      color: 'text-emerald-700',
      bg: 'bg-emerald-200',
      cardBg: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      trend: t('dashboard.allTrips'),
      trendColor: 'text-emerald-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.cardBg} rounded-2xl p-6 shadow-sm border ${stat.borderColor} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out group h-full flex flex-col justify-between`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-slate-700 text-base font-semibold mb-1">{stat.title}</h3>
              <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
              <i className={`${stat.icon} text-xl`}></i>
            </div>
          </div>

          <div className="flex items-center text-sm">
            <span className={`flex items-center font-medium ${stat.trendColor}`}>
              <i className='bx bx-trending-up mr-1'></i>
              {stat.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;