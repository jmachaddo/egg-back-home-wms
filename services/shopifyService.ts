import { Customer } from '../types';

// Mock data to simulate Shopify response
const mockShopifyCustomers: Customer[] = [
  { 
    id: 'shopify_1001', 
    code: '7481928374', // Shopify Customer ID
    name: 'Ana Pereira', 
    email: 'ana.pereira@gmail.com', 
    phone: '+351 912 345 678', 
    address: 'Rua das Flores, 15', 
    city: 'Lisboa', 
    country: 'Portugal', 
    active: true 
  },
  { 
    id: 'shopify_1002', 
    code: '8392019283', // Shopify Customer ID
    name: 'Bruno Costa', 
    email: 'bruno.costa@hotmail.com', 
    phone: '+351 961 234 567', 
    address: 'Av. da Boavista, 500', 
    city: 'Porto', 
    country: 'Portugal', 
    active: true 
  },
  { 
    id: 'shopify_1003', 
    code: '1928374651', // Shopify Customer ID
    name: 'Claire Dupont', 
    email: 'c.dupont@orange.fr', 
    phone: '+33 6 12 34 56 78', 
    address: '10 Rue de Rivoli', 
    city: 'Paris', 
    country: 'France', 
    active: true 
  },
  { 
    id: 'shopify_1004', 
    code: '5647382910', // Shopify Customer ID
    name: 'Hans Müller', 
    email: 'hans.m@t-online.de', 
    phone: '+49 151 23456789', 
    address: 'Alexanderplatz 1', 
    city: 'Berlin', 
    country: 'Germany', 
    active: true 
  }
];

export const shopifyService = {
  /**
   * Simulates fetching customers from Shopify Admin API
   */
  getCustomers: async (): Promise<Customer[]> => {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockShopifyCustomers);
      }, 1500);
    });
  }
};