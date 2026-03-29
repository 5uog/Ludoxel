# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import collect_data_files
from PyInstaller.utils.hooks import collect_submodules

datas = [('C:\\Users\\suogf\\Downloads\\Ludoxel\\assets', 'assets'), ('C:\\Users\\suogf\\Downloads\\Ludoxel\\src', 'src')]
hiddenimports = []
datas += collect_data_files('ludoxel')
hiddenimports += collect_submodules('ludoxel')


a = Analysis(
    ['C:\\Users\\suogf\\Downloads\\Ludoxel\\main.py'],
    pathex=['C:\\Users\\suogf\\Downloads\\Ludoxel\\src'],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
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
    name='Ludoxel',
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
    icon=['C:\\Users\\suogf\\Downloads\\Ludoxel\\assets\\ui\\app_icon.ico'],
)
