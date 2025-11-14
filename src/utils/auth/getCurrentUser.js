"use client";

/**
 * Extract user information from JWT token stored in cookies
 * Returns userId, restaurantId, email, role, firstName, lastName
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  
  try {
    // Get token from cookies
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
    
    if (!tokenCookie) {
      console.warn('No token cookie found');
      return null;
    }
    
    const token = tokenCookie.split('=')[1];
    
    if (!token) {
      console.warn('Token cookie is empty');
      return null;
    }
    
    // Decode JWT (simple base64 decode of payload)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }
    
    // Decode the payload (second part)
    // JWT uses base64url encoding, convert to standard base64 first
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Add padding if needed
    const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    
    const decoded = JSON.parse(atob(paddedPayload));
    
    return {
      userId: decoded.userId,
      restaurantId: decoded.restaurantId,
      email: decoded.email,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName
    };
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return getCurrentUser() !== null;
}

/**
 * Get user ID from JWT token
 */
export function getUserId() {
  const user = getCurrentUser();
  return user?.userId || null;
}

/**
 * Get restaurant ID from JWT token
 */
export function getRestaurantId() {
  const user = getCurrentUser();
  return user?.restaurantId || null;
}
