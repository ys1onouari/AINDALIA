export function initDebug() {
  if (!window.__DAHAB_DEBUG?.enabled) return;
  const dbg = window.__DAHAB_DEBUG;
  dbg.log('DEBUG', 'Debug module loaded');

  if (window.PerformanceObserver) {
    const obs = new PerformanceObserver(list => {
      list.getEntries().forEach(e => {
        if (e.duration > 100) dbg.log('LONGTASK', e.duration.toFixed(0) + 'ms');
      });
    });
    obs.observe({ entryTypes: ['longtask'] });

    const layoutObs = new PerformanceObserver(list => {
      list.getEntries().forEach(e => {
        if (e.value > 0.1) dbg.log('LAYOUTSHIFT', 'CLS value=' + e.value.toFixed(3));
      });
    });
    layoutObs.observe({ entryTypes: ['layout-shift'] });
  }

  if (performance.memory) {
    setInterval(() => {
      const mem = performance.memory;
      dbg.log('MEMORY', 'used=' + (mem.usedJSHeapSize / 1048576).toFixed(1) + 'MB limit=' + (mem.jsHeapSizeLimit / 1048576).toFixed(1) + 'MB');
    }, 15000);
  }

  setInterval(() => {
    try { localStorage.setItem('dahab_debug_logs', JSON.stringify(dbg.logs.slice(-200))); } catch(e) {}
  }, 10000);
}
