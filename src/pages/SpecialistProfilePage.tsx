import React from 'react';
import { Navigate } from 'react-router-dom';

const SpecialistProfilePage: React.FC = () => {
  return <Navigate to="/specialists" replace />;
};

export default SpecialistProfilePage;
