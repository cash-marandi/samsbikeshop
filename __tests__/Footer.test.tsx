import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from '../app/components/Footer';
import '@testing-library/jest-dom';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({children, href}: {children: React.ReactNode, href: string}) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Footer Component', () => {
  it('should render the company name', () => {
    render(<Footer />);
    expect(screen.getByText('SAMS')).toBeInTheDocument();
    expect(screen.getByText('BIKE SHOP')).toBeInTheDocument();
  });

  it('should render the copyright notice', () => {
    render(<Footer />);
    // Using a regular expression to find the text, making it case-insensitive
    const copyrightText = screen.getByText(/© 2024 Sams Bike Shop. All rights reserved./i);
    expect(copyrightText).toBeInTheDocument();
  });

  it('should contain links to quick links like Shop and Rentals', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /Shop Bikes/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Rentals/i })).toBeInTheDocument();
  });

  it('should contain links to support pages like Contact Us', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /Contact Us/i })).toBeInTheDocument();
  });
});
