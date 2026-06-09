# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import os
import platform
import subprocess
import sys
import time
from dataclasses import dataclass


@dataclass(frozen=True)
class SystemInfo:
  """
  実行環境の CPU と主記憶容量を HUD 用の安定した観測値として保持する。
  `cpu_threads` は `os.cpu_count()` 由来の非負整数、`cpu_name` は OS から得た表示名、
  `cpu_speed_ghz` と `total_mem_bytes` は取得不能時に `None` となる任意値である。
  presentation の HUD はこの型により、OS 別の取得処理を直接所有せずに診断情報を表示する。
  """
  cpu_threads: int
  cpu_name: str
  cpu_speed_ghz: float | None
  total_mem_bytes: int | None


@dataclass(frozen=True)
class ProcessMemorySnapshot:
  """
  現在プロセスの常駐集合サイズと物理メモリ総量を同じ単位で保持する。
  `rss_bytes` と `total_bytes` は byte 単位の整数又は取得不能を表す `None` であり、HUD 側の MiB 表示と欠落表示はこの型の `None` 契約に依存する。
  """
  rss_bytes: int | None
  total_bytes: int | None


def _safe_float(x: object) -> float | None:
  """
  外部コマンドや OS 情報から得た値を例外を送出せずに `float` へ変換する。
  変換不能な値は `None` に正規化され、CPU 周波数など任意診断値の欠落を数値 0 と混同しない。
  """
  try:
    return float(x)
  except Exception:
    return None


def _windows_hidden_subprocess_kwargs() -> dict[str, object]:
  """
  Windows 上で補助コマンドを実行する際に console window を表示させない `subprocess` 引数を構成する。
  非 Windows では空辞書を返し、`CREATE_NO_WINDOW` と `STARTUPINFO` が利用不能な環境では
  設定可能な範囲だけを返すため、診断処理は UI 表示を乱さず失敗を吸収できる。
  """
  if not sys.platform.startswith("win"):
    return {}
  kwargs: dict[str, object] = {}
  creationflags = int(getattr(subprocess, "CREATE_NO_WINDOW", 0))
  if creationflags != 0:
    kwargs["creationflags"] = creationflags
  try:
    startupinfo = subprocess.STARTUPINFO()
    startupinfo.dwFlags |= int(subprocess.STARTF_USESHOWWINDOW)
    startupinfo.wShowWindow = 0
    kwargs["startupinfo"] = startupinfo
  except Exception:
    pass
  return kwargs


def _posix_total_mem_bytes_sysconf() -> int | None:
  """
  POSIX `sysconf` から物理ページ数とページサイズを読み、総物理メモリを byte 単位へ変換する。
  `SC_PHYS_PAGES` 又は `SC_PAGE_SIZE` が利用不能又は非正値の場合は `None` を返し、
  Linux と macOS の専用経路が失敗した後の補助取得手段として使われる。
  """
  try:
    sysconf = getattr(os, "sysconf", None)
    if sysconf is None:
      return None

    pg = sysconf("SC_PHYS_PAGES")
    sz = sysconf("SC_PAGE_SIZE")
    if isinstance(pg, int) and isinstance(sz, int) and pg > 0 and sz > 0:
      return int(pg) * int(sz)
  except Exception:
    return None
  return None


def _linux_read_first_cpu_field(key: str) -> str:
  """
  Linux の `/proc/cpuinfo` から指定 key に一致する最初の field 値を読み出す。
  読取失敗、区切り記号欠落、該当 field 欠落はいずれも空文字列へ正規化され、CPU 名と MHz 取得の上位処理は例外を意識せずに欠落を判定できる。
  """
  p = "/proc/cpuinfo"
  try:
    with open(p, "r", encoding="utf-8", errors="replace") as f:
      for line in f:
        if ":" not in line:
          continue
        k, v = line.split(":", 1)
        if k.strip() == key:
          return v.strip()
  except Exception:
    return ""
  return ""


def _linux_total_mem_bytes() -> int | None:
  """
  Linux の `/proc/meminfo` にある `MemTotal` を KiB から byte へ変換して返す。
  形式不一致又は読取失敗時は `None` を返し、HUD 用の総メモリ値は POSIX `sysconf` へ段階的に退避できる。
  """
  p = "/proc/meminfo"
  try:
    with open(p, "r", encoding="utf-8", errors="replace") as f:
      for line in f:
        if line.startswith("MemTotal:"):
          parts = line.split()
          if len(parts) >= 2:
            kb = int(parts[1])
            return kb * 1024
  except Exception:
    return None
  return None


def _linux_rss_bytes_proc() -> int | None:
  """
  Linux の `/proc/self/status` にある `VmRSS` を KiB から byte へ変換して返す。
  プロセス常駐メモリが読めない場合は `None` を返し、`ps` による POSIX 共通経路へ処理を渡す。
  """
  p = "/proc/self/status"
  try:
    with open(p, "r", encoding="utf-8", errors="replace") as f:
      for line in f:
        if line.startswith("VmRSS:"):
          parts = line.split()
          if len(parts) >= 2:
            kb = int(parts[1])
            return kb * 1024
  except Exception:
    return None
  return None


def _posix_rss_bytes_ps() -> int | None:
  """
  POSIX `ps -o rss=` の出力から現在プロセスの RSS を byte 単位で取得する。
  `ps` の失敗、timeout、空出力、非正値はいずれも `None` へ正規化され、Linux と macOS の memory snapshot が同じ欠落規則で扱われる。
  """
  try:
    pid = str(os.getpid())
    out = subprocess.check_output(["ps", "-o", "rss=", "-p", pid], stderr=subprocess.DEVNULL, text=True, timeout=0.6)
    s = str(out).strip()
    if not s:
      return None
    kb = int(s.split()[0])
    if kb <= 0:
      return None
    return kb * 1024
  except Exception:
    return None


def _mac_sysctl_str(name: str) -> str:
  """
  macOS の `sysctl -n` から指定名の文字列値を取得する。
  コマンド失敗又は timeout は空文字列へ正規化され、CPU brand string など表示用診断値の欠落を安全に表す。
  """
  try:
    out = subprocess.check_output(["sysctl", "-n", name], stderr=subprocess.DEVNULL, text=True, timeout=0.6)
    return str(out).strip()
  except Exception:
    return ""


def _mac_sysctl_int(name: str) -> int | None:
  """
  macOS の `sysctl` 文字列結果を整数へ変換し、変換不能時に `None` を返す。
  `hw.cpufrequency` や `hw.memsize` の取得経路はこの関数により、OS コマンド出力を byte 又は Hz の整数値として扱う。
  """
  s = _mac_sysctl_str(name)
  try:
    return int(s)
  except Exception:
    return None


def _windows_cpu_name() -> str:
  """
  Windows registry から processor name string を読み取り、表示用 CPU 名として返す。
  registry 参照や値取得が失敗した場合は空文字列を返し、上位の system info 取得は `platform.processor()` へ退避する。
  """
  try:
    import winreg  # type: ignore

    k = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"HARDWARE\DESCRIPTION\System\CentralProcessor\0")
    v, _t = winreg.QueryValueEx(k, "ProcessorNameString")
    return str(v).strip()
  except Exception:
    return ""


def _windows_cpu_mhz() -> int | None:
  """
  Windows registry の `~MHz` 値を整数 MHz として取得する。
  取得不能時は `None` を返し、`read_system_info` は返値が存在する場合だけ GHz へ `MHz / 1000` として変換する。
  """
  try:
    import winreg  # type: ignore

    k = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"HARDWARE\DESCRIPTION\System\CentralProcessor\0")
    v, _t = winreg.QueryValueEx(k, "~MHz")
    return int(v)
  except Exception:
    return None


def _windows_total_mem_bytes() -> int | None:
  """
  Windows `GlobalMemoryStatusEx` から物理メモリ総量を byte 単位で取得する。
  内部の `MEMORYSTATUSEX` は Win32 API が要求する構造体 layout を表し、API 呼出しが失敗した場合は `None` を返して他の診断値取得を継続させる。
  """
  try:
    import ctypes

    class MEMORYSTATUSEX(ctypes.Structure):
      """
      Win32 `GlobalMemoryStatusEx` が書き込むメモリ状態構造体を ctypes 上で表す。
      field 順序と整数幅は Windows API の layout に合わせられ、Ludoxel 側では `ullTotalPhys` だけを物理メモリ総量として読む。
      """
      _fields_ = [
        ("dwLength", ctypes.c_uint32),
        ("dwMemoryLoad", ctypes.c_uint32),
        ("ullTotalPhys", ctypes.c_uint64),
        ("ullAvailPhys", ctypes.c_uint64),
        ("ullTotalPageFile", ctypes.c_uint64),
        ("ullAvailPageFile", ctypes.c_uint64),
        ("ullTotalVirtual", ctypes.c_uint64),
        ("ullAvailVirtual", ctypes.c_uint64),
        ("ullAvailExtendedVirtual", ctypes.c_uint64),
      ]

    ms = MEMORYSTATUSEX()
    ms.dwLength = ctypes.sizeof(MEMORYSTATUSEX)
    ok = ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(ms))
    if not ok:
      return None
    return int(ms.ullTotalPhys)
  except Exception:
    return None


def _windows_rss_bytes_psapi() -> int | None:
  """
  Windows PSAPI の `GetProcessMemoryInfo` から現在プロセスの working set size を byte 単位で取得する。
  `PROCESS_MEMORY_COUNTERS` は API が要求する構造体 layout を表し、取得失敗又は非正値は `None` へ正規化される。
  """
  try:
    import ctypes
    import ctypes.wintypes as wt

    class PROCESS_MEMORY_COUNTERS(ctypes.Structure):
      """
      Windows PSAPI が現在プロセスの memory counter を書き込む ctypes 構造体である。
      Ludoxel の診断処理はこの構造体の `WorkingSetSize` を RSS 相当の値として扱い、他 field は API layout を満たすために保持する。
      """
      _fields_ = [
        ("cb", wt.DWORD),
        ("PageFaultCount", wt.DWORD),
        ("PeakWorkingSetSize", ctypes.c_size_t),
        ("WorkingSetSize", ctypes.c_size_t),
        ("QuotaPeakPagedPoolUsage", ctypes.c_size_t),
        ("QuotaPagedPoolUsage", ctypes.c_size_t),
        ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t),
        ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
        ("PagefileUsage", ctypes.c_size_t),
        ("PeakPagefileUsage", ctypes.c_size_t),
      ]

    counters = PROCESS_MEMORY_COUNTERS()
    counters.cb = ctypes.sizeof(PROCESS_MEMORY_COUNTERS)

    hproc = ctypes.windll.kernel32.GetCurrentProcess()

    psapi = ctypes.WinDLL("psapi")
    ok = psapi.GetProcessMemoryInfo(hproc, ctypes.byref(counters), counters.cb)
    if not ok:
      return None

    value = int(counters.WorkingSetSize)
    return value if value > 0 else None
  except Exception:
    return None


def _windows_rss_bytes_tasklist() -> int | None:
  """
  Windows `tasklist` の CSV 出力から現在プロセスの memory usage を KiB から byte へ変換する。
  PSAPI 経路が失敗した場合の補助経路であり、情報行、空出力、数値抽出失敗、非正値はいずれも `None` として扱う。
  """
  try:
    pid = str(os.getpid())
    out = subprocess.check_output(["tasklist", "/FI", f"PID eq {pid}", "/FO", "CSV", "/NH"], stderr=subprocess.DEVNULL, text=True, timeout=0.8, **_windows_hidden_subprocess_kwargs())
    line = str(out).strip()
    if not line or "INFO:" in line:
      return None

    parts = [p.strip().strip('"') for p in line.split('","')]
    if len(parts) < 5:
      parts = [p.strip().strip('"') for p in line.split(",")]

    mem_field = parts[-1] if parts else ""
    digits = "".join(ch for ch in mem_field if ch.isdigit())
    if not digits:
      return None

    kb = int(digits)
    if kb <= 0:
      return None
    return kb * 1024
  except Exception:
    return None


def read_system_info() -> SystemInfo:
  """
  現在の OS に応じて CPU thread 数、CPU 名、CPU 周波数、総物理メモリを収集する。
  Windows、Linux、macOS の専用経路を優先し、総メモリは必要に応じて POSIX `sysconf` へ退避するため、
  presentation の HUD は platform 分岐を持たずに `SystemInfo` を参照できる。
  """
  threads = int(os.cpu_count() or 0)

  cpu_name = ""
  cpu_ghz: float | None = None
  total_mem: int | None = None

  plat = sys.platform

  if plat.startswith("win"):
    cpu_name = _windows_cpu_name()
    mhz = _windows_cpu_mhz()
    if mhz is not None:
      cpu_ghz = float(mhz) / 1000.0
    total_mem = _windows_total_mem_bytes()

  elif plat.startswith("linux"):
    cpu_name = _linux_read_first_cpu_field("model name")
    mhz_s = _linux_read_first_cpu_field("cpu MHz")
    mhz = _safe_float(mhz_s)
    if mhz is not None:
      cpu_ghz = float(mhz) / 1000.0
    total_mem = _linux_total_mem_bytes()

  elif plat.startswith("darwin"):
    cpu_name = _mac_sysctl_str("machdep.cpu.brand_string")
    hz = _mac_sysctl_int("hw.cpufrequency")
    if hz is not None and hz > 0:
      cpu_ghz = float(hz) / 1e9
    total_mem = _mac_sysctl_int("hw.memsize")

  if total_mem is None:
    total_mem = _posix_total_mem_bytes_sysconf()

  if not cpu_name:
    cpu_name = str(platform.processor() or "").strip()

  return SystemInfo(cpu_threads=int(max(0, threads)), cpu_name=str(cpu_name), cpu_speed_ghz=cpu_ghz, total_mem_bytes=total_mem)


def read_process_memory(total_mem_bytes: int | None = None) -> ProcessMemorySnapshot:
  """
  現在プロセスの RSS と物理メモリ総量を OS 別経路から取得して `ProcessMemorySnapshot` を返す。
  `total_mem_bytes` が与えられた場合はその値を優先し、取得不能な RSS 又は総量は `None` として保持するため、
  外部診断 thread は例外ではなく欠落値として表示状態を更新する。
  """
  plat = sys.platform

  rss: int | None = None
  total: int | None = total_mem_bytes

  if plat.startswith("win"):
    rss = _windows_rss_bytes_psapi()
    if rss is None:
      rss = _windows_rss_bytes_tasklist()
    if total is None:
      total = _windows_total_mem_bytes()

  elif plat.startswith("linux"):
    rss = _linux_rss_bytes_proc()
    if rss is None:
      rss = _posix_rss_bytes_ps()
    if total is None:
      total = _linux_total_mem_bytes()

  elif plat.startswith("darwin"):
    rss = _posix_rss_bytes_ps()
    if total is None:
      total = _mac_sysctl_int("hw.memsize")

  if total is None:
    total = _posix_total_mem_bytes_sysconf()

  return ProcessMemorySnapshot(rss_bytes=rss, total_bytes=total)


def _nvidia_smi_util_percent() -> float | None:
  """
  `nvidia-smi` から GPU 使用率を percent 単位で取得し、閉区間 [0, 100] へ収める。
  NVIDIA GPU 又はコマンドが存在しない環境、timeout、形式不一致は `None` に正規化され、HUD の外部 probe は GPU 診断の任意性を保持できる。
  """
  try:
    out = subprocess.check_output(
      ["nvidia-smi", "--query-gpu=utilization.gpu", "--format=csv,noheader,nounits"], stderr=subprocess.DEVNULL, text=True, timeout=0.8, **_windows_hidden_subprocess_kwargs()
    )
    line = str(out).strip().splitlines()[0].strip()
    value = float(line)
    if value < 0.0:
      return 0.0
    if value > 100.0:
      return 100.0
    return float(value)
  except Exception:
    return None


@dataclass
class GpuUtilizationSampler:
  """
  GPU 使用率の外部コマンド照会を最小間隔で間引く状態ful sampler である。
  `min_interval_s` 未満の連続呼出しでは直前値を返すため、HUD 更新周期が短い場合でも `nvidia-smi` の起動負荷と表示値の欠落規則を安定させる。
  """
  min_interval_s: float = 1.0
  _last_t: float = 0.0
  _last: float | None = None

  def sample(self) -> float | None:
    """
    現在時刻と前回照会時刻を比較し、必要な場合だけ GPU 使用率を再取得する。
    返値は percent 単位の `float` 又は取得不能を表す `None` であり、短時間内の呼出しでは `_last` を返して外部 probe thread の負荷を抑える。
    """
    now = time.perf_counter()
    if (now - float(self._last_t)) < float(self.min_interval_s):
      return self._last
    self._last_t = now
    self._last = _nvidia_smi_util_percent()
    return self._last
