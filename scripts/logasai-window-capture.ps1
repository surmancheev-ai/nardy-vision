param(
  [Parameter(Mandatory = $true)]
  [string]$OutFile
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;

public static class Win32Capture {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

  [StructLayout(LayoutKind.Sequential)]
  public struct RECT {
    public int Left;
    public int Top;
    public int Right;
    public int Bottom;
  }

  [StructLayout(LayoutKind.Sequential)]
  public struct POINT {
    public int X;
    public int Y;
  }

  [DllImport("user32.dll")]
  public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

  [DllImport("user32.dll", CharSet=CharSet.Unicode)]
  public static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);

  [DllImport("user32.dll", CharSet=CharSet.Unicode)]
  public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

  [DllImport("user32.dll")]
  public static extern bool GetClientRect(IntPtr hWnd, out RECT lpRect);

  [DllImport("user32.dll")]
  public static extern bool ClientToScreen(IntPtr hWnd, ref POINT lpPoint);
}
"@

function Get-LogasMainWindow {
  $script:foundWindow = $null

  $enum = [Win32Capture+EnumWindowsProc]{
    param([IntPtr]$hWnd, [IntPtr]$lParam)

    $classBuilder = New-Object System.Text.StringBuilder 256
    $titleBuilder = New-Object System.Text.StringBuilder 512
    [void][Win32Capture]::GetClassName($hWnd, $classBuilder, $classBuilder.Capacity)
    [void][Win32Capture]::GetWindowText($hWnd, $titleBuilder, $titleBuilder.Capacity)

    if ($classBuilder.ToString() -eq "TForm1.UnicodeClass" -and $titleBuilder.ToString() -like "LogasAI Analysis*") {
      $script:foundWindow = [pscustomobject]@{
        Handle = $hWnd
        Title = $titleBuilder.ToString()
      }
      return $false
    }

    return $true
  }

  [void][Win32Capture]::EnumWindows($enum, [IntPtr]::Zero)
  return $script:foundWindow
}

$window = Get-LogasMainWindow
if (-not $window) {
  throw "Окно LogasAI Analysis не найдено."
}

$rect = New-Object Win32Capture+RECT
if (-not [Win32Capture]::GetClientRect($window.Handle, [ref]$rect)) {
  throw "Не удалось получить клиентскую область окна."
}

$origin = New-Object Win32Capture+POINT
$origin.X = 0
$origin.Y = 0
if (-not [Win32Capture]::ClientToScreen($window.Handle, [ref]$origin)) {
  throw "Не удалось преобразовать координаты окна."
}

$width = $rect.Right - $rect.Left
$height = $rect.Bottom - $rect.Top

$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($origin.X, $origin.Y, 0, 0, $bitmap.Size)

$resolvedOutFile = [System.IO.Path]::GetFullPath($OutFile)
$directory = Split-Path -Parent $resolvedOutFile
if (-not (Test-Path -LiteralPath $directory)) {
  New-Item -ItemType Directory -Path $directory -Force | Out-Null
}

$bitmap.Save($resolvedOutFile, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()

[pscustomobject]@{
  path = $resolvedOutFile
  width = $width
  height = $height
  title = $window.Title
} | ConvertTo-Json -Depth 4
