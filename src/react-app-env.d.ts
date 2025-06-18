/// <reference types="react-scripts" />
// src/react-app-env.d.ts

/// <reference types="react-scripts" />

// Bu kısım EKLENECEK
declare global {
    interface Window {
      recaptchaVerifier: any; // Firebase RecaptchaVerifier objesi için tip tanımı
      grecaptcha: any; // Google reCAPTCHA'nın global JavaScript objesi için tip tanımı
    }
  }