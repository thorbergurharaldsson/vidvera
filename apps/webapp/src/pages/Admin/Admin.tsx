import React from 'react';
import { Link, Outlet, Route, Routes } from 'react-router-dom';
import Invite from './Invite';

export default function Admin() {
  return (
    <div className="min-w-full">
      <h1 className="text-2xl font-bold">Admin</h1>
      <div className="inset-0 flex mb-8 mt-4" aria-hidden="true">
        <div className="w-full border-t border-gray-300" />
      </div>
      <Outlet />
    </div>
  );
}
