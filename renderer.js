/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

const historyList = document.getElementById('notification-history')

function renderHistory (history) {
  if (!history || history.length === 0) {
    historyList.innerHTML = '<li class="empty">No notifications sent yet.</li>'
    return
  }

  historyList.innerHTML = ''
  for (const entry of history) {
    const item = document.createElement('li')

    const title = document.createElement('div')
    title.className = 'notif-title'
    title.textContent = entry.options.title
    item.appendChild(title)

    const meta = document.createElement('div')
    meta.className = 'notif-meta'
    const events = entry.events.length
      ? entry.events.map((e) => (e.detail ? `${e.type} (${e.detail})` : e.type)).join(' → ')
      : 'no events yet'
    meta.textContent = `supported: ${entry.supported} · ${events}`
    item.appendChild(meta)

    historyList.appendChild(item)
  }
}

async function refreshHistory () {
  renderHistory(await window.notifications.getHistory())
}

document.getElementById('send-notification').addEventListener('click', async () => {
  await window.notifications.show({
    title: document.getElementById('notif-title').value,
    body: document.getElementById('notif-body').value,
    silent: document.getElementById('notif-silent').checked
  })
  refreshHistory()
})

// Live updates as the main process records show/click/close/failed events.
window.notifications.onHistoryUpdated(renderHistory)

document.addEventListener('DOMContentLoaded', refreshHistory)
