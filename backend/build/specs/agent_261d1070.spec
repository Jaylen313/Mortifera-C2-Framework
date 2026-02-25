# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['C:\\Users\\sudow\\OneDrive\\SchoolOneDFolder\\Winter2026\\NetSec\\Project\\GitNetSecProj\\command-and-control\\C2Py-framework\\backend\\generated_agents\\agent_261d1070.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=['requests', 'urllib3', 'json', 'base64', 'socket', 'platform', 'subprocess', 'time', 'datetime', 'os', 'sys', 'PIL', 'PIL.Image', 'PIL.ImageGrab'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='agent_261d1070',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='NONE',
)
