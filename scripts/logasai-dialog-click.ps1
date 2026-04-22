param(
  [ValidateSet("primary", "secondary")]
  [string]$ButtonRole = "primary",

  [int]$TimeoutMs = 5000,
  [int]$PollMs = 150
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes

Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;

public static class DialogWin32 {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

  [DllImport("user32.dll")]
  public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

  [DllImport("user32.dll")]
  public static extern bool IsWindowVisible(IntPtr hWnd);

  [DllImport("user32.dll", CharSet=CharSet.Unicode)]
  public static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);

  [DllImport("user32.dll", CharSet=CharSet.Unicode)]
  public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

  [DllImport("user32.dll")]
  public static extern bool SetForegroundWindow(IntPtr hWnd);

  [DllImport("user32.dll")]
  public static extern bool SetCursorPos(int X, int Y);

  [DllImport("user32.dll")]
  public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, UIntPtr dwExtraInfo);

  public const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
  public const uint MOUSEEVENTF_LEFTUP = 0x0004;
}
"@

function Get-TopDialogWindow {
  param(
    [int]$TimeoutMs = 5000,
    [int]$PollMs = 150
  )

  $startedAt = [Environment]::TickCount64
  do {
    $script:dialogs = @()

    $enum = [DialogWin32+EnumWindowsProc]{
      param([IntPtr]$hWnd, [IntPtr]$lParam)

      if (-not [DialogWin32]::IsWindowVisible($hWnd)) {
        return $true
      }

      $classBuilder = New-Object System.Text.StringBuilder 256
      $titleBuilder = New-Object System.Text.StringBuilder 512
      [void][DialogWin32]::GetClassName($hWnd, $classBuilder, $classBuilder.Capacity)
      [void][DialogWin32]::GetWindowText($hWnd, $titleBuilder, $titleBuilder.Capacity)

      if ($classBuilder.ToString() -eq "#32770") {
        $script:dialogs += [pscustomobject]@{
          Handle = $hWnd
          Title = $titleBuilder.ToString()
        }
      }

      return $true
    }

    [void][DialogWin32]::EnumWindows($enum, [IntPtr]::Zero)

    if ($script:dialogs.Count -gt 0) {
      $preferred = $script:dialogs | Where-Object { $_.Title -notlike "_SoftwareUpdateNotificationService_*" } | Select-Object -First 1
      if ($preferred) {
        return $preferred
      }
      return $script:dialogs | Select-Object -First 1
    }

    Start-Sleep -Milliseconds $PollMs
  } while (([Environment]::TickCount64 - $startedAt) -lt $TimeoutMs)

  return $null
}

function Find-DialogButton {
  param(
    [Parameter(Mandatory = $true)] [IntPtr]$Handle,
    [ValidateSet("primary", "secondary")]
    [string]$ButtonRole = "primary"
  )

  $root = [System.Windows.Automation.AutomationElement]::FromHandle($Handle)
  if (-not $root) {
    return $null
  }

  $elements = $root.FindAll(
    [System.Windows.Automation.TreeScope]::Descendants,
    [System.Windows.Automation.Condition]::TrueCondition
  )

  $candidates = @()
  foreach ($element in $elements) {
    if ($element.Current.ClassName -ne "Button") {
      continue
    }

    $bounds = $element.Current.BoundingRectangle
    if ($bounds.Width -lt 50 -or $bounds.Height -lt 18) {
      continue
    }

    $candidates += [pscustomobject]@{
      Element = $element
      X = $bounds.Left
      Y = $bounds.Top
      Width = $bounds.Width
      Height = $bounds.Height
      Name = $element.Current.Name
    }
  }

  if (-not $candidates) {
    return $null
  }

  $maxX = ($candidates | Measure-Object -Property X -Maximum).Maximum
  $rightCluster = $candidates | Where-Object { $_.X -ge ($maxX - 120) }
  if (-not $rightCluster) {
    $rightCluster = $candidates
  }

  if ($ButtonRole -eq "secondary") {
    return ($rightCluster | Sort-Object Y -Descending | Select-Object -First 1).Element
  }

  return ($rightCluster | Sort-Object Y | Select-Object -First 1).Element
}

function Invoke-LeftClick {
  param([Parameter(Mandatory = $true)] $Point)

  [void][DialogWin32]::SetCursorPos($Point.X, $Point.Y)
  Start-Sleep -Milliseconds 120
  [DialogWin32]::mouse_event([DialogWin32]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, [UIntPtr]::Zero)
  Start-Sleep -Milliseconds 60
  [DialogWin32]::mouse_event([DialogWin32]::MOUSEEVENTF_LEFTUP, 0, 0, 0, [UIntPtr]::Zero)
}

$dialog = Get-TopDialogWindow -TimeoutMs $TimeoutMs -PollMs $PollMs
if (-not $dialog) {
  throw "No standard Windows dialog is currently open."
}

[void][DialogWin32]::SetForegroundWindow($dialog.Handle)
Start-Sleep -Milliseconds 120

$buttonElement = Find-DialogButton -Handle $dialog.Handle -ButtonRole $ButtonRole
if (-not $buttonElement) {
  throw "No dialog button matched role '$ButtonRole' in '$($dialog.Title)'."
}

$bounds = $buttonElement.Current.BoundingRectangle
$point = [pscustomobject]@{
  X = [int][Math]::Round($bounds.Left + ($bounds.Width / 2))
  Y = [int][Math]::Round($bounds.Top + ($bounds.Height / 2))
}

Invoke-LeftClick -Point $point

[pscustomobject]@{
  dialogTitle = $dialog.Title
  button = $buttonElement.Current.Name
  x = $point.X
  y = $point.Y
} | ConvertTo-Json -Compress
