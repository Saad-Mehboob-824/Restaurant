"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/Customer/Header';
import Hero from '@/components/Customer/Hero';
import About from '@/components/Customer/About';
import Deals from '@/components/Customer/Deals';
import Testimonials from '@/components/Customer/Testimonials';
import LocationContact from '@/components/Customer/LocationContact';
import Footer from '@/components/Customer/Footer';
import CartOverlay from "@/components/Menu/CartOverlay";
import Menu from '@/components/Customer/menu';

import WhatsAppWidget from '@/components/Customer/WhatsAppWidget';
import { colors, iconBackgrounds } from '@/constants/colors';

export default function Home() {
  const [isWaPanelOpen, setIsWaPanelOpen] = useState(false);
  const [items, setItems] = useState([]);
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/menu-items');
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch items');
        // API returns array of items in json.data
        setItems(json.data || []);
      } catch (err) {
        console.error('fetchItems error', err);
      }
    };
  
    useEffect(() => {
      fetchItems();
    }, []);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsWaPanelOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleWaPanel = () => {
    setIsWaPanelOpen(!isWaPanelOpen);
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (isWaPanelOpen && !(e.target as HTMLElement).closest('#waWidget')) {
      setIsWaPanelOpen(false);
    }
  };

  const handleSmoothScroll = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>Baltit Wok | Asian Fusion • Takeaway & Delivery • G-13/1 Islamabad</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Baltit Wok serves sizzling Asian fusion, burgers, and platters in G-13/1 Islamabad. Fast takeaway, home delivery, and great deals. Order now!" />
        <meta name="keywords" content="Baltit Wok, restaurant Islamabad, Asian fusion, fast food, takeaway, delivery, burgers, rice bowls, G-13/1, deals" />
        <meta property="og:title" content="Baltit Wok • Asian Fusion, Takeaway & Delivery" />
        <meta property="og:description" content="Sizzling Asian flavors in the heart of Islamabad. Order takeaway or delivery today!" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_PK" />
        <meta name="theme-color" content="#E63946" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;500;600&family=Poppins:wght@500;600;700&family=Pacifico&display=swap" rel="stylesheet" />
      </Head>
      <div className="antialiased selection:bg-black" style={{ backgroundColor: colors.bgPrimary, color: colors.textDark, fontFamily: "'Lato', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'" }}>
        <Header handleSmoothScroll={handleSmoothScroll} />
        <main id="home" className="pt-20 sm:pt-24">
          <Hero handleSmoothScroll={handleSmoothScroll} />
          <Menu />
          <About />
          <Deals />
          <Testimonials />
          <LocationContact />
        </main>
        <Footer handleSmoothScroll={handleSmoothScroll} />
        <WhatsAppWidget isWaPanelOpen={isWaPanelOpen} toggleWaPanel={toggleWaPanel} handleOutsideClick={handleOutsideClick} />
        <CartOverlay products={items} />
        
      </div>
    </>
  );
}