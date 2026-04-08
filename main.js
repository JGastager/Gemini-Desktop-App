const { app, BrowserWindow, Menu, globalShortcut } = require('electron')

let win // keep reference globally so shortcut can access it

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
}

app.whenReady().then(() => {
    createWindow()

    // Register Alt+Space to toggle window
    const registered = globalShortcut.register('Alt+Space', () => {
        if (!win) return

        if (win.isVisible() && !win.isMinimized()) {
            // Window is visible → hide it
            win.hide()
        } else {
            // Window is hidden/minimized → show & focus
            if (win.isMinimized()) win.restore()
            win.show()
            win.focus()
        }
    })

    if (!registered) {
        console.log('Global shortcut registration failed')
    }
})

// Clean up global shortcuts on exit
app.on('will-quit', () => {
    globalShortcut.unregisterAll()
})