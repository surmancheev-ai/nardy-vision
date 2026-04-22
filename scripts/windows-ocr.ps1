param(
  [Parameter(Mandatory = $true)]
  [string]$ImagePath
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $ImagePath)) {
  throw "Изображение не найдено: $ImagePath"
}

Add-Type -AssemblyName System.Runtime.WindowsRuntime

$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime]
$null = [Windows.Storage.FileAccessMode, Windows.Storage, ContentType=WindowsRuntime]
$null = [Windows.Storage.Streams.IRandomAccessStream, Windows.Storage, ContentType=WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Foundation, ContentType=WindowsRuntime]
$null = [Windows.Graphics.Imaging.SoftwareBitmap, Windows.Foundation, ContentType=WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType=WindowsRuntime]
$null = [Windows.Media.Ocr.OcrResult, Windows.Foundation, ContentType=WindowsRuntime]

function Await-Result {
  param(
    [Parameter(Mandatory = $true)] [object]$AsyncOperation,
    [Parameter(Mandatory = $true)] [Type]$ResultType
  )

  $method = [System.WindowsRuntimeSystemExtensions].GetMethods() |
    Where-Object {
      $_.Name -eq "AsTask" -and
      $_.IsGenericMethodDefinition -and
      $_.GetParameters().Count -eq 1 -and
      $_.GetGenericArguments().Count -eq 1
    } |
    Select-Object -First 1

  if (-not $method) {
    throw "Не удалось найти generic-метод AsTask для WinRT."
  }

  $genericMethod = $method.MakeGenericMethod(@($ResultType))
  return $genericMethod.Invoke($null, @($AsyncOperation)).Result
}

$resolvedPath = (Resolve-Path -LiteralPath $ImagePath).Path
$file = Await-Result ([Windows.Storage.StorageFile]::GetFileFromPathAsync($resolvedPath)) ([Windows.Storage.StorageFile])
$stream = Await-Result ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
$decoder = Await-Result ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
$bitmap = Await-Result ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
$ocrResult = Await-Result ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])

[pscustomobject]@{
  path = $resolvedPath
  text = $ocrResult.Text
  lines = @(
    foreach ($line in $ocrResult.Lines) {
      [pscustomobject]@{
        text = $line.Text
        words = @(
          foreach ($word in $line.Words) {
            [pscustomobject]@{
              text = $word.Text
              bounds = [pscustomobject]@{
                x = $word.BoundingRect.X
                y = $word.BoundingRect.Y
                width = $word.BoundingRect.Width
                height = $word.BoundingRect.Height
              }
            }
          }
        )
      }
    }
  )
} | ConvertTo-Json -Depth 8
