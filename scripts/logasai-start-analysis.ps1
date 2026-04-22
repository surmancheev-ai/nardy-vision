param(
  [ValidateSet(1, 2)]
  [int]$Method = 1,

  [double]$BannerX = 0.075,
  [double]$BannerY = 0.085,
  [double]$PlayX = 0.082,
  [double]$PlayY = 0.028,
  [double]$MethodMenuOffsetX = 0.05,
  [double]$Method1OffsetY = 0.03,
  [double]$Method2OffsetY = 0.055,

  [int]$MenuOpenDelayMs = 350,
  [int]$AfterMethodDelayMs = 350,
  [int]$AfterPlayDelayMs = 500
)

$ErrorActionPreference = "Stop"

Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;

public static class StartWin32 {
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
  public static extern bool SetForegroundWindow(IntPtr hWnd);

  [DllImport("user32.dll")]
  public static extern bool GetClientRect(IntPtr hWnd, out RECT lpRect);

  [DllImport("user32.dll")]
  public static extern bool ClientToScreen(IntPtr hWnd, ref POINT lpPoint);

  [DllImport("user32.dll")]
  public static extern bool SetCursorPos(int X, int Y);

  [DllImport("user32.dll")]
  public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, UIntPtr dwExtraInfo);

  public const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
  public const uint MOUSEEVENTF_LEFTUP = 0x0004;
  public const uint MOUSEEVENTF_RIGHTDOWN = 0x0008;
  public const uint MOUSEEVENTF_RIGHTUP = 0x0010;
}
"@

function Get-LogasMainWindow {
  $script:foundWindow = $null

  $enum = [StartWin32+EnumWindowsProc]{
    param([IntPtr]$hWnd, [IntPtr]$lParam)

    $classBuilder = New-Object System.Text.StringBuilder 256
    $titleBuilder = New-Object System.Text.StringBuilder 512
    [void][StartWin32]::GetClassName($hWnd, $classBuilder, $classBuilder.Capacity)
    [void][StartWin32]::GetWindowText($hWnd, $titleBuilder, $titleBuilder.Capacity)

    if ($classBuilder.ToString() -eq "TForm1.UnicodeClass" -and $titleBuilder.ToString() -like "LogasAI Analysis*") {
      $script:foundWindow = [pscustomobject]@{
        Handle = $hWnd
        Title = $titleBuilder.ToString()
      }
      return $false
    }

    return $true
  }

  [void][StartWin32]::EnumWindows($enum, [IntPtr]::Zero)
  return $script:foundWindow
}

function Get-ClientPoint {
  param(
    [Parameter(Mandatory = $true)] [IntPtr]$Handle,
    [Parameter(Mandatory = $true)] [double]$NormalizedX,
    [Parameter(Mandatory = $true)] [double]$NormalizedY
  )

  $rect = New-Object StartWin32+RECT
  if (-not [StartWin32]::GetClientRect($Handle, [ref]$rect)) {
    throw "Failed to get client rect."
  }

  $point = New-Object StartWin32+POINT
  $point.X = [int][Math]::Round($NormalizedX * ($rect.Right - $rect.Left))
  $point.Y = [int][Math]::Round($NormalizedY * ($rect.Bottom - $rect.Top))

  if (-not [StartWin32]::ClientToScreen($Handle, [ref]$point)) {
    throw "Failed to convert client coords to screen coords."
  }

  return $point
}

function Get-OffsetPoint {
  param(
    [Parameter(Mandatory = $true)] $Point,
    [Parameter(Mandatory = $true)] [IntPtr]$Handle,
    [Parameter(Mandatory = $true)] [double]$NormalizedOffsetX,
    [Parameter(Mandatory = $true)] [double]$NormalizedOffsetY
  )

  $rect = New-Object StartWin32+RECT
  if (-not [StartWin32]::GetClientRect($Handle, [ref]$rect)) {
    throw "Failed to get client rect."
  }

  $offsetPoint = New-Object StartWin32+POINT
  $offsetPoint.X = $Point.X + [int][Math]::Round($NormalizedOffsetX * ($rect.Right - $rect.Left))
  $offsetPoint.Y = $Point.Y + [int][Math]::Round($NormalizedOffsetY * ($rect.Bottom - $rect.Top))
  return $offsetPoint
}

function Invoke-LeftClick {
  param([Parameter(Mandatory = $true)] $Point)

  [void][StartWin32]::SetCursorPos($Point.X, $Point.Y)
  Start-Sleep -Milliseconds 120
  [StartWin32]::mouse_event([StartWin32]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, [UIntPtr]::Zero)
  Start-Sleep -Milliseconds 60
  [StartWin32]::mouse_event([StartWin32]::MOUSEEVENTF_LEFTUP, 0, 0, 0, [UIntPtr]::Zero)
}

function Invoke-RightClick {
  param([Parameter(Mandatory = $true)] $Point)

  [void][StartWin32]::SetCursorPos($Point.X, $Point.Y)
  Start-Sleep -Milliseconds 120
  [StartWin32]::mouse_event([StartWin32]::MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, [UIntPtr]::Zero)
  Start-Sleep -Milliseconds 60
  [StartWin32]::mouse_event([StartWin32]::MOUSEEVENTF_RIGHTUP, 0, 0, 0, [UIntPtr]::Zero)
}

$mainWindow = Get-LogasMainWindow
if (-not $mainWindow) {
  throw "LogasAI Analysis window was not found."
}

[void][StartWin32]::SetForegroundWindow($mainWindow.Handle)
Start-Sleep -Milliseconds 250

$bannerPoint = Get-ClientPoint -Handle $mainWindow.Handle -NormalizedX $BannerX -NormalizedY $BannerY
$playPoint = Get-ClientPoint -Handle $mainWindow.Handle -NormalizedX $PlayX -NormalizedY $PlayY

Invoke-RightClick -Point $bannerPoint
Start-Sleep -Milliseconds $MenuOpenDelayMs

$methodPoint = switch ($Method) {
  1 { Get-OffsetPoint -Point $bannerPoint -Handle $mainWindow.Handle -NormalizedOffsetX $MethodMenuOffsetX -NormalizedOffsetY $Method1OffsetY }
  2 { Get-OffsetPoint -Point $bannerPoint -Handle $mainWindow.Handle -NormalizedOffsetX $MethodMenuOffsetX -NormalizedOffsetY $Method2OffsetY }
  default { throw "Only methods 1 and 2 are supported." }
}

Invoke-LeftClick -Point $methodPoint
Start-Sleep -Milliseconds $AfterMethodDelayMs
Invoke-LeftClick -Point $playPoint
Start-Sleep -Milliseconds $AfterPlayDelayMs

[pscustomobject]@{
  method = $Method
  title = $mainWindow.Title
  banner = @{ x = $bannerPoint.X; y = $bannerPoint.Y }
  methodPoint = @{ x = $methodPoint.X; y = $methodPoint.Y }
  play = @{ x = $playPoint.X; y = $playPoint.Y }
} | ConvertTo-Json -Compress
