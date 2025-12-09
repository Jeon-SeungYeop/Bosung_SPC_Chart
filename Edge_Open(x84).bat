@echo off

set "EDGE_EXE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

set "EDGE_PROFILE=C:\edge-dev-profile"

set "DIST_INDEX=%~dp0dist\index.html"

start "" "%EDGE_EXE%" --allow-file-access-from-files --user-data-dir="%EDGE_PROFILE%" "%DIST_INDEX%"

exit
