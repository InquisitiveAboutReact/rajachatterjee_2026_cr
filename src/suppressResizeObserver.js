// src/suppressResizeObserver.js
if (typeof window !== 'undefined') {
    // 1. Patch the global ResizeObserver to catch loop errors internally
    const OrigResizeObserver = window.ResizeObserver;
    if (OrigResizeObserver) {
      window.ResizeObserver = class ResizeObserver extends OrigResizeObserver {
        constructor(callback) {
          super((entries, observer) => {
            window.requestAnimationFrame(() => {
              try {
                callback(entries, observer);
              } catch (e) {
                // Swallow the ResizeObserver loop error silently
                if (!e.message || !e.message.includes('ResizeObserver loop completed')) {
                  throw e;
                }
              }
            });
          });
        }
      };
    }
  
    // 2. Suppress console error logs
    const resizeObserverLoopErrRe = /ResizeObserver loop completed with undelivered notifications/;
    const originalError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === 'string' && resizeObserverLoopErrRe.test(args[0])) {
        return;
      }
      originalError(...args);
    };
  
    // 3. Fallback global listener
    window.addEventListener('error', (e) => {
      if (resizeObserverLoopErrRef(e.message)) {
        e.stopImmediatePropagation();
      }
    }, true);
    
    function resizeObserverLoopErrRef(msg) {
      return msg && resizeObserverLoopErrRe.test(msg);
    }
  }