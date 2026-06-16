/**
 * The preload script runs before `index.html` is loaded
 * in the renderer. It has access to web APIs as well as
 * Electron's renderer process modules and some polyfilled
 * Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
const { contextBridge, ipcRenderer } = require('electron')

// Expose a minimal, safe notification API to the renderer. The Notification
// module lives in the main process, so the renderer drives it over IPC.
contextBridge.exposeInMainWorld('notifications', {
  show: (options) => ipcRenderer.invoke('show-notification', options),
  getHistory: () => ipcRenderer.invoke('get-notification-history'),
  onHistoryUpdated: (callback) =>
    ipcRenderer.on('notification-history-updated', (_event, history) => callback(history))
})

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
