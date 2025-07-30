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

export async function getServerSideProps() {
  // This page requires client-side rendering due to auth and localStorage usage
  return {
    props: {}, // will be passed to the page component as props
  };
}

export default PublishProfilePage; 