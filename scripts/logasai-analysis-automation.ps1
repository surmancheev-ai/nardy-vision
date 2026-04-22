param(
  [ValidateSet("import-current-mat", "confirm-import-open", "confirm-save-result", "start-analysis", "full-sequence", "next-move", "previous-move", "first-move", "last-move")]
  [string]$Action = "start-analysis",

  [ValidateSet(1, 2)]
  [int]$Method = 1,

  [double]$BannerX = 0.075,
  [double]$BannerY = 0.085,
  [double]$PlayX = 0.082,
  [double]$PlayY = 0.028,
  [double]$MethodMenuOffsetX = 0.05,
  [double]$Method1OffsetY = 0.03,
  [double]$Method2OffsetY = 0.055,

  [int]$ImportDialogDelayMs = 450,
  [int]$AfterImportDelayMs = 900,
  [int]$MenuOpenDelayMs = 350,
  [int]$AfterMethodDelayMs = 350,
  [int]$AfterPlayDelayMs = 500,
  [int]$DialogTimeoutMs = 5000,
  [int]$DialogPollMs = 150
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes

Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;

public static class Win32 {
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

  [DllImport("user32.dll")]
  public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);

  [DllImport("user32.dll", CharSet=CharSet.Unicode)]
  public static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);

  [DllImport("user32.dll", CharSet=CharSet.Unicode)]
  public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

  [DllImport("user32.dll")]
  public static extern bool SetForegroundWindow(IntPtr hWnd);

  [DllImport("user32.dll")]
  public static extern IntPtr SendMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

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
  public const uint WM_COMMAND = 0x0111;
}
"@

function Get-LogasMainWindow {
  $script:foundWindow = $null

  $enum = [Win32+EnumWindowsProc]{
    param([IntPtr]$hWnd, [IntPtr]$lParam)

    $windowProcessId = [uint32]0
    [void][Win32]::GetWindowThreadProcessId($hWnd, [ref]$windowProcessId)

    $classBuilder = New-Object System.Text.StringBuilder 256
    $titleBuilder = New-Object System.Text.StringBuilder 512
    [void][Win32]::GetClassName($hWnd, $classBuilder, $classBuilder.Capacity)
    [void][Win32]::GetWindowText($hWnd, $titleBuilder, $titleBuilder.Capacity)

    if ($classBuilder.ToString() -eq "TForm1.UnicodeClass" -and $titleBuilder.ToString() -like "LogasAI Analysis*") {
      $script:foundWindow = [pscustomobject]@{
        Handle = $hWnd
        ProcessId = $windowProcessId
        Title = $titleBuilder.ToString()
      }
      return $false
    }

    return $true
  }

  [void][Win32]::EnumWindows($enum, [IntPtr]::Zero)
  return $script:foundWindow
}

function Get-WindowByTitlePattern {
  param(
    [Parameter(Mandatory = $true)] [string]$TitlePattern,
    [string]$ClassName = "",
    [int]$TimeoutMs = 5000,
    [int]$PollMs = 150
  )

  $startedAt = [Environment]::TickCount64
  do {
    $script:foundWindow = $null

    $enum = [Win32+EnumWindowsProc]{
      param([IntPtr]$hWnd, [IntPtr]$lParam)

      $classBuilder = New-Object System.Text.StringBuilder 256
      $titleBuilder = New-Object System.Text.StringBuilder 512
      [void][Win32]::GetClassName($hWnd, $classBuilder, $classBuilder.Capacity)
      [void][Win32]::GetWindowText($hWnd, $titleBuilder, $titleBuilder.Capacity)

      $title = $titleBuilder.ToString()
      $class = $classBuilder.ToString()

      if ($title -like $TitlePattern -and ([string]::IsNullOrWhiteSpace($ClassName) -or $class -eq $ClassName)) {
        $script:foundWindow = [pscustomobject]@{
          Handle = $hWnd
          Title = $title
          ClassName = $class
        }
        return $false
      }

      return $true
    }

    [void][Win32]::EnumWindows($enum, [IntPtr]::Zero)

    if ($script:foundWindow) {
      return $script:foundWindow
    }

    Start-Sleep -Milliseconds $PollMs
  } while (([Environment]::TickCount64 - $startedAt) -lt $TimeoutMs)

  return $null
}

function Get-ClientPoint {
  param(
    [Parameter(Mandatory = $true)] [IntPtr]$Handle,
    [Parameter(Mandatory = $true)] [double]$NormalizedX,
    [Parameter(Mandatory = $true)] [double]$NormalizedY
  )

  $rect = New-Object Win32+RECT
  if (-not [Win32]::GetClientRect($Handle, [ref]$rect)) {
    throw "Не удалось получить клиентскую область окна."
  }

  $width = $rect.Right - $rect.Left
  $height = $rect.Bottom - $rect.Top

  $point = New-Object Win32+POINT
  $point.X = [int][Math]::Round($NormalizedX * $width)
  $point.Y = [int][Math]::Round($NormalizedY * $height)

  if (-not [Win32]::ClientToScreen($Handle, [ref]$point)) {
    throw "Не удалось преобразовать координаты окна в экранные."
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

  $rect = New-Object Win32+RECT
  if (-not [Win32]::GetClientRect($Handle, [ref]$rect)) {
    throw "Не удалось получить клиентскую область окна."
  }

  $width = $rect.Right - $rect.Left
  $height = $rect.Bottom - $rect.Top

  $offsetPoint = New-Object Win32+POINT
  $offsetPoint.X = $Point.X + [int][Math]::Round($NormalizedOffsetX * $width)
  $offsetPoint.Y = $Point.Y + [int][Math]::Round($NormalizedOffsetY * $height)
  return $offsetPoint
}

function Invoke-LeftClick {
  param([Parameter(Mandatory = $true)] $Point)

  [void][Win32]::SetCursorPos($Point.X, $Point.Y)
  Start-Sleep -Milliseconds 120
  [Win32]::mouse_event([Win32]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, [UIntPtr]::Zero)
  Start-Sleep -Milliseconds 60
  [Win32]::mouse_event([Win32]::MOUSEEVENTF_LEFTUP, 0, 0, 0, [UIntPtr]::Zero)
}

function Invoke-RightClick {
  param([Parameter(Mandatory = $true)] $Point)

  [void][Win32]::SetCursorPos($Point.X, $Point.Y)
  Start-Sleep -Milliseconds 120
  [Win32]::mouse_event([Win32]::MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, [UIntPtr]::Zero)
  Start-Sleep -Milliseconds 60
  [Win32]::mouse_event([Win32]::MOUSEEVENTF_RIGHTUP, 0, 0, 0, [UIntPtr]::Zero)
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

  $buttons = $root.FindAll(
    [System.Windows.Automation.TreeScope]::Descendants,
    [System.Windows.Automation.Condition]::TrueCondition
  )

  $candidates = @()
  foreach ($button in $buttons) {
    if ($button.Current.ClassName -ne "Button") {
      continue
    }
    $bounds = $button.Current.BoundingRectangle
    if ($bounds.Width -lt 50 -or $bounds.Height -lt 18) {
      continue
    }
    $candidates += [pscustomobject]@{
      Element = $button
      X = $bounds.Left
      Y = $bounds.Top
      Width = $bounds.Width
      Height = $bounds.Height
      Name = $button.Current.Name
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

function Invoke-DialogButton {
  param(
    [Parameter(Mandatory = $true)] [string]$DialogKind
  )

  $dialogWindow = Get-WindowByTitlePattern -TitlePattern "*" -ClassName "#32770" -TimeoutMs $DialogTimeoutMs -PollMs $DialogPollMs
  if (-not $dialogWindow) {
    throw "Не найден стандартный диалог Windows для действия '$DialogKind'."
  }

  [void][Win32]::SetForegroundWindow($dialogWindow.Handle)
  Start-Sleep -Milliseconds 120

  $buttonElement = Find-DialogButton -Handle $dialogWindow.Handle -ButtonRole "primary"
  if (-not $buttonElement) {
    throw "Не удалось найти основную кнопку в стандартном диалоге '$($dialogWindow.Title)'."
  }

  $bounds = $buttonElement.Current.BoundingRectangle
  $point = New-Object Win32+POINT
  $point.X = [int][Math]::Round($bounds.Left + ($bounds.Width / 2))
  $point.Y = [int][Math]::Round($bounds.Top + ($bounds.Height / 2))
  Invoke-LeftClick -Point $point

  return [pscustomobject]@{
    dialogTitle = $dialogWindow.Title
    button = $buttonElement.Current.Name
    dialogKind = $DialogKind
    x = $point.X
    y = $point.Y
  }
}

function Start-AnalysisRun {
  param([Parameter(Mandatory = $true)] [IntPtr]$Handle)

  [void][Win32]::SetForegroundWindow($Handle)
  Start-Sleep -Milliseconds 250

  $bannerPoint = Get-ClientPoint -Handle $Handle -NormalizedX $BannerX -NormalizedY $BannerY
  $playPoint = Get-ClientPoint -Handle $Handle -NormalizedX $PlayX -NormalizedY $PlayY

  Invoke-RightClick -Point $bannerPoint
  Start-Sleep -Milliseconds $MenuOpenDelayMs

  $methodPoint = switch ($Method) {
    1 { Get-OffsetPoint -Point $bannerPoint -Handle $Handle -NormalizedOffsetX $MethodMenuOffsetX -NormalizedOffsetY $Method1OffsetY }
    2 { Get-OffsetPoint -Point $bannerPoint -Handle $Handle -NormalizedOffsetX $MethodMenuOffsetX -NormalizedOffsetY $Method2OffsetY }
    default { throw "Поддерживаются только методы 1 и 2." }
  }

  Invoke-LeftClick -Point $methodPoint
  Start-Sleep -Milliseconds $AfterMethodDelayMs
  Invoke-LeftClick -Point $playPoint
  Start-Sleep -Milliseconds $AfterPlayDelayMs
}

function Import-CurrentMat {
  param([Parameter(Mandatory = $true)] [IntPtr]$Handle)

  [void][Win32]::SetForegroundWindow($Handle)
  Start-Sleep -Milliseconds 250
  [void][Win32]::SendMessage($Handle, [Win32]::WM_COMMAND, [IntPtr]6, [IntPtr]::Zero)
  Start-Sleep -Milliseconds $ImportDialogDelayMs
}

function Invoke-DialogButtonRobust {
  param(
    [Parameter(Mandatory = $true)] [string]$DialogKind
  )

  $titlePattern = switch ($DialogKind) {
    "import-open" { "Импортировать матч из файла*" }
    "save-result" { "Сохранить анализ в файл*" }
    default { "*" }
  }

  $dialogWindow = Get-WindowByTitlePattern -TitlePattern $titlePattern -ClassName "#32770" -TimeoutMs $DialogTimeoutMs -PollMs $DialogPollMs
  if (-not $dialogWindow -and $DialogKind -eq "import-open") {
    $dialogWindow = Get-WindowByTitlePattern -TitlePattern "*" -ClassName "#32770" -TimeoutMs $DialogTimeoutMs -PollMs $DialogPollMs
  }
  if (-not $dialogWindow) {
    throw "Не найден стандартный диалог Windows для действия '$DialogKind'."
  }

  [void][Win32]::SetForegroundWindow($dialogWindow.Handle)
  Start-Sleep -Milliseconds 120

  $buttonElement = Find-DialogButton -Handle $dialogWindow.Handle -ButtonRole "primary"
  if (-not $buttonElement) {
    throw "Не удалось найти основную кнопку в стандартном диалоге '$($dialogWindow.Title)'."
  }

  $bounds = $buttonElement.Current.BoundingRectangle
  $point = New-Object Win32+POINT
  $point.X = [int][Math]::Round($bounds.Left + ($bounds.Width / 2))
  $point.Y = [int][Math]::Round($bounds.Top + ($bounds.Height / 2))
  Invoke-LeftClick -Point $point

  return [pscustomobject]@{
    dialogTitle = $dialogWindow.Title
    button = $buttonElement.Current.Name
    dialogKind = $DialogKind
    x = $point.X
    y = $point.Y
  }
}

function Invoke-MoveNavigation {
  param([Parameter(Mandatory = $true)] [IntPtr]$Handle)

  [void][Win32]::SetForegroundWindow($Handle)
  Start-Sleep -Milliseconds 200

  switch ($Action) {
    "next-move" { [System.Windows.Forms.SendKeys]::SendWait("{DOWN}") }
    "previous-move" { [System.Windows.Forms.SendKeys]::SendWait("{UP}") }
    "first-move" { [System.Windows.Forms.SendKeys]::SendWait("^{HOME}") }
    "last-move" { [System.Windows.Forms.SendKeys]::SendWait("^{END}") }
  }
}

$mainWindow = Get-LogasMainWindow
if (-not $mainWindow) {
  throw "Окно LogasAI Analysis не найдено."
}

switch ($Action) {
  "import-current-mat" { Import-CurrentMat -Handle $mainWindow.Handle }
  "confirm-import-open" {
    $dialogAction = Invoke-DialogButtonRobust -DialogKind "import-open"
    Start-Sleep -Milliseconds $AfterImportDelayMs
  }
  "confirm-save-result" {
    $dialogAction = Invoke-DialogButtonRobust -DialogKind "save-result"
    Start-Sleep -Milliseconds $AfterPlayDelayMs
  }
  "start-analysis" { Start-AnalysisRun -Handle $mainWindow.Handle }
  "full-sequence" {
    Import-CurrentMat -Handle $mainWindow.Handle
    $importDialogAction = Invoke-DialogButtonRobust -DialogKind "import-open"
    Start-Sleep -Milliseconds $AfterImportDelayMs
    Start-AnalysisRun -Handle $mainWindow.Handle
    $saveDialogAction = Invoke-DialogButtonRobust -DialogKind "save-result"
    Start-Sleep -Milliseconds $AfterPlayDelayMs
  }
  default { Invoke-MoveNavigation -Handle $mainWindow.Handle }
}

$clientBannerPoint = Get-ClientPoint -Handle $mainWindow.Handle -NormalizedX $BannerX -NormalizedY $BannerY
$clientPlayPoint = Get-ClientPoint -Handle $mainWindow.Handle -NormalizedX $PlayX -NormalizedY $PlayY

[pscustomobject]@{
  action = $Action
  method = $Method
  title = $mainWindow.Title
  bannerX = $clientBannerPoint.X
  bannerY = $clientBannerPoint.Y
  playX = $clientPlayPoint.X
  playY = $clientPlayPoint.Y
  methodMenuOffsetX = $MethodMenuOffsetX
  method1OffsetY = $Method1OffsetY
  method2OffsetY = $Method2OffsetY
  dialogAction = $dialogAction
  importDialogAction = $importDialogAction
  saveDialogAction = $saveDialogAction
} | ConvertTo-Json -Depth 4
