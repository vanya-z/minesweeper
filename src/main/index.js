import { app, BrowserWindow, Menu } from 'electron'
const {systemPreferences} = require('electron')

systemPreferences.setUserDefault('NSDisabledDictationMenuItem', 'boolean', true)
systemPreferences.setUserDefault('NSDisabledCharacterPaletteMenuItem', 'boolean', true)
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 0,
    height: 0,
    useContentSize: true,
    resizable: false,
    fullscreen: false,
    fullscreenable: false,
    backgroundColor: '#f2f2f2'
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

const menuTemplate = [
  {
    label: 'Edit',
    submenu: [
      {
        label: 'New',
        click () { mainWindow.webContents.send('new') }
      },
      {type: 'separator'},
      {
        label: 'Beginner',
        click () { mainWindow.webContents.send('new', 0) }
      },
      {
        label: 'Intermediate',
        click () { mainWindow.webContents.send('new', 1) }
      },
      {
        label: 'Expert',
        click () { mainWindow.webContents.send('new', 2) }
      },
      {
        label: 'Custom...',
        click () { mainWindow.webContents.send('custom') }
      },
      {type: 'separator'},
      {
        label: 'TOP Results',
        click () { mainWindow.webContents.send('statistics') }
      },
      {type: 'separator'},
      {
        label: 'Quit',
        role: 'quit'
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(menuTemplate)

app.on('ready', () => {
  createWindow()
  Menu.setApplicationMenu(menu)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
