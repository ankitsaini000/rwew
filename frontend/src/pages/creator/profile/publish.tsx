import React from 'react';
import { NextPage } from 'next';
import PublishProfile from '../../../components/creator/PublishProfile';
import {DashboardLayout} from '../../../components/layout/DashboardLayout';

const PublishProfilePage: NextPage = () => {
  return (
    <DashboardLayout>
      <PublishProfile />
    </DashboardLayout>
  );
};

export default PublishProfilePage; 