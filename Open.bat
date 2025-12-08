@echo off

set "CHROME_EXE=C:\Program Files\Google\Chrome\Application\chrome.exe"

set "CHROME_PROFILE=C:\chrome-dev-profile"

set "DIST_INDEX=%~dp0dist\index.html"

start "" "%CHROME_EXE%" --allow-file-access-from-files --user-data-dir="%CHROME_PROFILE%" "%DIST_INDEX%"

exit
