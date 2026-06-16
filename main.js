// Modules to control application life and create native browser window
const { app, BrowserWindow, Notification, ipcMain } = require('electron')
const path = require('node:path')

// In-memory log of every notification we've attempted, plus the lifecycle
// events each one emitted. On Electron 42+, macOS uses the UNNotification API
// which requires the app to be code-signed; unsigned builds emit a `failed`
// event instead of showing the banner. We record that here so it's visible.
const notificationHistory = []

let mainWindow = null

function pushHistoryEvent (id, type, detail) {
  const entry = notificationHistory.find((n) => n.id === id)
  if (!entry) return
  entry.events.push({ type, detail: detail ?? null, at: new Date().toISOString() })
  // Keep the renderer's history view in sync as events arrive.
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('notification-history-updated', notificationHistory)
  }
}

function showNotification (options = {}) {
  const id = `${Date.now()}-${notificationHistory.length}`
  const opts = {
    title: options.title || 'Electron 42 notification',
    body: options.body || 'Testing the UNNotification API on macOS.',
    silent: Boolean(options.silent)
  }

  const entry = {
    id,
    options: opts,
    supported: Notification.isSupported(),
    createdAt: new Date().toISOString(),
    events: []
  }
  notificationHistory.unshift(entry)

  if (!entry.supported) {
    pushHistoryEvent(id, 'unsupported', 'Notification.isSupported() returned false')
    return { id, supported: false }
  }

  const notification = new Notification(opts)

  notification.on('show', () => pushHistoryEvent(id, 'show'))
  notification.on('click', () => pushHistoryEvent(id, 'click'))
  notification.on('close', () => pushHistoryEvent(id, 'close'))
  // The key Electron 42 macOS behavior: unsigned apps can't display
  // notifications via UNNotification and emit `failed` with an error string.
  notification.on('failed', (_event, error) => pushHistoryEvent(id, 'failed', String(error)))

  notification.show()
  return { id, supported: true }
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('index.html')
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // IPC: send a notification and report whether it was supported.
  ipcMain.handle('show-notification', (_event, options) => showNotification(options))
  // IPC: hand the full attempt-and-event log back to the renderer.
  ipcMain.handle('get-notification-history', () => notificationHistory)

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})