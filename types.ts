import React from 'react';

// Basic Inventory Types
export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  location: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string;
}

// User Management Types
export interface User {
  id: string;
  code: string;
  name: string;
  email: string;
  password?: string; // Optional in interface for listing, mandatory for creation
  role: string; // This corresponds to the 'name' of the UserRole
  active: boolean;
}

// Role/Access Management Types
export interface UserRole {
  id: string;
  code: string;
  name: string;
  permissions: string[]; // IDs of modules/submodules this role can access
}

// Master Data Types
export interface Customer {
  id: string; // Internal ID
  code: string; // Shopify ID
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  active: boolean;
}

// Navigation Types
export interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

// Stats for Dashboard
export interface DashboardStat {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
}

// Log System Types
export interface LogEntry {
  id: string;
  action: string; // e.g., 'Create', 'Update', 'Delete', 'Login'
  module: string; // e.g., 'Settings', 'Inventory', 'System'
  details: string;
  user: string; // Name of the user who performed the action
  timestamp: string;
}