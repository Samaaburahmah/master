/*
    Platform specific logic
*/
const { app, BrowserWindow } = require('electron')
const { autoUpdater } = require('electron-updater')

module.exports = function() {
    switch(process.platform) {
        //Prevent multiple copies, in case of run of second instance bring main app to front
        case 'win32':
        case 'linux':
            if (!app.requestSingleInstanceLock())
                return app.quit()
            else
                app.on('second-instance', () => {
                    const windows = BrowserWindow.getAllWindows()
                    if (!windows.length) return

                    if (windows[0].isMinimized())
                        windows[0].restore()
                    windows[0].focus()
                })
        break
        
        //Hide instead closing of last window on darwin
        case 'darwin':
            app.on('activate', function () {
                const windows = BrowserWindow.getAllWindows()
                if (windows.length === 0){
                    app.relaunch()
                    app.exit(0)
                }
                else
                    windows[0].show()
            })
            
            let _firstWin = true
            let _quiting = false
            app.on('browser-window-created', function (e, window) {
                if (_firstWin){
                    window.on('close', function(e) {
                        if (this.isFullScreen())
                            this.setFullScreen(false)
                        
                        if (!_quiting) {
                            e.preventDefault()
                            this.hide()
                        }
                    })

                    window.on('leave-full-screen', function() {
                        this.hide()
                    })

                    _firstWin = false
                }
            })
            
            app.on('before-quit', function(){
                _quiting = true
            })
            
            app.on('window-all-closed', function () {
                app.quit()
            })

            autoUpdater.on('update-downloaded', function () {
                //fix restart option for updates
                _quiting = true
            })
        break
    }
}