const { app, BrowserWindow, Menu, Tray, nativeImage } = require('electron')
const { uIOhook, UiohookKey } = require('uiohook-napi')
const path = require('path')

let win  // keep reference globally so shortcut can access it
let tray // system tray icon

function showWindow() {
    if (!win) return
    if (win.isMinimized()) win.restore()
    win.show()
    win.setAlwaysOnTop(true)
    win.focus()
    win.moveTop()
    win.setAlwaysOnTop(false)
}

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: './assets/icon.png',
        backgroundColor: 'black',
        // titleBarStyle: 'hidden',
        // titleBarOverlay: {
        //     color: 'black',
        //     symbolColor: '#E3E3D5',
        //     height: 30
        // }
    })

    Menu.setApplicationMenu(null)
    win.loadURL('https://gemini.google.com/')

    // Hide to tray instead of closing
    win.on('close', (e) => {
        e.preventDefault()
        win.hide()
    })
}

function createTray() {
    const icon = nativeImage.createFromPath(path.join(__dirname, 'assets/icon.png'))
    tray = new Tray(icon.resize({ width: 16, height: 16 }))
    tray.setToolTip('Gemini Desktop App')

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show', click: showWindow },
        { type: 'separator' },
        { label: 'Quit', click: () => { app.exit(0) } }
    ])

    tray.setContextMenu(contextMenu)
    tray.on('click', showWindow) // left-click also shows window
}

app.whenReady().then(() => {
    // Enable autostart with Windows
    app.setLoginItemSettings({ openAtLogin: true })

    createWindow()
    createTray()

    // Use low-level hook to capture Win+Space (bypasses Windows system shortcut interception)
    let winDown = false

    uIOhook.on('keydown', (e) => {
        if (e.keycode === UiohookKey.Meta) winDown = true

        if (winDown && e.keycode === UiohookKey.Space) {
            if (!win) return
            if (win.isVisible() && !win.isMinimized()) {
                win.minimize()
            } else {
                showWindow()
            }
        }
    })

    uIOhook.on('keyup', (e) => {
        if (e.keycode === UiohookKey.Meta) winDown = false
    })

    uIOhook.start()
})

// Clean up hook on exit
app.on('will-quit', () => {
    uIOhook.stop()
})