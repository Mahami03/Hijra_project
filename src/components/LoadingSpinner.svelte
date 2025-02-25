<script>
    export let size = '48px';  // Spinner'ın boyutunu ayarlamak için bir prop
  </script>
  
  <style>
    .spinner-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(255, 255, 255, 0.8); /* Sayfanın üstünde hafif bir arka plan */
      z-index: 1000;  /* Diğer içeriklerin üstünde olması için */
    }
  
    .spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-left-color: #3498db;
      border-radius: 50%;
      width: var(--size);
      height: var(--size);
      animation: spin 1s linear infinite;
    }
  
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  </style>
  
  <div class="spinner-container">
    <div class="spinner" style="--size: {size};"></div>
  </div>
  